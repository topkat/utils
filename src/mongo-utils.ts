//----------------------------------------
// MONGO UTILS
//----------------------------------------
import { isType } from './validation-utils'
import { isset } from './isset'

/** @return undefined if cannot find _id */
export function getId(obj: any): string | undefined {
    if (!obj) return // null case
    if (obj._id) return obj._id.toString()
    else if (isType(obj, 'objectId')) return obj.toString()
    else return
}

/** Merge filter with correct handling of OR and AND
 * @param {Object} filterA
 * @param {Object} filterB
 * @param {Boolean} assignToFilterA defualt false: if true, it will modify filterA, else it will return merged filters as a new object
 */
export function mongoFilterMerger(filterA: any, filterB: any, assignToFilterA = false) {
    if (isset(filterA.$and) && isset(filterB.$and)) {
        filterA.$and.push(...filterB.$and)
        delete filterB.$and
    }
    if (isset(filterA.$or) && isset(filterB.$or)) {
        if (!isset(filterA.$and)) filterA.$and = []
        filterA.$and.push({ $or: filterA.$or }, { $or: filterA.$or })
        delete filterB.$or
    }
    if (assignToFilterA) {
        Object.assign(filterA, filterB)
        return filterA
    } else return { ...filterA, ...filterB }
}

export function mongoPush(field: string, value: any, fields: { [k: string]: any }) {
    if (!isset(fields.$push)) fields.$push = {}
    fields.$push[field] = value
}