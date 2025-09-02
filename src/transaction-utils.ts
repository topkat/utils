//----------------------------------------
// TRANSACTION
//----------------------------------------
import { isset } from './isset'
import { C } from './logger-utils'
import { timeout } from './timer-utils'

const transactionRunning = { __default: false } as Record<string, boolean>
const queue = { __default: [] } as Record<string, any[]>

/** Allow to perform async functions in a defined order
 * This adds the callback to a queue and is resolved when ALL previous callbacks with same name are executed
 * Use it like: await transaction('nameOfTheFlow', async () => { ...myFunction })
 * @param {String|Function} name name for the actions that should never happen concurrently
 * @param {Function} asyncCallback
 * @param {Number} timeout default: 120000 (120s) will throw an error if transaction time is higher that this amount of ms
 * @returns {Promise}
 */
export async function transaction(name: string, asyncCallback: () => any, timeout = 120000, doNotThrow = false) {
    if (typeof name === 'function') {
        asyncCallback = name
        name = '__default'
    }
    if (!isset(queue[name])) queue[name] = []
    if (!isset(transactionRunning[name])) transactionRunning[name] = false

    return await new Promise((resolve, reject) => {
        if (doNotThrow) reject = C.error
        queue[name].push(async () => {
            let to
            try {
                to = setTimeout(() => {
                    C.warning('Transaction Timeout') // in case not catched
                    reject(new Error('transactionTimeout'))
                }, timeout)
                const res = await asyncCallback()
                clearTimeout(to)
                resolve(res)
            } catch (err) {
                clearTimeout(to)
                reject(err)
            }
        })
        removeItemFromQueue(name)
    })
}

export async function removeItemFromQueue(name: string) {//        meoww!
    if (transactionRunning[name] === true) return //       v
    transactionRunning[name] = true //                A  A       /\
    while (queue[name].length) await queue[name].shift()() //    ||
    transactionRunning[name] = false //               \==/_______||
} //                                                     l  ____ *|
//                                                        11    11

/** Wait for a transaction to complete without creating a new transaction */
export async function waitForTransaction(transactionName: string, forceReleaseInSeconds = 30) {
    let brk = false
    setTimeout(() => brk = true, forceReleaseInSeconds * 1000)
    while (isset(transactionRunning[transactionName]) && transactionRunning[transactionName] === true) {
        if (brk) break
        await timeout(15)
    }
}