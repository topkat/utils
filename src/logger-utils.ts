/* eslint-disable no-console */
/* eslint-disable no-control-regex */
//----------------------------------------
// LOGGER
//----------------------------------------
import { configFn } from './config'
import { isset } from './isset'
import { Color } from './types'
import { removeCircularJSONstringify } from './remove-circular-json-stringify'
import { cleanStackTrace } from './clean-stack-trace'

type NotInfoLogLevel = 'error' | 'warn'
type LogLevels = NotInfoLogLevel | 'info'

export const logger = {
    /** log is an OUTDATED alisas of info, appError is for warning */
    log(str: string, level: LogLevels = 'info') {
        const { preprocessLog } = configFn()
        if (typeof preprocessLog === 'function') str = preprocessLog(str) || str

        if (isset(console[level])) console[level](str)
        else console.log(str)

        logger.raw.push(str + `\n`)
        logger.raw = logger.raw.slice(logger.raw.length - configFn()?.nbOfLogsToKeep, logger?.raw?.length)
    },
    /**
     * @param {String[]|String} inputLogs
     */
    toHtml(inputLogs = [...logger.raw] as string[]) {
        if (!Array.isArray(inputLogs)) inputLogs = [inputLogs]
        const code2css: Record<string, any> = {
            2: `opacity:.5`, // dim
            32: `color:#679933`, // green
            31: `color:#A8383B`, // red
            33: `color:#D7941C`, // yellow
            35: `color:#C21949`, // magenta
            36: `color:#128C6D`, // cyan
            34: `color:#1B568B`, // blue
        }

        let htmlLogs = ''
        inputLogs.join('<br/>').split('\x1b[').forEach((bit, i) => {
            // the first doesn't have a preceding (may be undef)
            if (bit) {
                if (i !== 0) {
                    const [, code, R, G, B, content] = bit.match(/(^\d\d?)(?:;|m)(?:\d;(\d+);(\d+);(\d+)m)?(.*$)/) || []
                    if (content) {
                        const style = !isset(R) ? isset(code) ? code2css[code] : undefined : `color:rgb(${R},${G},${B})`
                        htmlLogs += isset(style) ? `<span style='${style}'>${content.replace(/\n/g, '<br>')}</span>` : content.replace(/\n/g, '<br>')
                    }
                } else htmlLogs += bit.replace(/\n/g, '<br>')
            }
        })
        return `<div style='color:#ccc'>${htmlLogs}<br></div>`
    },
    toText(inputLogs = [...logger.raw] as string[]) {
        const str = Array.isArray(inputLogs) ? inputLogs.join('\n') : inputLogs
        return str.replace(/\x1b\[.*?m/g, '')
    },
    raw: [] as string[],
    json: [] as string[],
} as {
    log(str: string, level?: LogLevels): void
    toHtml(inputLogs?: string[]): string
    toText(inputLogs?: string[]): string
    raw: string[]
    json: string[]
}

/**
// console colored output
// * console.log(C.green(C.dim('Hey bro !')))
// * or C.log() // will use color defined by themes
// * or C.line('MY TITLE', 53)
// * or C.gradientize(myLongString)
*/
export const C = {
    dim: (str: string) => C.output(2, str), // opacity 0.5
    green: (str: string) => C.output(32, str),
    red: (str: string) => C.output(31, str),
    yellow: (str: string) => C.output(33, str),
    grey: (str: string) => C.output(2, str),
    magenta: (str: string) => C.output(35, str),
    cyan: (str: string) => C.output(36, str),
    blue: (str: string) => C.output(34, str),
    primary: (str: string) => {
        const primary: Color = configFn()?.terminal?.theme?.primary
        return C.rgb(...primary) + str + C.reset
    },
    reset: '\x1b[0m',
    output: (code: number, str = '') => configFn()?.terminal?.noColor ? str : `\x1b[${code}m${str}\x1b[0m`,
    // true RGB colors B-*
    rgb: (r: number, g = 0, b = 0) => configFn()?.terminal?.noColor || !isset(r, g, b) ? '' : `\x1b[38;2;${r};${g};${b}m`,
    bg: (r?: number, g?: number, b?: number) => configFn()?.terminal?.noColor || !isset(r, g, b) ? '' : `${'\x1b['}48;2;${r};${g};${b}m`,
    /** Output a line of title */
    line(title = '', length = configFn()?.terminal?.theme?.pageWidth, clr = configFn()?.terminal?.theme?.primary, char = '=') {
        this.log('\u00A0\n' + this.rgb(...clr) + (title + ' ').padEnd(length || 0, char) + this.reset + '\u00A0\n')
    },
    /** Eg: ['cell1', 'cell2', 'cell3'], [25, 15] will start cell2 at 25 and cell 3 at 25 + 15
     * @param {Array} limits default divide the viewport
     */
    cols(strings: string[], limits: number[] = [], clr = configFn()?.terminal?.theme?.fontColor) {

        if (!limits.length) {
            const colWidth = Math.round(configFn()?.terminal?.theme.pageWidth / strings.length)
            limits = Array(strings.length - 1).fill(2).map((_, i) => colWidth * i + 1) as number[]
        }
        const str = strings.reduce((glob, str = '', i) => {
            const realCharLength = str.toString().replace(/\x1b\[.*?m/, '').length
            const charLength = str.toString().length
            const realLimit = limits[i] + charLength - realCharLength
            return glob + str.toString().substring(0, realLimit || 999).padEnd(realLimit || 0, ' ')
        }, '')
        this.logClr(str, clr)
    },
    /** Console log alias */
    log(...stringsCtxMayBeFirstParam: any[]) {
        stringsCtxMayBeFirstParam.forEach((str: string) => this.logClr(str))
    },
    logClr(str: string, clr = configFn()?.terminal?.theme?.fontColor) {
        if (!isset(str)) return
        str = (typeof clr !== 'undefined' ? this.rgb(...clr) : '') + str.toString().replace(/\n/g, '\n' + (typeof clr !== 'undefined' ? this.rgb(...clr) : ''))
        logger.log(str + this.reset, 'info')
    },
    info(...str: string[]) {
        str.forEach((s, i) => {
            if (i === 0) this.logClr('ⓘ  ' + s, configFn()?.terminal?.theme?.primary)
            else this.log(this.dimStrSplit(s))
        })
        this.log(' ')
    },
    success(...str: string[]) {
        str.forEach((s, i) => {
            if (i === 0) this.log(this.green('✓  ' + s))
            else this.log(this.dimStrSplit(s))
        })
    },
    /** First param **false** to avoid logging stack trace */
    error: (...errors: any[]) => logErrPrivate('error', [255, 0, 0], ...errors),
    /** First param **false** to avoid logging stack trace */
    warning: (...str: any[]) => logErrPrivate('warn', [255, 122, 0], ...str),
    customError: (color: Color, ...str: string[]) => logErrPrivate('error', color, ...str),
    customWarning: (color: Color, ...str: string[]) => logErrPrivate('warn', color, ...str),
    applicationError: (color: Color, ...str: string[]) => logErrPrivate('warn', color, ...str),
    warningLight: (_: any, ...str: string[]) => logErrPrivate('warn', [196, 120, 52], ...str),
    dimStrSplit(...logs: string[]) {
        const logsStr: string[] = []
        logs.filter(isset).forEach(log => log.toString().split('\n').forEach(line => line && logsStr.push(this.dim(`    ${line}`))))
        return logsStr.join('\n')
    },
    /** Gratientize lines of text (separated by \n) */
    gradientize(str = '', rgb1 = configFn()?.terminal?.theme?.shade1, rgb2 = configFn()?.terminal?.theme?.shade2, bgRgb = configFn()?.terminal?.theme?.bgColor, paddingY = 2) {

        const lines = str.split('\n')
        const largestLine = lines.reduce((sum, line) => sum < line.length ? line.length : sum, 0)
        const rgbParts = rgb1.map((val, i) => (val - rgb2[i]) / (lines.length))

        const bg = bgRgb ? this.bg(bgRgb[0], bgRgb[1], bgRgb[2]) : ''
        const padLine = bg + ' '.padEnd(largestLine, ' ') + '\x1b[0m\n'

        console.log(padLine.repeat(paddingY) +
            lines.reduce((s, line, i) => {
                return s + bg + this.rgb(...((rgb1 as Color).map((val, i2) => Math.round(val - i * rgbParts[i2]))) as Color) + line.padEnd(largestLine, ' ') + '\x1b[0m\n'
            }, '') +
            padLine.repeat(paddingY))
    },
    debugModeLog(title: string, ...string: string[]) {
        this.logClr('🐞 ' + title, configFn()?.terminal?.theme?.debugModeColor)
        this.log(this.dimStrSplit(...string))
    },
    /** allow to clear the last lines written to console */
    clearLastLines(n: number = 2) {
        for (let i = 0; i < n; i++) {
            process?.stdout?.moveCursor?.(0, -1) // Move up one line
            process?.stdout?.clearLine?.(0)
        }
        process?.stdout?.cursorTo?.(0) // Move cursor to beginning of the current line
    }
}

function logErrPrivate(level: NotInfoLogLevel, color: Color, ...errors: any[]) {
    const { isProd } = configFn()

    if (errors.length === 1 && typeof errors[0]?.log === 'function') return errors[0].log()

    let stackTrace = (new Error('')).stack || ''
    const displayStack = errors[0] === false ? errors.shift() : true
    const symbol = level === 'error' ? '✘ ' : '⚠ '
    if (errors.length > 1 && !isset(errors[0])) errors.shift() // remove first empty object

    const getStringFromErr = (err: any, i: number) => {
        if (!isset(err)) return ''
        else if (typeof err === 'string') {
            if (i === 0) return C.rgb(...color) + symbol + err + C.reset
            else return err.split('\n').map(val => C.dim(val)).join('\n')
        } else if (err instanceof Error) {
            const { str, stackTrace: stkTrc } = stringifyInstanceOfError(err, level, color)
            if (stkTrc) stackTrace = stkTrc
            return str
        } else if (typeof err === 'object') {

            let msg = ''
            msg += removeCircularJSONstringify(err, 2)
            if (msg === '{}' && Object.getOwnPropertySymbols(err).length) {
                // very weird behavior sometimes you can't log an error via console.error but this s**t works
                const errProp = err[Object.getOwnPropertySymbols(err)[0]]
                if (typeof errProp === 'function') msg = errProp()
                else msg = errProp
            }
            msg = msg.split('\n').map(val => C.dim(val)).join('\n') + '\n'
            const { str, stackTrace: stkTrc } = stringifyExtraInfos(err.extraInfo || err, level, color)
            if (stkTrc) stackTrace = stkTrc
            msg += str
            return msg
        } else return ''
    }

    if (errors.length && errors[0]) {
        const messages = errors.map((e, i) => {
            if (typeof e?.log === 'function') {
                e.log()
                return ''
            } else return getStringFromErr(e, i)
        })
        // Stack
        if (displayStack) {
            messages.push(isProd ? stackTrace : cleanStackTrace(stackTrace) + '\n')
        }
        logger.log(messages.join(''), level)
    }
}

function stringifyInstanceOfError(err: any, type: NotInfoLogLevel = 'error', color: Color = [255, 0, 0], level = 0): { str: string, stackTrace?: string } { // level = keep track of recursions
    if (level > 5) return { str: '' }
    let str = ''
    let stackTrace
    const symbol = type === 'error' ? '✘ ' : '⚠ '
    const title = err.msg || err.message || err.id || (err.stack ? err.stack.split('\n')[0] : 'Error')
    // Err mess
    str += C.rgb(...color) + symbol + title + C.reset + '\n'
    if (err.stack) stackTrace = err.stack // more relevant
    // ExtraInfos
    if (isset(err.extraInfo)) {
        const { str: str2, stackTrace: stkTrc } = stringifyExtraInfos(err.extraInfo, type, color, level++)
        if (stkTrc) stackTrace = stkTrc
        str += str2
    }
    return { str, stackTrace }
}

function stringifyExtraInfos(extraInfoOriginal: Record<string, any>, type: NotInfoLogLevel, color: Color, level = 0) {
    let stackTrace
    const originalError = [C.dim(`ORIGINAL ERROR ${'-'.repeat(39)}\n`)]
    if (extraInfoOriginal instanceof Error) { // case where error is passed directly to extraInfos
        return stringifyInstanceOfError(extraInfoOriginal, type, color)
    } else {
        const extraInfo = { ...extraInfoOriginal }
        const extraInfos = [C.dim(`EXTRA INFOS ${'-'.repeat(41)}\n`)]
        if (typeof extraInfo === 'object' && Object.keys(extraInfo).length) {
            for (const itemName in extraInfo) {
                if (extraInfo[itemName] instanceof Error) {
                    const { str, stackTrace: stkTrc } = stringifyInstanceOfError(extraInfo[itemName], type, color, level++)
                    originalError.push(str)
                    stackTrace = stkTrc
                    delete extraInfo[itemName]
                }
            }
        }
        if (Object.keys(extraInfo).length) {
            extraInfos.push(
                removeCircularJSONstringify(extraInfo, 2)
                    .replace(/(?:^\s*{(?:\n {2})?|}\s*$)/g, '')
                    .replace(/\n {2}/g, '\n')
                    .split('\n')
                    .map(val => C.dim(val)).join('\n') + '\n')
        }
        return {
            str: (extraInfos.length > 1 ? extraInfos.join('') : '') + (originalError.length > 1 ? originalError.join('') + '\n' : ''),
            stackTrace
        }
    }
}

/**
 * Call this at each steps of your progress and change the step value
 * @param {Number} step Number of "char" to output
 * @param {String} char Default: '.'
 * @param {String} msg String before char. Final output will be `${str}${char.repeat(step)}`
 */
export function cliProgressBar(step: number, char = '.', msg = `\x1b[2mⓘ Waiting response`) {
    if (typeof process?.stdout?.clearLine === 'function') {
        process.stdout.cursorTo(0)
        process.stdout.write(`${msg}${char.repeat(step)}\x1b[0m`) // \x1b[0m == reset color
    }
}

type loadingSpinnerTypes = 'arrow' | 'dots'

/** This allow an intuitive inline loading spinner with a check mark when loading as finished or a red cross for errors  */
export class cliLoadingSpinner {
    /** Please use it like spinner.start('myStuff') then spinner.end()
     * @param {String} type in: ['arrow', 'dots']
     */
    frameRate: number
    animFrames: string[]
    activeProcess: any
    frameNb: number = 0
    progressMessage: string = ''
    interval: any = -1

    constructor(type = 'dots' as loadingSpinnerTypes, activeProcess = process) {
        const anims = {
            arrow: {
                interval: 120,
                frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸']
            },
            dots: {
                interval: 80,
                frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
            }
        }
        this.frameRate = anims[type].interval
        this.animFrames = anims[type].frames
        this.activeProcess = activeProcess
    }
    start(msg: string) {
        this.frameNb = 0
        this.progressMessage = msg
        this.interval = setInterval(() => {
            this.activeProcess?.stdout?.cursorTo?.(0) // Move cursor to beginning of the current line
            const symbol = this.animFrames[this.frameNb++ % this.animFrames.length]
            this.activeProcess.stdout.write(C.primary(symbol) + ' ' + this.progressMessage)
        }, this.frameRate)
    }
    end(error = false) {
        clearInterval(this.interval)
        this.activeProcess?.stdout?.cursorTo?.(0)
        C.log(
            error ? C.red('✘ ' + this.progressMessage + '\n\n')
                : '\x1b[32m✓ ' + this.progressMessage + '\n\n'
        )
        this.progressMessage = ''
    }
    error() {
        return this.end(true)
    }
}


export function dim(str = '') {
    return configFn()?.terminal?.noColor ? str : `\x1b[2m${str.toString().split('\n').join('\x1b[0m\n\x1b[2m')}\x1b[0m`
}

