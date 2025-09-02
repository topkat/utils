//----------------------------------------
// ARRAY UTILS
//----------------------------------------
import { ensureObjectProp } from './object-utils'
import { isset } from './isset'

/** Randomize array in place and return the same array than inputed */
export function shuffleArray<EntryArray extends any[]>(array: EntryArray): EntryArray {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}


/**
 * Maye sure obj[addr] is an array and push a value to it
 * @param {Object} obj parent object
 * @param {String} addr field name in parent
 * @param {Any} valToPush
 * @param {Boolean} onlyUniqueValues default:false; may be true or a comparision function; (a,b) => return true if they are the same like (a, b) => a.name === b.name
 * @return obj[addr] eventually processed by the callback
 */
export function ensureIsArrayAndPush(obj: object, addr: string, valToPush: any, onlyUniqueValues?: Function) {
    return ensureObjectProp(obj, addr, [], (objValue: any) => {
        if (isset(onlyUniqueValues)) {
            let duplicateFound = false
            if (typeof onlyUniqueValues === 'function') duplicateFound = objValue.some((a: any) => onlyUniqueValues(a, valToPush))
            else duplicateFound = objValue.includes(valToPush)
            if (!duplicateFound) objValue.push(valToPush)
        } else objValue.push(valToPush)
    })
}

/** If a string is provided, return it as array else return the value */
export function strAsArray<T>(arrOrStr: T): T extends string ? string[] : T {
    return (typeof arrOrStr === 'string' ? [arrOrStr] : arrOrStr) as any
}

type AsArrReturnVal<T, X> = T extends undefined ? (X extends undefined ? void : X) : T extends any[] ? T : T[]
/** If not an array provided, return the array with the value
 * /!\ NOTE /!\ In case the value is null or undefined, it will return that value
 */
export function asArray<T extends any[] | any, X>(item: T, returnValueIfUndefined?: X): AsArrReturnVal<T, X> {
    if (typeof item === 'undefined') return returnValueIfUndefined as any
    else return (Array.isArray(item) ? item : [item]) as any
}

/** @return {object} { inCommon, notInB, notInA } */
export function compareArrays<T1, T2>(arrayA: T1[] | readonly T1[] = [], arrayB: T2[] | readonly T2[] = [], compare = (a: T1 | T2, b: T1 | T2) => a === b): {
    inCommon: ReturnType<typeof getArrayInCommon<T1, T2>>
    notInB: ReturnType<typeof getArrayInCommon<T1, T2>>
    notInA: ReturnType<typeof getArrayInCommon<T2, T1>>
} {
    return {
        inCommon: getArrayInCommon(arrayA, arrayB, compare),
        notInB: getNotInArrayA(arrayB, arrayA, compare),
        notInA: getNotInArrayA(arrayA, arrayB, compare),
    }
}

/** @return [] only elements that are both in arrayA and arrayB  */
export function getArrayInCommon<T1, T2>(arrayA: T1[] | readonly T1[] = [], arrayB: T2[] | readonly T2[] = [], compare = (a: T1 | T2, b: T1 | T2) => a === b): T1[] {
    if (!Array.isArray(arrayA) || !Array.isArray(arrayB)) return []
    else return arrayA.filter(a => arrayB.some(b => compare(a, b)))
}

/** @return [] only elements that are in arrayB and not in arrayA */
export function getNotInArrayA<T1, T2>(arrayA: T1[] | readonly T1[] = [], arrayB: T2[] | readonly T2[] = [], compare = (a: T1 | T2, b: T1 | T2) => a === b): T2[] {
    if (!Array.isArray(arrayA) && Array.isArray(arrayB)) return arrayB
    else if (!Array.isArray(arrayB)) return []
    else return arrayB.filter(b => !arrayA.some(a => compare(a, b)))
}

/**
 * @return [] only elements that are in neither arrayA and arrayB
 */
export function getArrayDiff<T1, T2>(arrayA: T1[] | readonly T1[] = [], arrayB: T2[] | readonly T2[] = [], compare = (a: T1 | T2, b: T1 | T2) => a === b): (T1 | T2)[] {
    return [...getNotInArrayA(arrayA, arrayB, compare), ...getNotInArrayA(arrayB, arrayA, compare)]
}

/** filter duplicate values in an array
 * @param {function} comparisonFn default:(a, b) => a === b. A function that shall return true if two values are considered equal
 * @return {array|function}
 */
export function noDuplicateFilter<T extends any[] | readonly any[]>(arr: T, comparisonFn = (a: T, b: T) => a === b): T {
    return arr.filter((a, i, arr) => arr.findIndex(b => comparisonFn(a, b)) === i) as T
}

/** Count number of occurence of item in array */
export function arrayCount(item: any, arr: any[] | readonly any[]): number {
    return arr.reduce((total, item2) => item === item2 ? total + 1 : total, 0)
}

/**
 * @param {Function} comparisonFunction default: (itemToPush, itemAlreadyInArray) => itemToPush === itemAlreadyInArray; comparison function to consider the added item duplicate
 */
export function pushIfNotExist<T>(arrayToPushInto: T[], valueOrArrayOfValuesToBePushed: T | T[], comparisonFunction = (a: T, b: T) => a === b): T[] {
    const valuesToPush = (asArray(valueOrArrayOfValuesToBePushed) as T[]).filter(a => !arrayToPushInto.some(b => comparisonFunction(a, b)))
    arrayToPushInto.push(...valuesToPush)
    return arrayToPushInto
}

export function isNotEmptyArray(arr: any[]): boolean {
    return Array.isArray(arr) && !!arr.length
}

export function randomItemInArray<T extends Array<any> | (readonly any[])>(array: T): T[number] {
    return array[Math.floor(Math.random() * array.length)]
}

/** This has been made because in typescript the FUCKING TYPE OF THE ITEM must be typê of InputArray[number] which is shit since you want to know if the item is included and it may be of any type. In bonus, if type is included in the array, the type will be true */
export function includes<A extends any[] | readonly any[], B>(array: A, item: B): B extends A[number] ? true : boolean {
    return array?.includes(item as any) as any
}