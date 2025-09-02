//----------------------------------------
// ERROR UTILS
//----------------------------------------
import { configFn } from './config'
import { isset } from './isset'
import { isEmpty } from './is-empty'
import { ErrorOptions } from './types'
import { cleanStackTrace } from './clean-stack-trace'
import { C } from './logger-utils'
export { type ErrorOptions } from './types'
import { removeCircularJSONstringify } from './remove-circular-json-stringify'
import { generateToken } from './string-utils'
import { isObject } from './is-object'

export function errIfNotSet(objOfVarNamesWithValues: Record<string, any>) { return errXXXIfNotSet(422, false, objOfVarNamesWithValues) }

export function err500IfNotSet(objOfVarNamesWithValues: Record<string, any>) { return errXXXIfNotSet(500, false, objOfVarNamesWithValues) }

export function errIfEmptyOrNotSet(objOfVarNamesWithValues: Record<string, any>) { return errXXXIfNotSet(422, true, objOfVarNamesWithValues) }

export function err500IfEmptyOrNotSet(objOfVarNamesWithValues: Record<string, any>) { return errXXXIfNotSet(500, true, objOfVarNamesWithValues) }

export function errXXXIfNotSet(errCode: number, checkEmpty: boolean, objOfVarNamesWithValues: Record<string, any>) {
    const missingVars: string[] = []
    for (const prop in objOfVarNamesWithValues) {
        if (!isset(objOfVarNamesWithValues[prop]) || (checkEmpty && isEmpty(objOfVarNamesWithValues[prop]))) missingVars.push(prop)
    }
    if (missingVars.length) throw new DescriptiveError(`requiredVariableEmptyOrNotSet`, { code: errCode, origin: 'Validator', varNames: missingVars.join(', ') })
}


export function err422IfNotSet(o: Record<string, any>) {
    const m: any[] = []
    for (const p in o) if (!isset(o[p])) m.push(p)
    if (m.length) throw new DescriptiveError(`requiredVariableEmptyOrNotSet`, { code: 422, origin: 'Validator', varNames: m.join(', ') })
}

/** Works natively with sync AND async functions */
export function tryCatch<T>(callback: () => T, onErr: Function = () => { /** */ }): T {
    try {
        const result = callback()
        if (result instanceof Promise) return result.catch(e => onErr(e)) as T
        else return result
    } catch (err) {
        return onErr(err)
    }
}

export const failSafe = tryCatch // ALIAS

function extraInfosRendererDefault(extraInfos: Record<string, any>) {
    return [
        '== EXTRA INFOS ==',
        removeCircularJSONstringify({ ...extraInfos, message: undefined, stack: undefined, originalError: undefined, hasBeenLogged: undefined, logs: undefined }, 2)
    ]
}



export class DescriptiveError<ExpectedOriginalError = any> extends Error {
    /** Full error infos, extra infos + message and code...etc as object */
    errorDescription: {
        /** used to uniquely identify the error */
        id: string
        /** Http error code if any */
        code: number
        message: string
        /** The parent error if any */
        originalError?: Error | Record<string, any> | DescriptiveError
        [k: string]: any
    } = {} as any
    /** The parent error if any */
    originalError: ExpectedOriginalError = {} as any
    /** used to uniquely identify the error */
    id: string = generateToken(24, true)
    /** Http code. Eg: 404, 403... */
    code?: number
    message: string
    options: ErrorOptions
    /** Logging of the error is async, unless disabled, so that it wait one frame to allow to log it manually */
    hasBeenLogged = false
    isAxiosError = false
    doNotLog = false // just an alias for the above, actually using this one can be more readable in some situations
    logs: string[] = []

    readonly isDescriptiveError = true

    /** This for client usage, and is not used by DescriptiveError. It can be used to mark an error as handled by your system. */
    isHandled = false

    constructor(message: string, options: ErrorOptions = {}) {
        super(message)
        delete options.errMsgId
        this.message = message

        this.isAxiosError = (options?.err?.stack || options.stack)?.startsWith('Axios') || false

        const { doNotWaitOneFrameForLog = options.code === 500, ...optionsClean } = options
        this.options = optionsClean
        if (optionsClean.err) {
            // ORIGINAL ERROR
            if (typeof optionsClean.err !== 'string') optionsClean.err.hasBeenLogged = true
            // get props from prototype to be in actual error object for further manipulation
            optionsClean.err = { message: optionsClean.err.message, stack: optionsClean.err.stack, ...optionsClean.err }
        }

        this.parseError() // make sure to parse it before any log or reuse

        this.hasBeenLogged = false

        if (doNotWaitOneFrameForLog) this.log()
        else setTimeout(() => {
            // wait one event loop because it can be catched in a parent module
            // and it can be logged manually sometimes
            if (!this.hasBeenLogged) this.log()
        })

        const { onError } = configFn()
        if (typeof onError === 'function') onError(message, options)

    }
    /** Compute extraInfos and parse options */
    parseError(forCli = false) {

        const errorLogs: string[] = []

        const { err, noStackTrace = false, ressource, extraInfosRenderer = extraInfosRendererDefault, maskForFront, ...extraInfosRaw } = this.options
        let { code } = this.options
        const extraInfos = {
            id: this.id,
            ...extraInfosRaw,
            // additionnal extra info passed from parent error
            ...(this.options.extraInfos || {}),
        }

        this.code = code || 500

        if (this.options.doNotDisplayCode || (this.options.hasOwnProperty('code') && !isset(this.options.code))) delete this.code

        if (!isset(extraInfos.value) && this.options.hasOwnProperty('value')) extraInfos.value = 'undefined'
        if (!isset(extraInfos.gotValue) && this.options.hasOwnProperty('gotValue')) extraInfos.gotValue = 'undefined'

        this.isAxiosError = this.isAxiosError || (extraInfos?.err?.stack || extraInfos.stack || this.stack)?.startsWith('Axios') || false

        if (this.isAxiosError) {
            // trying to extract response
            extraInfos.responseData = err && 'response' in err ? err.response.data : extraInfos.response?.data
        }

        if (isset(ressource)) {
            code = 404
            if (this.message === '404') this.message = `Ressource ${ressource} not found`
            extraInfos.ressource = ressource
        }

        errorLogs.push(computeErrorMessage(this))

        const extraInfosForLogs = { ...extraInfos, ...(isObject(maskForFront) ? maskForFront : { maskForFront }) }
        if (Object.keys(extraInfosForLogs).length > 0) {
            errorLogs.push(...extraInfosRenderer(extraInfosForLogs))
        }

        if (err) {
            // actually, passing by there mean THE ERROR HAS BEEN CATCHED
            this.originalError = err
            errorLogs.push('== ORIGINAL ERROR ==')
            errorLogs.push(computeErrorMessage(err))
            if (typeof err.parseError === 'function' || Array.isArray(err?.logs)) {
                // The catched error is a DescriptiveError so from
                // there we prevent further logs/ outpus from error
                err.hasBeenLogged = true // this will be logged in the child error so we dont want it to be logged twice
                err.doNotLog = true
                const logFromOtherErr = err?.logs || err?.parseError?.(forCli) || []
                const [, ...errToLog] = logFromOtherErr
                errorLogs.push(...errToLog)
            } else {
                errorLogs.push(removeCircularJSONstringify({ ...err, hasBeenLogged: undefined }))
                if (!noStackTrace && err.stack) errorLogs.push(cleanStackTrace(err.stack))
                if (err.extraInfos) errorLogs.push(removeCircularJSONstringify(err.extraInfos))
            }
        } else {
            if (!noStackTrace) {
                const stackTranceClean = cleanStackTrace(extraInfosRaw.stack || this.stack)
                errorLogs.push(forCli ? C.dim(stackTranceClean) : stackTranceClean)
            }
        }

        // THIS is used to access error as object
        this.code = code || 500
        if (this.options.doNotDisplayCode || (this.options.hasOwnProperty('code') && !isset(this.options.code))) delete this.code
        this.errorDescription = {
            id: this.id,
            message: this.message,
            code,
            ressource,
            originalError: err,
            maskForFront,
            ...extraInfos,
        }

        this.logs = errorLogs

        return errorLogs
    }
    log() {
        this.parseError() // re parse it in case it has been updated from the outside (eg: adding extraInfos)
        const err = new Error()
        err.message = this.logs.join('\n')
        err.stack = cleanStackTrace(this.stack)
        if (this.hasBeenLogged === false && this.doNotLog === false) {
            // Do not log "this" since in C.error this.log will get called.
            // This has the advantage of parsing logs when logging a
            // C.error(DescriptiveError) (calling err.log())
            // And prevent an infinite loop
            C.error(err)
        }
        this.hasBeenLogged = true
    }
    toString() {
        return this.logs.join('\n')
    }
    toJSON() {
        return this.toString()
    }
}

function computeErrorMessage(err: any) {
    return (err.code ? err.code + ' ' : '') + (err.msg || err.message)
}