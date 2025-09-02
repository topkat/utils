//----------------------------------------
// TESTS UTILS
//----------------------------------------
import { C } from './logger-utils'
import { ValidatorObject } from './validation-utils'
import { isset } from './isset'
import { validatorReturnErrArray } from './validation-utils'
import { Override } from './types'
import { isObject } from './is-object'

export const restTestMini = {
    throwOnErr: false,
    reset(throwOnErr = false) {
        restTestMini.nbSuccess = 0
        restTestMini.nbError = 0
        restTestMini.lastErrors = []
        restTestMini.throwOnErr = throwOnErr
    },
    newErr(err: any) {
        restTestMini.nbError++
        restTestMini.lastErrors.push(err)
        if (restTestMini.throwOnErr) throw new Error(err)
        else C.error(false, err)
    },
    printStats() {
        // TODO print last errz
        C.info(`ERRORS RESUME =========`)
        if (restTestMini.lastErrors.length) C.log('\n\n\n')
        for (const lastErr of restTestMini.lastErrors) C.error(false, lastErr)
        C.log('\n\n\n')
        C.info(`STATS =========`)
        C.info(`Total: ${restTestMini.nbSuccess + restTestMini.nbError}`)
        C.success(`Success: ${restTestMini.nbSuccess}`)
        C.error(false, `    Errors: ${restTestMini.nbError}`)
    },
    nbSuccess: 0,
    nbError: 0,
    lastErrors: [] as any[]
}

/** if validatorObject param is not set then it will consider checking that the value is set
 *
 * @param description
 * @param value
 * @param validatorObject
 */
export function assert(description: string, value: any, validatorObject?: Override<ValidatorObject, { value?: never, name?: never }> | number | boolean | string) {
    try {
        const validatorObjReal: ValidatorObject = {
            value,
            name: description,
        }

        if (isObject(validatorObject)) Object.assign(validatorObjReal, validatorObject)
        else if (isset(validatorObject)) validatorObjReal.eq = validatorObject

        const issetCheck = !isset(validatorObjReal) // isEmpty()
        const [errMsg, extraInfos] = validatorReturnErrArray(validatorObjReal)
        const msg2 = description + ` ${issetCheck ? 'isset' : `${JSON.stringify(validatorObject)}`}`
        if (isset(errMsg)) {
            const err = msg2 + `\n    ${errMsg}\n    ${JSON.stringify(extraInfos)}`
            restTestMini.newErr(err)
        } else {
            restTestMini.nbSuccess++
            C.success(msg2)
        }
    } catch (err) {
        restTestMini.newErr(err)
    }
}