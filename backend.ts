

import { C } from './src/logger-utils'
import { exec, ChildProcess } from 'child_process'


/** Execute a custom command into a child terminal and wait for process completion */
export async function execWaitForOutput(
    command: string,
    config = {} as Partial<{
        /** Whenever to log output to the console, choose false to execute the process silently. Default: true */
        logOutputStream: boolean
        /** when the output contain this string or matches this regexp, process is considered done. Else it will wait for exit */
        stringOrRegexpToSearchForConsideringDone: string | RegExp
        /** timeout before killing process in seconds. Put -1 or 0 de disable. Default: 20 */
        nbSecondsBeforeKillingProcess: number
        /** { a: 1000, b: 2000 } { keyCode: sendAfterXms }; Eg: the key "keyCode" will be sent to terminal after "sendAfterXms" milliseconds */
        keyCodeToSend: { [keyCode: string]: number },
        /** log: log the error as an error | throw: throw the error. Default: "throw" */
        errorHandle: 'log' | 'error'
        /** this callback will be called every time the terminal outputs something with the first param being the outputted string */
        streamConsoleOutput: (outputStr: string) => any,
        /** see nodeJs exec() command options */
        execOptions: { cwd?: string, [seeNodeJsDocOnExec: string]: any }

        onStartProcess(process: ChildProcess): any
    }>
): Promise<string | undefined> {

    let outputStream = ''

    const { nbSecondsBeforeKillingProcess = 20, streamConsoleOutput = () => true, errorHandle = 'throw', logOutputStream = true, stringOrRegexpToSearchForConsideringDone, keyCodeToSend = {}, onStartProcess, execOptions } = config

    try {
        return await new Promise((res, reject) => {
            const to = nbSecondsBeforeKillingProcess > 0 ? setTimeout(() => {
                C.error(`Exec timeout for ${command}`)
                reject(`Exec timeout for ${command}`)
            }, nbSecondsBeforeKillingProcess * 1000) : undefined

            const process2 = exec(command, execOptions)
            if (onStartProcess) onStartProcess(process2)
            const resolve = () => {
                process2?.kill('SIGINT')
                clearTimeout(to)
                res(outputStream)
            }
            const stdCallback = (data: any) => {
                if (logOutputStream) C.log(data)
                streamConsoleOutput(data)
                outputStream += data
                if (stringOrRegexpToSearchForConsideringDone) {
                    const regexp = typeof stringOrRegexpToSearchForConsideringDone === 'string' ? new RegExp(stringOrRegexpToSearchForConsideringDone) : stringOrRegexpToSearchForConsideringDone
                    if (regexp.test(data)) resolve()
                }
            }
            const exitCallback = (exitCode: any) => {
                if (exitCode === 0) resolve()
                else if (stringOrRegexpToSearchForConsideringDone || typeof exitCode === 'number' && exitCode !== 0) reject(exitCode)
                else resolve()
            }
            process2.stderr?.on('data', stdCallback)
            process2.stdout?.on('data', stdCallback)
            process2.on('exit', exitCallback)
            process2.on('close', exitCallback)
            for (const keyCode in keyCodeToSend) {
                setTimeout(() => {
                    process2.stdin?.write(keyCode)
                    if (logOutputStream) C.log('Sending charcode to stdin: ' + keyCode)
                }, keyCodeToSend[keyCode])
            }
        })
    } catch (_) {
        if (errorHandle === 'log') C.error(`Something went wrong using this command: ${command}\nPlease check this log:\n${outputStream}`)
        else throw `Something went wrong using this command: ${command}\nPlease check this log:\n${outputStream}`
    }
}