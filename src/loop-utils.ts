//----------------------------------------
// LOOP UTILS
//----------------------------------------
import { ObjectGeneric } from './types'
import { err500IfNotSet } from './error-utils'
import { isObject } from './is-object'

/**
 * Iterates over a specified number of times, passing each iteration's result to the next callback
 * @returns Array containing results from all iterations
 *
 * @example
 * ```typescript
 * // Generate Fibonacci sequence
 * forI(8, (i, prev, results) => {
 *   if (i <= 1) return 1
 *   return results[i-1] + results[i-2]
 * })
 * ```
 * // Returns: [1, 1, 2, 3, 5, 8, 13, 21]
 */
export function forI<T extends any[] | any>(
    /** Number of times to iterate */
    nbIterations: number,
    /** Function called for each iteration with:
     *   - number: Current iteration index (0-based)
     *   - previousValue: Result from previous iteration
     *   - arrayOfPreviousValues: Array of all previous results
     */
    callback: (
        /** Current iteration index (0-based) */
        number: number,
        /** Result from previous iteration */
        previousValue: any,
        /** Array of all previous results */
        arrayOfPreviousValues: any[]
    ) => T
): T[] {
    const results: any[] = []
    for (let i = 0; i < nbIterations; i++) {
        const prevValue = results[results.length - 1]
        results.push(callback(i, prevValue, results))
    }
    return results
}

/**
 * Iterates over a specified number of times, passing each iteration's result to the next callback
 * @returns Array containing results from all iterations
 *
 * @example
 * ```typescript
 * // Generate Fibonacci sequence ASYNC
 * await forI(8, async (i, prev, results) => {
 *   if (i <= 1) return 1
 *   return new Promise(resolve => setTimeout(() => resolve(results[i-1] + results[i-2]), 100))
 * })
 * ```
 * // Returns: [1, 1, 2, 3, 5, 8, 13, 21]
 */
export async function forIasync<T extends any[] | any>(nbIterations: number, callback: (number: number) => T): Promise<T[]> {
    const results: any[] = []
    for (let i = 0; i < nbIterations; i++) {
        results.push(await callback(i))
    }
    return results
}


export type RecursiveCallback = (item: any, addr: string, lastElementKey: string | number, parent?: ObjectGeneric | any[]) => false | any
export type RecursiveConfig = {
    disableCircularDependencyRemoval?: boolean
    isObjectTestFunction?: (item: any) => boolean
}
/**
 * @param {any} item the first array or object or whatever you want to recursively browse
 * @param {function} callback the callback you want to apply on items including the main one
 *   * this callback has 2 arguments: (item, address) =>
 *   * `item` => the actual item
 *   * `addr` => the address of the item, not including root (Eg: subItem1.sub2.[3].[2]) array indexes are juste written as numbers
 *   * `lastElementKey` => the key of last item. May be a number if last item is an array
 *   * `parent` => reference the parent object as this is the only way of reassigning a value for the item. Eg: parent[lastElementKey] = myNewItem
 *   * **NOTE** => if a key of an item contains dots, they will be replaced by '%' in `addr`
 *   * **NOTE2** => if false is returned by the callback it will stop all other iterations (but not in an array)
 * @param {string} addr$ optional, the base address for the callback function
 * @param lastElementKey technical field
 * NOTE: will remove circular references
 * /!\ check return values
 */
export async function recursiveGenericFunction(
    /** The object or array you want to recursively browse */
    item: ObjectGeneric | any[],
    /** The callback you want to apply on items including the main one */
    callback: RecursiveCallback,
    /** Optional configuration object */
    config: RecursiveConfig = {},
    /** Optional base address for the callback function */
    addr$ = '',
    /** Technical field */
    lastElementKey: string | number = '',
    parent?: Record<string, any>,
    techFieldToAvoidCircularDependency: any[] = []
) {
    err500IfNotSet({ callback })

    if (!config.isObjectTestFunction) config.isObjectTestFunction = isObject

    if (!techFieldToAvoidCircularDependency.includes(item)) {
        const result = addr$ === '' ? true : await callback(item, addr$, lastElementKey, parent)

        if (result !== false) {
            if (Array.isArray(item)) {
                if (config?.disableCircularDependencyRemoval !== true) techFieldToAvoidCircularDependency.push(item)
                await Promise.all(item.map(
                    (e, i) => recursiveGenericFunction(e, callback, config, addr$ + '[' + i + ']', i, item, techFieldToAvoidCircularDependency)
                ))
            } else if (config.isObjectTestFunction(item)) {
                if (config?.disableCircularDependencyRemoval !== true) techFieldToAvoidCircularDependency.push(item)
                await Promise.all(Object.entries(item).map(
                    ([key, val]) => recursiveGenericFunction(val, callback, config, (addr$ ? addr$ + '.' : '') + key.replace(/\./g, '%'), key, item, techFieldToAvoidCircularDependency)
                ))
            }
        }
    }
    return item
}

/**
 * @param {any} item the first array or object or whatever you want to recursively browse
 * @param {function} callback the callback you want to apply on items including the main one
 *   * this callback has 2 arguments: (item, address) =>
 *   * `item` => the actual item
 *   * `addr` => the address of the item, not including root (Eg: subItem1.sub2.[3].[2]) array indexes are juste written as numbers
 *   * `lastElementKey` => the key of last item. May be a number if last item is an array
 *   * `parent` => reference the parent object as this is the only way of reassigning a value for the item. Eg: parent[lastElementKey] = myNewItem
 *   * **NOTE** => if a key of an item contains dots, they will be replaced by '%' in `addr`
 *   * **NOTE2** => if false is returned by the callback it will stop all other iterations (but not in an array)
 *   * **NOTE3** => to reassign a key use =>  parent[lastElementKey] = myNewItem
 * @param {string} addr$ optional, the base address for the callback function
 * @param lastElementKey technical field
 * NOTE: will remove circular references
 * /!\ check return values
 */
export function recursiveGenericFunctionSync(item: ObjectGeneric | any[], callback: RecursiveCallback, config: RecursiveConfig = {}, addr$ = '', lastElementKey: string | number = '', parent?: Record<string, any>, techFieldToAvoidCircularDependency: any[] = []) {
    err500IfNotSet({ callback })

    if (!config.isObjectTestFunction) config.isObjectTestFunction = isObject

    if (!techFieldToAvoidCircularDependency.includes(item)) {
        const result = addr$ === '' ? true : callback(item, addr$, lastElementKey, parent)

        if (result !== false) {
            if (Array.isArray(item)) {
                if (config?.disableCircularDependencyRemoval !== true) techFieldToAvoidCircularDependency.push(item) // do not up one level
                item.forEach((e, i) => recursiveGenericFunctionSync(e, callback, config, addr$ + '[' + i + ']', i, item, techFieldToAvoidCircularDependency))
            } else if (config.isObjectTestFunction(item)) {
                if (config?.disableCircularDependencyRemoval !== true) techFieldToAvoidCircularDependency.push(item)
                Object.entries(item).forEach(([key, val]) => recursiveGenericFunctionSync(val, callback, config, (addr$ ? addr$ + '.' : '') + key.replace(/\./g, '%'), key, item, techFieldToAvoidCircularDependency))
            }
        }
    }
    return item
}

/** A safer version of while loop that prevents infinite loops
 * @param {Function} conditionFn Function that returns a boolean to determine if loop should continue
 * @param {Function} callback Function to execute on each iteration
 * @param {Object} options Configuration object
 * @param {number} [options.nbRecursionMax=100] Maximum number of iterations before exiting to prevent infinite loops
 * @example
 * // Count up to 10
 * let i = 0;
 * safeWhile(
 *   () => i < 10,
 *   () => i++
 * );
 */
export function safeWhile(conditionFn: (i: number) => boolean, callback: (i: number) => any, { nbRecursionMax = 100 } = {}) {
    let nbRecursion = 0
    while (conditionFn(nbRecursion) && nbRecursion++ < nbRecursionMax) {
        callback(nbRecursion)
        // eslint-disable-next-line no-console
        if (nbRecursion === nbRecursionMax - 1) console.warn(`Too much recursion for while loop, exiting...`)
    }
}




/** A safer version of while loop that prevents infinite loops
 * @param {Function} conditionFn Function that returns a boolean to determine if loop should continue
 * @param {Function} callback Function to execute on each iteration
 * @param {Object} options Configuration object
 * @param {number} [options.nbRecursionMax=100] Maximum number of iterations before exiting to prevent infinite loops
 * @example
 * // Count up to 10
 * let i = 0;
 * safeWhile(
 *   () => i < 10,
 *   () => i++
 * );
 */
export async function safeWhileAsync(conditionFn: (i: number) => boolean, callback: (i: number) => Promise<any>, { nbRecursionMax = 100 } = {}) {
    let nbRecursion = 0
    while (await conditionFn(nbRecursion) && nbRecursion++ < nbRecursionMax) {
        await callback(nbRecursion)
        // eslint-disable-next-line no-console
        if (nbRecursion === nbRecursionMax - 1) console.warn(`Too much recursion for while loop, exiting...`)
    }
}