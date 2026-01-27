//----------------------------------------
// OBJECT UTILS
//----------------------------------------
import { ObjectGeneric } from './types'
import { err500IfNotSet } from './error-utils'
import { recursiveGenericFunctionSync } from './loop-utils'
import { isset } from './isset'
import { isObject } from './is-object'
import { DescriptiveError } from './error-utils'
import { escapeRegexp } from './regexp-utils'


/** Return an object:
* * with only selected fields
* * OR without masked fields
 */
export function simpleObjectMaskOrSelect<Obj extends ObjectGeneric>(
    object: Obj,
    maskedOrSelectedFields: (keyof Obj)[],
    mode: 'mask' | 'select' = 'mask',
    deleteKeysInsteadOfReturningAnewObject = false
): Obj {
    const allKeys = Object.keys(object)
    const keysToMask = allKeys.filter(keyName => {
        if (mode === 'mask') return maskedOrSelectedFields.includes(keyName)
        else return !maskedOrSelectedFields.includes(keyName)
    })
    if (deleteKeysInsteadOfReturningAnewObject) {
        keysToMask.forEach(keyNameToDelete => delete object[keyNameToDelete])
        return object
    } else {
        return allKeys.reduce((newObject: Record<string, any>, key) => {
            if (!keysToMask.includes(key)) newObject[key] = object[key]
            return newObject
        }, {}) as Obj
    }
}

/**
 * check if **object OR array** has property Safely (avoid cannot read property x of null and such)
 * @param {Object} obj object to test against
 * @param {string} addr `a.b.c.0.1` will test if myObject has props a that has prop b. Work wit arrays as well (like `arr.0`)
 */
export function has(obj: ObjectGeneric, addr: string) {
    if (!isset(obj) || typeof obj !== 'object') return
    const propsArr = addr.replace(/\.?\[(\d+)\]/g, '.$1').split('.') // replace a[3] => a.3;
    let objChain = obj
    return propsArr.every(prop => {
        objChain = objChain[prop]
        return isset(objChain)
    })
}

/** Find address in an object "a.b.c" IN { a : { b : {c : 'blah' }}} RETURNS 'blah'
 * @param obj
 * @param addr accept syntax like "obj.subItem.[0].sub2" OR "obj.subItem.0.sub2" OR "obj.subItem[0].sub2"
 * @returns the last item of the chain OR undefined if not found
 */
export function findByAddress(obj: ObjectGeneric, addr: string | string[]): any | undefined {
    if (addr.length === 0) return obj
    // eslint-disable-next-line no-console
    if (!isset(obj) || typeof obj !== 'object') return console.warn('Main object in `findByAddress` function is undefined or has the wrong type')
    const propsArr = Array.isArray(addr) ? addr : addr.replace(/\.?\[(\d+)\]/g, '.$1').split('.') // replace .[4] AND [4] TO .4
    const objRef = propsArr.reduce((objChain, prop) => {
        if (!isset(objChain) || typeof objChain !== 'object' || !isset(objChain[prop])) return
        else return objChain[prop]
    }, obj)
    return objRef
}

type FindByAddressReturnFull = Array<[addr: string, value: any, lastElmKey: string, parent: any[] | Record<string, any>]>
/** Will return all objects matching that path. Eg: user.*.myVar */
export function findByAddressAll<ReturnAddresses extends boolean = false>(
    obj: Record<string, any>,
    addr: string,
    returnAddresses: ReturnAddresses = false as ReturnAddresses
): ReturnAddresses extends true ? FindByAddressReturnFull : Array<any> {
    err500IfNotSet({ obj, addr })
    if (addr === '') return (returnAddresses ? [addr, obj, undefined, undefined] : obj) as any
    const addrRegexp = new RegExp('^' + escapeRegexp(
        addr.replace(/\.?\[(\d+)\]/g, '.$1'), // replace .[4] AND [4] TO .4
        { parseWildcard: true, wildcardNotMatchingChars: '.[' }) + '$'
    )

    const matchingItems: any[] = []

    recursiveGenericFunctionSync(obj, (item, address, lastElmKey, parent) => {
        if (addrRegexp.test(address)) matchingItems.push(returnAddresses ? [address, item, lastElmKey, parent] : item)
    })
    return matchingItems
}

/** Enforce writing subItems. Eg: user.name.blah will ensure all are set until the writing of the last item
 * NOTE: doesn't work when parent is array
 */
export function objForceWrite<MainObj extends Record<string, any>>(obj: MainObj, addr: string, item: any, options: { doNotWriteFinalValue?: boolean } = {}): MainObj {
    const { doNotWriteFinalValue = false } = options
    const writeFinalValue = !doNotWriteFinalValue

    const chunks = addr.replace(/\.?\[(\d+)\]/g, '.[$1').split('.')
    let lastItem: any = obj
    chunks.forEach((chunkRaw, i) => {
        const chunk = chunkRaw.replace(/^\[/, '')
        if (i === chunks.length - 1) {
            if (writeFinalValue) lastItem[chunk] = item
        } else if (!isset(lastItem[chunk])) {
            const nextChunk = chunks[i + 1]
            if (isset(nextChunk) && nextChunk.startsWith('[')) lastItem[chunk] = []
            else lastItem[chunk] = {}
        } else if (typeof lastItem[chunk] !== 'object') {
            throw new DescriptiveError(`itemNotTypeObjectOrArrayInAddrChainForObjForceWrite`, { code: 500, origin: 'Validator', chunks: chunks.map(c => c.replace(/\[(\d+)/, '[$1]')), actualValueOfItem: lastItem[chunk], actualChunk: chunk, chunkIndex: i })
        }
        lastItem = lastItem[chunk]
    })
    return obj
}




export function forcePathInObject<MainObj extends Record<string, any>>(obj: MainObj, addr: string): MainObj {
    return objForceWrite(obj, addr, undefined, { doNotWriteFinalValue: true })
}

export const objForceWritePath = forcePathInObject

/** Enforce writing subItems, only if obj.addr is empty.
 * Eg: user.name.blah will ensure all are set until the writing of the last item
 * if user.name.blah has a value it will not change it.
 * NOTE: doesn't work when parent is array
 */
export function objForceWriteIfNotSet<MainObj extends Record<string, any>>(obj: MainObj, addr: string, item: any): MainObj {
    if (!isset(findByAddress(obj, addr))) return objForceWrite(obj, addr, item)
    else return obj
}

/** Merge mixins into class. Use it in the constructor like: mergeMixins(this, {myMixin: true}) */
export function mergeMixins(that: any, ...mixins: any[]) {
    mixins.forEach(mixin => {
        for (const method in mixin) {
            that[method] = mixin[method]
        }
    })
}

export function cloneObject<MainObj extends Record<string, any>>(o: MainObj): MainObj {
    return JSON.parse(JSON.stringify(o))
}

/** Deep clone. WILL REMOVE circular references */
export function deepClone<MainObj extends Record<string, any>>(obj: MainObj, cache = []): MainObj {

    let copy: any | any[]
    // usefull to not modify 1st level objet by lower levels
    // this is required for the same object to be referenced not in a redundant way
    const newCache: any[] = [...cache]
    if (obj instanceof Date) return new Date(obj) as any

    // Handle Array
    if (Array.isArray(obj)) {
        if (newCache.includes(obj)) return [] as any
        newCache.push(obj)
        copy = []
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepClone(obj[i], newCache as any)
        }
        return copy
    }

    if (typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === Object.prototype) {
        if (newCache.includes(obj)) return {} as any
        newCache.push(obj)
        copy = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = deepClone(obj[key], newCache as any)
            }
        }
        return copy
    }

    return obj // number, string...
}


/**
 * @param {Object} obj the object on which we want to filter the keys
 * @param {function} filterFunc function that returns true if the key match the wanted criteria
 */
export function filterKeys<MainObj extends Record<string, any>>(obj: MainObj, filter: any): MainObj {
    const clone = cloneObject(obj)
    recursiveGenericFunctionSync(obj, (_, addr, lastElementKey) => {
        if (!filter(lastElementKey)) deleteByAddress(clone, addr.split('.'))
    })
    return clone
}
/**
 * @param {Object} obj the object on which we want to delete a property
 * @param {Array} addrArr addressArray on which to delete the property
 */
export function deleteByAddress(obj: object, addr: string | string[]) {
    let current = obj as Record<string, any>
    const addrArr = Array.isArray(addr) ? addr : addr.split('.')
    for (let i = 0; i < addrArr.length; i++) {
        const currentAddr = addrArr[i].replace(/(\[|\])/g, '')
        if (i === addrArr.length - 1) delete current[currentAddr]
        else current = current[currentAddr]
    }
}



/** Remove all key/values pair if value is undefined  */
export function objFilterUndefined<MainObj extends Record<string, any>>(o: MainObj): MainObj {
    Object.keys(o).forEach(k => !isset(o[k]) && delete o[k])
    return o
}

/** Lock all 1st level props of an object to read only */
export function readOnly<MainObj extends Record<string, any>>(o: MainObj): { readonly [AA in keyof MainObj]: MainObj[AA] } {
    const throwErr = () => { throw new DescriptiveError('Cannot modify object that is read only', { code: 500 }) }
    return new Proxy(o, {
        set: throwErr,
        defineProperty: throwErr,
        deleteProperty: throwErr,
    })
}

/** Fields of the object can be created BUT NOT reassignated */
export function reassignForbidden(o: Record<string, any>) {
    return new Proxy(o, {
        defineProperty: function (that: Record<string, any>, key: string, value) {
            if (key in that) throw new DescriptiveError(`Cannot reassign the property ${key.toString()} of this object`, { code: 500 })
            else {
                that[key] = value
                return true
            }
        },
        deleteProperty: function (_, key) {
            throw new DescriptiveError(`Cannot delete the property ${key.toString()} of this object`, { code: 500 })
        }
    })
}

/** All fileds and subFields of the object will become readOnly */
export function readOnlyRecursive(object: Record<string, any>) {
    recursiveGenericFunctionSync(object, (item, _, lastElementKey, parent) => {
        if (typeof item === 'object' && parent) (parent as any)[lastElementKey] = readOnly(item)
    })
    return object
}

/** @deprecated use readOnlyRecursive instead */
export const readOnlyForAll = readOnlyRecursive

export function objFilterUndefinedRecursive(obj: Record<string, any>) {
    if (obj) {
        const flattenedObj = flattenObject(obj)
        Object.keys(flattenedObj).forEach(key => {
            if (!isset(flattenedObj[key])) {
                delete flattenedObj[key]
            }
        })
        return unflattenObject(flattenedObj)
    } else return obj
}

export function sortObjKeyAccordingToValue(unorderedObj: Record<string, any>, ascending = true) {
    const orderedObj = {} as Record<string, any>
    const sortingConst = ascending ? 1 : -1
    Object.keys(unorderedObj)
        .sort((keyA, keyB) => unorderedObj[keyA] < unorderedObj[keyB] ? sortingConst : -sortingConst)
        .forEach(key => { orderedObj[key] = unorderedObj[key] })
    return orderedObj
}

/**
 * Make default value if object key do not exist
 * @param {object} obj
 * @param {string} addr
 * @param {any} defaultValue
 * @param {function} callback (obj[addr]) => processValue. Eg: myObjAddr => myObjAddr.push('bikou')
 * @return obj[addr] eventually processed by the callback
 */
export function ensureObjectProp<MainObj extends Record<string, any>, Addr extends string>(
    obj: MainObj,
    addr: Addr,
    defaultValue: any,
    callback: (o: any) => any
): MainObj[Addr] {
    err500IfNotSet({ obj, addr, defaultValue, callback })
    if (!isset(obj[addr])) obj[addr] = defaultValue
    if (callback) callback(obj[addr])
    return obj[addr]
}


/** object and array merge
 * @warn /!\ Array will be merged and duplicate values will be deleted /!\
 * @return {Object} new object result from merge
 * NOTE: objects in params will NOT be modified*/
export function mergeDeep<
    O1 extends Record<string, any>,
    O2 extends Record<string, any> = Record<string, any>,
    O3 extends Record<string, any> = Record<string, any>,
    O4 extends Record<string, any> = Record<string, any>,
    O5 extends Record<string, any> = Record<string, any>,
    O6 extends Record<string, any> = Record<string, any>,
>(...objects: [O1, O2?, O3?, O4?, O5?, O6?]): O1 & O2 & O3 & O4 & O5 & O6 {
    return mergeDeepConfigurable(
        (previousVal, currentVal) => [...previousVal, ...currentVal].filter((elm, i, arr) => arr.indexOf(elm) === i),
        (previousVal: any, currentVal: any) => mergeDeep(previousVal, currentVal),
        undefined,
        ...objects
    )
}

/** object and array merge
 * @warn /!\ Array will be replaced by the latest object /!\
 * @return {Object} new object result from merge
 * NOTE: objects in params will NOT be modified */
export function mergeDeepOverrideArrays<
    O1 extends Record<string, any>,
    O2 extends Record<string, any> = Record<string, any>,
    O3 extends Record<string, any> = Record<string, any>,
    O4 extends Record<string, any> = Record<string, any>,
    O5 extends Record<string, any> = Record<string, any>,
    O6 extends Record<string, any> = Record<string, any>,
>(...objects: [O1, O2?, O3?, O4?, O5?, O6?]): O1 & O2 & O3 & O4 & O5 & O6 {
    return mergeDeepConfigurable(
        undefined,
        (previousVal: any, currentVal: any) => mergeDeepOverrideArrays(previousVal, currentVal),
        undefined,
        ...objects
    )
}

/** object and array merge
 * @param {Function} replacerForArrays item[key] = (prevValue, currentVal) => () When 2 values are arrays,
 * @param {Function} replacerForObjects item[key] = (prevValue, currentVal) => () When 2 values are objects,
 * @param {Function} replacerDefault item[key] = (prevValue, currentVal) => () For all other values
 * @param  {...Object} objects
 * @return {Object} new object result from merge
 * NOTE: objects in params will NOT be modified
 */
export function mergeDeepConfigurable<
    O1 extends Record<string, any>,
    O2 extends Record<string, any> = Record<string, any>,
    O3 extends Record<string, any> = Record<string, any>,
    O4 extends Record<string, any> = Record<string, any>,
    O5 extends Record<string, any> = Record<string, any>,
    O6 extends Record<string, any> = Record<string, any>,
>(
    replacerForArrays = (_: any, curr: any) => curr, replacerForObjects: any,
    replacerDefault = (_: any, curr: any) => curr,
    ...objects: [O1, O2?, O3?, O4?, O5?, O6?]
): O1 & O2 & O3 & O4 & O5 & O6 {
    return objects.reduce((actuallyMerged: Record<string, any>, obj) => {
        if (obj && typeof obj === 'object') Object.keys(obj).forEach(key => {
            const previousVal = actuallyMerged[key]
            const currentVal = obj[key]

            if (Array.isArray(previousVal) && Array.isArray(currentVal)) {
                actuallyMerged[key] = replacerForArrays(previousVal, currentVal)
            } else if (isObject(previousVal) && isObject(currentVal)) {
                actuallyMerged[key] = replacerForObjects(previousVal, currentVal)
            } else {
                actuallyMerged[key] = replacerDefault(previousVal, currentVal)
            }
        })

        return actuallyMerged
    }, {}) as any
}

/** { a: {b:2}} => {'a.b':2} useful for translations
 * NOTE: will remove circular references
 */
export function flattenObject(data: any, config: { withoutArraySyntax?: boolean, withArraySyntaxMinified?: boolean } = {}): Record<string, any> {
    const { withoutArraySyntax = false, withArraySyntaxMinified = false } = config
    const result = {} as Record<string, any>
    const seenObjects: any[] = [] // avoidCircular reference to infinite loop
    const recurse = (cur: any, prop: string) => {
        if (Array.isArray(cur)) {
            const l = cur.length
            let i = 0
            if (withoutArraySyntax) recurse(cur[0], prop)
            else {
                for (; i < l; i++) recurse(cur[i], prop + (withArraySyntaxMinified ? `.${i}` : `[${i}]`))
                if (l == 0) result[prop] = []
            }
        } else if (isObject(cur)) { // is object
            try {
                if (seenObjects.includes(cur)) cur = deepClone(cur) // avoid circular ref but allow duplicate objects
                else seenObjects.push(cur)

                const isEmpty = Object.keys(cur).length === 0

                for (const p in cur) recurse(cur[p], (prop ? prop + '.' : '') + p.replace(/\./g, '%')) // allow prop to contain special chars like points);

                if (isEmpty && prop) result[prop] = {}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn('Circular reference in flattenObject, impossible to parse')
            }
        } else result[prop] = cur
    }
    recurse(data, '')
    return result
}

/** {'a.b':2} => { a: {b:2}} */
export function unflattenObject(data: Record<string, any>): Record<string, any> {
    const newO = {}
    for (const [addr, value] of Object.entries(data)) objForceWrite(newO, addr, value)
    return newO
}

/** Mean to fix typing because type for Object.entries is not accurate. Ref: https://stackoverflow.com/questions/66565322/get-type-keys-in-typescript
 * /!\ THIS WILL REMOVE SYMBOL AND NUMBER FROM KEY TYPES as this is 99% of the time unwanted for generic objects
*/
export function objEntries<Obj extends Record<string, any>>(obj: Obj): ObjEntries<Obj> {
    return Object.entries(obj) as any
}

/** Will remove Symbol and Number from keys types */
type ObjEntries<T, K extends keyof T = keyof T> = (K extends string ? [K, T[K]] : never)[]

/** Will remove Symbol and Number from keys types */
type StringKeys<T> = keyof T extends infer K ? K extends string ? K : never : never

/** Mean to fix typing because type for Object.keys is not accurate */
export function objKeys<Obj extends Record<string, any>>(obj: Obj): StringKeys<Obj>[] {
    return Object.keys(obj) as any
}

/** Will merge all arrays of an object into a single array */
export function mergeObjectArrays<T extends Record<string, any[]>>(obj: T) {
    return Object.values(obj).flat() as (T[keyof T][number])[]
}

export const keys = objKeys
export const entries = objEntries



/** A Helper to create JavascriptProxies, will add __isProxy and toJSON helper to prevent error when logging the proxy and to be able to check if the object is proxyfied */
export function createProxy<T extends Record<string, any>>(obj: T, optn: {
    get: Required<ProxyHandler<T>>['get'],
    jsonRepresentation?: (obj: T) => string
}) {
    return new Proxy(obj, {
        get(target, prop, receiver) {
            if (prop === '__isProxy') return true
            else if (prop === 'toJSON') {
                if ('toJSON' in target) return target.toJSON
                else return () => (optn?.jsonRepresentation?.(target) || '[Proxy]')
            }
            return optn.get(target, prop, receiver)
        }
    })
}

/** Revert object keys and values. 
 * @example revertObjectKeysAndValues({ a: 1, b: 2 }) => { 1: 'a', 2: 'b' }
 * @param obj Object to revert
 * @returns New object with keys and values swapped
 */
export function revertObjectKeysAndValues<
    T extends Record<keyof T, string | number | symbol>
>(obj: T): { [K in keyof T as T[K]]: K } {
    const result = {} as { [K in keyof T as T[K]]: K }
    for (const key in obj) {
        const value = obj[key]
            ; (result as any)[value] = key
    }
    return result
}