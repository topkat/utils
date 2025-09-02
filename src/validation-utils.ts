//----------------------------------------
// VALIDATION UTILS
//----------------------------------------
import { isset } from './isset'
import { isDateIsoOrObjectValid, isDateIntOrStringValid, isTimeStringValid } from './date-utils'
import { asArray } from './array-utils'
import { configFn } from './config'
import { isEmpty } from './is-empty'
import { DescriptiveError } from './error-utils'
import { removeCircularJSONstringify } from './remove-circular-json-stringify'

export type BaseTypes = 'objectId' | 'dateInt6' | 'dateInt' | 'dateInt8' | 'dateInt12' | 'time' | 'humanReadableTimestamp' | 'date' | 'dateObject' | 'array' | 'object' | 'buffer' | 'string' | 'function' | 'boolean' | 'number' | 'bigint' | 'year' | 'email' | 'any'

export function issetOr(...elms: any[]) { return elms.some(elm => typeof elm !== 'undefined' && elm !== null) }

export function isEmptyOrNotSet(...elms: any[]) { return elms.some(elm => !isset(elm) || isEmpty(elm)) }

export function isDateObject(variable: any[]) { return variable instanceof Date }

/** Check all values are set */
export function checkAllObjectValuesAreEmpty(o: Record<string, any>) { return Object.values(o).every(value => !isset(value)) }

/** Throw an error in case data passed is not a valid ctx */
export function checkCtxIntegrity(ctx: Record<string, any>) {
    if (!isset(ctx) || !isset(ctx.user)) throw new DescriptiveError('ctxNotSet', { code: 500 })
}

/**
## VALIDATOR

@name validator

@description support multiple names, multiple values and multiple type check
@option if nameString ends by $ sign it is considered optional

@function validator([Objects])
@return {error|true/false|testMode} depend on mode (see prop mode)
@param {} mode normal (default) | test (TODO) | boolean
@param {} name 'myName' || [{myVar1: 'blah, myvar2: myvar2}], support multiple names / values
@param {} value myVar,
@param {string} myVar myVar, instead of name / value
@param {array} in ['blah', 'otherPossibleValue', true], equal ONE OF THESE values
@param {any} eq exactly equal to in, both support string or array of values
@param {any} neq not in, both support string or array of values
@param {number} lte 3, less than or equal
@param {number} gte 1, greater or equal
@param {number} lt 3, less than
@param {number} gt 1, greater
@param {string|string[]} type
 * possibleTypes: object, number, string, boolean, array, date, dateInt8, dateInt12, dateInt6, time, objectId (mongo), humanReadableTimestamp, buffer
 * Notes: multiples value is an OR, /!\ Array is type 'array' and not 'object' like in real JS /!\
@param {regExp} regexp /regexp/, test against regexp
@param {number} minLength for string, array or number length
@param {number} maxLength
@param {number} length
@param {boolean} optional default false
@param {boolean} emptyAllowed default false (to use if must be set but can be empty)
@param {boolean} mustNotBeSet this one must not be set
@param {any} includes check if array or string includes value (like js .includes())

@example
    validator(
        { myNumber : 3, type: 'number', gte: 1, lte: 3 }, // use the name directly as a param
        { name: 'email', value: 'nameATsite.com', regexp: /[^\sAT]+AT[^\sAT]+\.[^\sAT]/},
        { name: [{'blahVar': blahVarValue, 'myOtherVar': myOtherVarValue}], type: 'string'} // multiple names for same check
    )
----------------------------------------*/
export type ValidatorObject = {
    name?: string
    value?: any
    type?: BaseTypes
    eq?: any
    neq?: any
    in?: any[]
    lt?: number
    gt?: number
    lte?: number
    gte?: number
    length?: number
    minLength?: number
    maxLength?: number
    emptyAllowed?: boolean
    regexp?: RegExp
    mustNotBeSet?: boolean
    isset?: boolean
    optional?: boolean
    isArray?: boolean
    includes?: any
    [k: string]: any
}
export function validator(...paramsToValidate: ValidatorObject[]) {
    const errArray = validatorReturnErrArray(...paramsToValidate)
    if (errArray.length) throw new DescriptiveError(...(errArray as [string, object]))
}


/** Same as validator but return a boolean
 * See {@link validator}
 */
export function isValid(...paramsToValidate: ValidatorObject[]) {
    const errArray = validatorReturnErrArray(...paramsToValidate)
    return errArray.length ? false : true
}

function parseValueForDisplay(value?: any) {
    try {
        if (value === undefined) return 'undefined'
        else if (value?.data?.data) return { ...value, data: 'Buffer' }
        else return removeCircularJSONstringify(value).substring(0, 999)
    } catch (_) {
        return value
    }
}

/** Default types + custom types
 * 'objectId','dateInt6','dateInt','dateInt8','dateInt12','time','humanReadableTimestamp','date','array','object','buffer','string','function','boolean','number','bigint',
 */
export function isType(value: any, type: BaseTypes) { return isValid({ name: 'Is type check', value, type, emptyAllowed: true }) }

export function validatorReturnErrArray(...paramsToValidate: ValidatorObject[]): [string?, object?] {
    const paramsFormatted: ValidatorObject[] = []

    // support for multiple names with multiple values for one rule. Eg: {name: [{startDate:'20180101'}, {endDate:'20180101'}], type: 'dateInt8'}
    paramsToValidate.forEach(param => {
        if (typeof param !== 'object' || Array.isArray(param))
            throw new DescriptiveError(`wrongTypeForDataValidatorArgument`, { code: 500, origin: 'Generic validator', expectedType: 'object', actualType: Array.isArray(param) ? 'array' : typeof param })

        // parse => name: {myVar1: 'blah, myvar2: myvar2}
        if (typeof param.name === 'object' && !Array.isArray(param.name))
            Object.keys(param.name).forEach(name => paramsFormatted.push(Object.assign({}, param, { name: name, value: param?.name?.[name as any] })))
        else paramsFormatted.push(param)
    })

    for (const paramObj of paramsFormatted) {
        let name = paramObj.name
        const hasValue = paramObj.hasOwnProperty('value')
        let value = paramObj.value
        let optional = paramObj.optional || false
        const emptyAllowed = optional || paramObj.emptyAllowed || false
        if (paramObj.isset === false) paramObj.mustNotBeSet = true // ALIAS
        const errMess = (msg: string, extraInfos = {}, errCode = 422): [string, object] => [msg, { code: errCode, origin: 'Generic validator', varName: name, varType: typeof value, gotValue: parseValueForDisplay(value), ...extraInfos }]

        // accept syntax { 'myVar.var2': myVar.var2, ... }
        if (typeof name !== 'undefined' && !hasValue) {
            name = Object.keys(paramObj).find(param => !['name', 'value', 'type', 'eq', 'neq', 'in', 'lt', 'gt', 'lte', 'gte', 'length', 'minLength', 'maxLength', 'emptyAllowed', 'regexp', 'mustNotBeSet', 'isset', 'optional', 'isArray'].includes(param))
            if (typeof name !== 'undefined') value = paramObj[name]
        }
        // if nameString ends by $ sign it is optional
        if (typeof name !== 'undefined' && /.*\$$/.test(name)) {
            name = name.substr(0, name.length - 1)
            optional = true
        }

        // DEFINED AND NOT EMPTY
        if ((typeof value === 'undefined') && optional) continue
        if (typeof value !== 'undefined' && value !== null && paramObj.mustNotBeSet) return errMess('variableMustNotBeSet')
        if (paramObj.mustNotBeSet) continue // exit
        if (typeof value === 'undefined') return errMess('requiredVariableEmptyOrNotSet')
        if (!emptyAllowed && value === '') return errMess('requiredVariableEmpty')

        const isArray = paramObj.isArray
        if (isArray && !Array.isArray(value)) return errMess('wrongTypeForVar', { expectedType: 'array', gotType: typeof value })

        // TYPE
        if (typeof paramObj.type !== 'undefined') {
            const types = asArray(paramObj.type) // support for multiple type
            const areSomeTypeValid = types.some(type => {
                if (type.endsWith('[]')) {
                    if (!Array.isArray(value)) errMess('wrongTypeForVar', { expectedType: 'array', gotType: typeof value })
                    type = type.replace('[]', '') as typeof type
                }

                const allTypes: Array<BaseTypes> = [
                    'objectId',
                    'dateInt6',
                    'dateInt', // alias for dateInt8
                    'dateInt8',
                    'dateInt12',
                    'time',
                    'humanReadableTimestamp',
                    'date',
                    'dateObject', // alias
                    'array',
                    'object',
                    'buffer',
                    'string',
                    'function',
                    'boolean',
                    'number',
                    'bigint',
                    'year',
                    'any',
                    'email',
                    //...Object.keys(configFn().customTypes)
                ]

                if (!allTypes.includes(type)) throw new DescriptiveError('typeDoNotExist', { code: 500, type })

                const basicTypeCheck = {
                    objectId: (val: any) => /^[0-9a-fA-F-]{24,}$/.test(val), // "0c65940b-6b0c-4dd8-9c7a-7c5fe1ba907a"
                    dateInt6: (val: any) => isDateIntOrStringValid(parseInt(val + '01'), true, 8),
                    dateInt: (val: any) => isDateIntOrStringValid(val, true, 8),
                    dateInt8: (val: any) => isDateIntOrStringValid(val, true, 8),
                    dateInt12: (val: any) => isDateIntOrStringValid(val, true, 12),
                    time: (val: any) => /^\d\d:\d\d$/.test(val) && isTimeStringValid(val),
                    humanReadableTimestamp: (val: any) => (val + '').length === 17,
                    date: (val: any) => isDateIsoOrObjectValid(val, true),
                    dateObject: (val: any) => isDateIsoOrObjectValid(val, true),
                    array: (val: any) => Array.isArray(val),
                    object: (val: any) => !Array.isArray(val) && val !== null && typeof val === type,
                    buffer: (val: any) => Buffer.isBuffer(val),
                    year: (val: any) => /^\d\d\d\d$/.test(val),
                    email: (val: any) => /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]+$/.test(val),
                    any: () => true,
                }

                const typeTyped = type as keyof typeof basicTypeCheck

                return typeof basicTypeCheck?.[typeTyped] !== 'undefined' && basicTypeCheck?.[typeTyped](value) ||
                    typeof value === type && type !== 'object' || // for string, number, boolean...
                    typeof (configFn()?.customTypes as any)?.[typeTyped as any] !== 'undefined' && (configFn()?.customTypes as any)?.[typeTyped as any]?.test(value)
            })
            if (!areSomeTypeValid) return errMess(`wrongTypeForVar`, { expectedTypes: types.join(', '), gotType: Object.prototype.toString.call(value), gotValue: parseValueForDisplay(value) })
        }

        // GREATER / LESS
        if (typeof paramObj.gte !== 'undefined' && value < paramObj.gte) return errMess(`valueShouldBeSuperiorOrEqualForVar`, { shouldBeSupOrEqTo: paramObj.gte })
        if (typeof paramObj.lte !== 'undefined' && value > paramObj.lte) return errMess(`valueShouldBeInferiorOrEqualForVar`, { shouldBeInfOrEqTo: paramObj.lte })
        if (typeof paramObj.gt !== 'undefined' && value <= paramObj.gt) return errMess(`valueShouldBeSuperiorForVar`, { shouldBeSupOrEqTo: paramObj.gt })
        if (typeof paramObj.lt !== 'undefined' && value >= paramObj.lt) return errMess(`valueShouldBeInferiorForVar`, { shouldBeInfOrEqTo: paramObj.lt })

        // IN VALUES
        if (typeof paramObj.in !== 'undefined') {
            const equals = Array.isArray(paramObj.in) ? paramObj.in : [paramObj.in]
            if (!equals.some(equalVal => equalVal === value)) return errMess(`wrongValueForVar`, { supportedValues: parseValueForDisplay(equals) })
        }

        // EQUAL (exact copy of .in)
        if (paramObj.hasOwnProperty('eq')) {
            const equals = Array.isArray(paramObj.eq) ? paramObj.eq : [paramObj.eq]
            if (!equals.some(equalVal => equalVal === value)) return errMess(`wrongValueForVar`, { supportedValues: parseValueForDisplay(equals), })
        }

        // NOT EQUAL
        if (paramObj.hasOwnProperty('neq')) {
            const notEquals = Array.isArray(paramObj.neq) ? paramObj.neq : [paramObj.neq]
            if (notEquals.some(equalVal => equalVal === value)) return errMess(`wrongValueForVar`, { NOTsupportedValues: parseValueForDisplay(notEquals) })
        }

        // INCLUDES
        if (typeof paramObj.includes !== 'undefined' && !value.includes(paramObj.includes))
            return errMess(`wrongValueForVar`, { shouldIncludes: paramObj.includes })

        // REGEXP
        if (typeof paramObj.regexp !== 'undefined' && !paramObj.regexp.test(value))
            return errMess(`wrongValueForVar`, { shouldMatchRegexp: paramObj.regexp.toString() })

        // MIN / MAX LENGTH works for number length. Eg: 20180101.length == 8
        if (typeof paramObj.minLength !== 'undefined' && paramObj.minLength > (typeof value == 'number' ? value + '' : value).length)
            return errMess(`wrongLengthForVar`, { minLength: paramObj.minLength })
        if (typeof paramObj.maxLength !== 'undefined' && paramObj.maxLength < (typeof value == 'number' ? value + '' : value).length)
            return errMess(`wrongLengthForVar`, { maxLength: paramObj.maxLength })
        if (typeof paramObj.length !== 'undefined' && paramObj.length !== (typeof value == 'number' ? value + '' : value).length)
            return errMess(`wrongLengthForVar`, { length: paramObj.length })
    }

    return []
}

