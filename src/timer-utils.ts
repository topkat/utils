
//----------------------------------------
// TIMEOUT UTILS
//----------------------------------------
import { cliProgressBar, C } from './logger-utils'
import { DescriptiveError } from './error-utils'
import { round2 } from './math-utils'


export async function timeout(ms: number, fn = () => { /* */ }) { return new Promise(res => setTimeout(res, ms)).then(fn) }

export async function runAsync(callback: () => any, milliseconds$ = 1) { return timeout(milliseconds$, callback) }

/**
 *
 * @param {Function} callback function that shall return ===true asynchronously
 * @param {Number} timeoutSec default:10; general timeout in seconds
 * @param {Boolean|String} errorAfterNSeconds default:true output an error in case of timeout, can be the displayed error message
 * @param {*} cliOutput write a cli progress to show that a process is running
 */
export async function waitUntilTrue(callback: () => any, timeoutSec = 10, errorAfterNSeconds = true, cliOutput = true) {
    let generalTimeout = true
    let step = 3
    const errMess = typeof errorAfterNSeconds === 'string' ? 'Timeout: ' + errorAfterNSeconds : 'Timeout for waitUntilTrue() callback'

    if (timeoutSec) setTimeout(() => generalTimeout = false, timeoutSec * 1000)

    while (callback() !== true && generalTimeout) {
        if (cliOutput) cliProgressBar(step++)
        await timeout(300)
    }
    if (cliOutput) process.stdout.write(`\n`)
    if (!generalTimeout && errorAfterNSeconds) throw new DescriptiveError(errMess, { code: 500 })
}


const delayedLoopParams: [any, number, any][] = []
let isExecuting = false

/** Allow to perform an action in a delayed loop, useful for example to avoid reaching limits on servers. This function can be securely called multiple times.
 * @param {Function} callback
 * @param {Number} time default: 500ms;
 * @param {Function} errorCallback default: e => C.error(e)
 */
export async function executeInDelayedLoop(callback: () => any, time = 500, errorCallback = (e: any) => C.error(e)) {
    delayedLoopParams.push([callback, time, errorCallback])
    if (isExecuting) return
    isExecuting = true
    while (delayedLoopParams.length) {
        const [callback, time, errorCallback] = delayedLoopParams.shift() as any
        try {
            await callback()
            await timeout(time)
        } catch (err) {
            errorCallback(err)
        }
    }
    isExecuting = false
}

/** Will first wait before calling callback every seconds configured in retrySeconds array */
export async function retryWithDelay(
    callback: Function,
    retrySeconds: number[]
) {
    for (const n of retrySeconds) {
        await timeout(n * 1000)
        await callback()
    }
}

/** Use this timer to measure code performances.
  * @example ```typescript
const time = perfTimer()

for(let i = 0; i < 9999;i++) longProcess()

console.log('Process took ' + time.end())
  ```
 */
export function perfTimer(unit: 'ms' | 'seconds' = 'seconds') {
    return {
        start: Date.now(),
        end() {
            const msSinceStart = Date.now() - this.start
            return unit === 'ms' ? msSinceStart + ' ' + unit : round2(msSinceStart / 1000) + ' ' + unit
        }
    }
}