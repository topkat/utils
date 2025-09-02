//----------------------------------------
// REGEXP UTILS
//----------------------------------------
import { C } from './logger-utils'

/**
 * Will escape all special character in a string to output a valid regexp string to put in RegExp(myString)
 * * Eg: from `'path.*.addr(*)'` will output `'aa\..*?\.addr\(.*?\)'` so regexp match `'path.random.addr(randomItem)'`
 * * Options:
 *   * parseWildcard => config will replace '*' by '.*?' which is the best for 'match all until'
 *   * wildcardNotMatchingChars => if provided, will replace '*' by `[^${wildcardNotMatchingChars}]` instead of '.*?'. This allows wildcard not to match certains characters
 */
export function escapeRegexp(
    str: string,
    config: {
        /** will replace '*' by '.*?' which is the best for 'match all until' */
        parseWildcard?: boolean,
        /** if provided, will replace '*' by `[^${wildcardNotMatchingChars}]` instead of '.*?'. This allows wildcard not to match certains characters */
        wildcardNotMatchingChars?: string
    } = {}
): string {
    const { parseWildcard = false, wildcardNotMatchingChars } = config
    if (parseWildcard) return str.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&').replace(/\*/g, wildcardNotMatchingChars ? `[^${wildcardNotMatchingChars}]` : '.*?')
    else return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

/** Get first match of the first capturing group of regexp
 * Eg: const basePath = firstMatch(apiFile, /basePath = '(.*?)'/); will get what is inside quotes
 */
export function firstMatch(str: string, regExp: RegExp): string | undefined { return (str.match(regExp) || [])[1] }

/** Get all matches from regexp with g flag
 * Eg: [ [full, match1, m2], [f, m1, m2]... ]
 * NOTE: the G flag will be appended to regexp
 */
export function allMatches(str: string, reg: RegExp) {
    let i = 0
    let matches: RegExpExecArray | null
    const arr: (RegExpExecArray | null)[] = []
    if (typeof str !== 'string') C.error('Not a string provided as first argument for allMatches()')
    else {
        reg = new RegExp(reg, 'g')
        while ((matches = reg.exec(str))) {
            arr.push(matches)
            if (i++ > 99) {
                C.error('error', 'Please provide the G flag in regexp for allMatches')
                break
            }
        }
    }
    return arr
}