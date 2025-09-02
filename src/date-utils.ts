//----------------------------------------
// DATE UTILS
//----------------------------------------
import { isset } from './isset'
import { pad } from './math-utils'
import { DescriptiveError } from './error-utils'
import { err422IfNotSet } from './error-utils'

const int = parseInt

export function getDateAsInt12(dateAllFormat?: Date | string | number, errIfNotValid?: any): string { return getDateAsInt(dateAllFormat, errIfNotValid, true) } // alias

export function humanReadableTimestamp(dateAllFormat: DateAllFormat): number {
    if (isset(dateAllFormat)) dateAllFormat = getDateAsObject(dateAllFormat)
    return parseInt(getDateAsInt12(dateAllFormat) + pad(((dateAllFormat as Date) || new Date()).getUTCSeconds()) + pad(((dateAllFormat as Date) || new Date()).getUTCMilliseconds(), 3))
}

// type DateAllFormat = Date | string | number

/** format for 6/8/2018 => 20180806
 * @param dateAllFormat multiple format allowed 2012, 20120101, 201201011200, new Date(), "2019-12-08T16:19:10.341Z" and all string that new Date() can parse
 */
export function getDateAsInt(dateAllFormat: DateAllFormat = new Date(), errIfNotValid$ = false, withHoursAndMinutes$ = false): string { // optional
    let dateInt
    if (typeof dateAllFormat === 'string' && dateAllFormat.includes('/')) {
        // 01/01/2020 format
        const [d, m, y] = dateAllFormat.split('/')
        return y + m.toString().padStart(2, '0') + d.toString().padStart(2, '0')
    } else if (isDateIntOrStringValid(dateAllFormat)) {
        // we can pass an int or string format (20180106)
        dateInt = (dateAllFormat + '00000000').substr(0, 12) // add default 000000 for "month days minutes:sec" if not set
    } else {
        let date: any = dateAllFormat
        if (typeof date === 'string') date = new Date(date)
        const realDate: Date = date
        //let dateArr = dateAllFormat.toString().split(); // we cannot use ISOString
        dateInt = '' + realDate.getUTCFullYear() + pad(realDate.getUTCMonth() + 1) + pad(realDate.getUTCDate()) + pad(realDate.getUTCHours()) + pad(realDate.getUTCMinutes())
    }
    isDateIntOrStringValid(dateInt, errIfNotValid$)
    return (withHoursAndMinutes$ ? dateInt : dateInt.substr(0, 8))
}


export function getMonthAsInt(dateAllFormat: DateAllFormat = new Date()): number {
    let dateInt
    if (isDateIntOrStringValid(dateAllFormat)) {
        // we can pass an int or string format (20180106)
        dateInt = (dateAllFormat + '').substr(0, 6)
    } else {
        let date: any = dateAllFormat
        if (typeof date === 'string') date = new Date(date)
        //let dateArr = dateAllFormat.toString().split(); // we cannot use ISOString
        dateInt = '' + date.getUTCFullYear() + pad(date.getUTCMonth() + 1)
    }
    return int(dateInt)
}
/**
 * @param dateAllFormat multiple format allowed 2012, 20120101, 201201011200, new Date(), "2019-12-08T16:19:10.341Z" and all string that new Date() can parse
 */
export function getDateAsObject(dateAllFormat: DateAllFormat = new Date(), errIfNotValid$ = true): Date {
    let dateObj = dateAllFormat
    if (isDateIntOrStringValid(dateAllFormat)) {
        const [y, M, d, h, m] = dateStringToArray(dateAllFormat as string)
        dateObj = new Date(`${y}-${M}-${d}T${h}:${m}`)
    } else if (typeof dateAllFormat === 'string') {
        dateObj = new Date(dateAllFormat)
    } else {
        dateObj = new Date((dateAllFormat as Date).getTime()) // clone
    }
    isDateIsoOrObjectValid(dateObj, errIfNotValid$)
    return dateObj
}

/** [2018,01,06] */
export function dateStringToArray(strOrInt: string | number) {
    err422IfNotSet({ strOrInt })

    const dateStr = strOrInt.toString()
    return [
        dateStr.substr(0, 4), // Y
        dateStr.substr(4, 2) || '01', // M
        dateStr.substr(6, 2) || '01', // D
        dateStr.substr(8, 2) || '12', // H 12 default to avoid time shift when converting to dateObj
        dateStr.substr(10, 2) || '00', // M
        dateStr.substr(12, 2) || '00', // S
        dateStr.substr(14, 3) || '000', // MS
    ]
}

/**
 * @param dateAllFormat default: actualDate
 * @returns ['01', '01', '2019'] OR **string** if separator is provided */
export function dateArray(dateAllFormat: DateAllFormat = getDateAsInt()): [string, string, string] {
    const dateStr = getDateAsInt(dateAllFormat).toString()
    return [
        dateStr.substr(6, 2), // D
        dateStr.substr(4, 2), // M
        dateStr.substr(0, 4), // Y
    ]
}

/**
 * @param dateAllFormat default: actualDate
 * @returns ['01', '01', '2019'] OR **string** if separator is provided */
export function dateArrayInt(dateAllFormat: DateAllFormat = getDateAsInt()): [number, number, number] {
    const dateStr = getDateAsInt(dateAllFormat).toString()
    return [
        int(dateStr.substr(6, 2)), // D
        int(dateStr.substr(4, 2)), // M
        int(dateStr.substr(0, 4)), // Y
    ]
}


/**
 * @return 01/01/2012 (alias of dateArrayFormatted(date, '/'))
 */
export function dateFormatted(dateAllFormat: DateAllFormat, separator = '/') { return dateArray(dateAllFormat).join(separator) }

/** Date with custom offset (Ex: +2 for France) */
export function dateOffset(offsetHours: number, dateObj = new Date()) {

    const utc = Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(),
        dateObj.getUTCHours(), dateObj.getUTCMinutes(), dateObj.getUTCSeconds())

    return new Date(utc + (3600000 * offsetHours))
}

//----------------------------------------
// TIME UTILS
//----------------------------------------

/**  */
export function getTimeAsInt(timeOrDateInt: any = getDateAsInt12()) {
    if (isDateIntOrStringValid(timeOrDateInt)) {
        const tl = timeOrDateInt.toString().length
        return int(timeOrDateInt.toString().substring(tl - 4, tl))
    } else if (typeof timeOrDateInt === 'string' && timeOrDateInt.length === 5 && timeOrDateInt.includes(':'))
        return int(timeOrDateInt.replace(':', ''))
    else return 'dateInvalid'
}

/**
 * @param {timeInt|dateInt12} Eg: 2222 OR 201201012222. Default, actual dateInt12
 * @param {String} separator default: ":"
 */
export function getIntAsTime(intOrDateTimeInt = getDateAsInt12(), separator = ':') {
    const time = intOrDateTimeInt.toString().padStart(4, '0')
    const tl = time.length
    return time.substring(tl - 4, tl - 2) + separator + time.substring(tl - 2, tl)
}

export function isTimeStringValid(timeStr: string, outputAnError$ = false) {
    const timeArr = timeStr.split(':')
    const h = int(timeArr[0])
    const m = int(timeArr[1])
    const test1 = h >= 0 && h < 24
    const test2 = m >= 0 && m < 60
    if (outputAnError$ && !(test1 && test2)) throw new DescriptiveError('timeStringOutOfRange', { code: 422, origin: 'Time validator' })
    else return test1 && test2
}

//----------------------------------------
// DURATIONS
//----------------------------------------

export function getDuration(startDate: any, endDate: any, inMinutes = false) {
    const startDateO = getDateAsObject(startDate)
    const endDateO = getDateAsObject(endDate)
    const diffInSec = Math.floor(endDateO.getTime() / 1000) - Math.floor(startDateO.getTime() / 1000)

    if (inMinutes) return Math.floor(diffInSec / 60)
    else return [
        Math.floor(diffInSec / (24 * 3600)), // D
        Math.floor((diffInSec % (24 * 3600)) / 3600), // H
        Math.floor(((diffInSec % (24 * 3600)) % 3600) / 60), // M
    ]
}

type DateEvent = { startDate: any, endDate: any }
/** compare two object with DATE INT, if they overlap return true
 * @param {Object} event1 {startDate, endDate}
 * @param {Object} event2 {startDate, endDate}
 * @param {String} fieldNameForStartDate$ replace startDate with this string
 * @param {String} fieldNameForEndDate$ replace endDate with this string
 * @param {Boolean} allowNull$ if false, retrun false if any of the startdates or enddates are not set
 * @param {Boolean} strict$ if true,
 */
export function doDateOverlap(event1: DateEvent, event2: DateEvent, fieldNameForStartDate$ = 'startDate' as const, fieldNameForEndDate$ = 'endDate' as const, allowNull$ = true, strict$ = false) {
    if (!allowNull$ && !isset(event1[fieldNameForStartDate$], event1[fieldNameForEndDate$], event2[fieldNameForStartDate$], event2[fieldNameForEndDate$])) return false

    if (strict$)
        return (!event2[fieldNameForEndDate$] || event1[fieldNameForStartDate$] < event2[fieldNameForEndDate$]) && (!event1[fieldNameForEndDate$] || event1[fieldNameForEndDate$] > event2[fieldNameForStartDate$])

    return (!event2[fieldNameForEndDate$] || event1[fieldNameForStartDate$] <= event2[fieldNameForEndDate$]) && (!event1[fieldNameForEndDate$] || event1[fieldNameForEndDate$] >= event2[fieldNameForStartDate$])
}

type DateAllFormat = Date | string | number
type DateAllFormatString = DateObjectFormat | DateStringFormats
type DateStringFormats = 'dateInt8' | 'dateInt12' | 'humanReadableTimestamp'
type DateObjectFormat = 'date'

export function nextWeekDay(fromDate: any, weekDayInt?: 0 | 1 | 2 | 3 | 4 | 5 | 6, outputFormat?: DateStringFormats, sameDayAllowed?: boolean): number
export function nextWeekDay(fromDate: any, weekDayInt?: 0 | 1 | 2 | 3 | 4 | 5 | 6, outputFormat?: DateObjectFormat, sameDayAllowed?: boolean): Date
export function nextWeekDay(fromDate: any, weekDayInt?: 0 | 1 | 2 | 3 | 4 | 5 | 6, outputFormat = 'date', sameDayAllowed = false): any {
    const date = getDateAsObject(fromDate)
    if (typeof weekDayInt === 'undefined') weekDayInt = (date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6)
    const toAdd = !sameDayAllowed && date.getDay() === weekDayInt ? 7 : 0
    date.setUTCDate(date.getUTCDate() + toAdd + (7 + weekDayInt - date.getUTCDay()) % 7)
    return getDateAs(date, outputFormat as any)
}

/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function addDays(dateAllFormat?: Date | string | number, numberOfDays?: number, outputFormat?: 'dateInt8' | 'dateInt12' | 'humanReadableTimestamp'): string
export function addDays(dateAllFormat?: Date | string | number, numberOfDays?: number, outputFormat?: 'date'): Date
export function addDays(dateAllFormat: DateAllFormat = getDateAsInt(), numberOfDays = 1, outputFormat: DateAllFormatString = 'date'): any {
    const date = getDateAsObject(dateAllFormat)
    date.setTime(date.getTime() + numberOfDays * 24 * 60 * 60 * 1000)
    return getDateAs(date, outputFormat as any)
}

/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function addMinutes(dateAllFormat?: Date | string | number, numberOfMinutes?: number, outputFormat?: DateStringFormats): string
export function addMinutes(dateAllFormat?: Date | string | number, numberOfMinutes?: number, outputFormat?: DateObjectFormat): Date
export function addMinutes(dateAllFormat: DateAllFormat = getDateAsInt(), numberOfMinutes = 1, outputFormat: DateAllFormatString = 'date'): any {
    const date = getDateAsObject(dateAllFormat)
    date.setTime(date.getTime() + 1 * numberOfMinutes * 60 * 1000)
    return getDateAs(date, outputFormat as any)
}
/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function addHours(dateAllFormat?: Date | string | number, numberOfHours?: number, outputFormat?: 'dateInt8' | 'dateInt12' | 'humanReadableTimestamp'): string
export function addHours(dateAllFormat?: Date | string | number, numberOfHours?: number, outputFormat?: 'date'): Date
export function addHours(dateAllFormat: DateAllFormat = getDateAsInt(), numberOfHours = 1, outputFormat: DateAllFormatString = 'date'): any {
    const date = getDateAsObject(dateAllFormat)
    date.setTime(date.getTime() + 1 * numberOfHours * 60 * 60 * 1000)
    return getDateAs(date, outputFormat as any)
}
/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function addMonths(dateAllFormat?: Date | string | number, numberOfMonths?: number, outputFormat?: 'dateInt8' | 'dateInt12' | 'humanReadableTimestamp'): string
export function addMonths(dateAllFormat?: Date | string | number, numberOfMonths?: number, outputFormat?: 'date'): Date
export function addMonths(dateAllFormat: DateAllFormat = getDateAsInt(), numberOfMonths = 1, outputFormat: DateAllFormatString = 'date'): any {
    const date = getDateAsObject(dateAllFormat)
    date.setUTCMonth(date.getUTCMonth() + numberOfMonths)
    return getDateAs(date, outputFormat as any)
}
/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function addYears(dateAllFormat: DateAllFormat = getDateAsInt(), numberOfYears = 1, outputFormat: DateAllFormatString = 'date') {
    const date = getDateAsObject(dateAllFormat)
    date.setUTCFullYear(date.getUTCFullYear() + numberOfYears)
    return getDateAs(date, outputFormat as any)
}

export function getDayOfMonth(dateAllFormat: DateAllFormat = getDateAsInt()) {
    const dateAsInt = getDateAsInt(dateAllFormat)
    const [, , d] = dateStringToArray(dateAsInt)
    return d
}

export function getYear(dateAllFormat: DateAllFormat = getDateAsInt()) {
    const dateAsInt = getDateAsInt(dateAllFormat)
    const [y] = dateStringToArray(dateAsInt)
    return y
}


export function getHours(dateAllFormat: DateAllFormat = getDateAsInt()) {
    const dateAsInt = getDateAsInt(dateAllFormat)
    const [, , , h] = dateStringToArray(dateAsInt)
    return h
}

export function getMinutes(dateAllFormat: DateAllFormat = getDateAsInt()) {
    const dateAsInt = getDateAsInt(dateAllFormat)
    const [, , , , m] = dateStringToArray(dateAsInt)
    return m
}

/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function lastDayOfMonth(dateAllFormat: DateAllFormat = getDateAsInt(), outputFormat: DateAllFormatString = 'date') {
    const date = getDateAsObject(dateAllFormat)
    const lastDay = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
    lastDay.setUTCHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds())
    return getDateAs(lastDay, outputFormat as any)
}

/**
 * @param {String} outputFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function firstDayOfMonth(dateAllFormat: DateAllFormat = getDateAsInt(), outputFormat: DateAllFormatString = 'date') {
    const date = getDateAsObject(dateAllFormat)
    const firstDay = new Date(date.getUTCFullYear(), date.getUTCMonth(), 1)
    firstDay.setUTCHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds())
    return getDateAs(firstDay, outputFormat as any)
}

export function differenceInMilliseconds(startDateAllFormat: any, endDateAllFormat: any) {
    const startDate = getDateAsObject(startDateAllFormat)
    const endDate = getDateAsObject(endDateAllFormat)
    return endDate.getTime() - startDate.getTime()
}

export function differenceInSeconds(startDateAllFormat: any, endDateAllFormat: any) {
    return differenceInMilliseconds(startDateAllFormat, endDateAllFormat) / 1000
}

export function differenceInMinutes(startDateAllFormat: any, endDateAllFormat: any) {
    return differenceInSeconds(startDateAllFormat, endDateAllFormat) / 60
}

export function differenceInHours(startDateAllFormat: any, endDateAllFormat: any) {
    return differenceInMinutes(startDateAllFormat, endDateAllFormat) / 60
}

export function differenceInDays(startDateAllFormat: any, endDateAllFormat: any) {
    return differenceInHours(startDateAllFormat, endDateAllFormat) / 24
}

export function differenceInWeeks(startDateAllFormat: any, endDateAllFormat: any) {
    return differenceInDays(startDateAllFormat, endDateAllFormat) / 7
}

/**
 * @param {String} outputDateFormat dateInt, dateInt8, dateInt12, date, humanReadableTimestamp, int (dateInt8)
 */
export function getDateAs(dateAllFormat?: Date | string | number, outputFormat?: 'dateInt8' | 'dateInt12' | 'humanReadableTimestamp'): string
export function getDateAs(dateAllFormat?: Date | string | number, outputFormat?: 'date'): Date
export function getDateAs(dateAllFormat: DateAllFormat = new Date(), outputDateFormat: DateAllFormatString = 'date') {
    switch (outputDateFormat) {
        case 'dateInt8':
            return getDateAsInt(dateAllFormat)
        case 'dateInt12':
            return getDateAsInt12(dateAllFormat)
        case 'humanReadableTimestamp':
            return humanReadableTimestamp(dateAllFormat)
        case 'date':
        default:
            return getDateAsObject(dateAllFormat)
    }
}


export function isDateIntOrStringValid(dateStringOrInt: DateAllFormat, outputAnError = false, length?: number): boolean {
    if (!isset(dateStringOrInt)) return false
    const dateStr = dateStringOrInt.toString()

    if (length && dateStr.length !== length) throw new DescriptiveError(`wrongLengthForDateInt`, { code: 422, origin: 'Date Int validator', dateStringOrInt: dateStringOrInt, extraInfo: `${dateStringOrInt} length !== ${length}` })

    if ((typeof dateStringOrInt === 'object' && isNaN(int(dateStr))) || ![4, 6, 8, 10, 12, 17].includes(dateStr.length)) return false

    const dateArr = dateStringToArray(dateStringOrInt as string)
    const [y, M, d, h, m] = dateArr

    const test1 = dateArr.length >= 3 && int(y) >= 1000 // Y
    const test2 = int(M) <= 12 && int(M) > 0 // M
    const test3 = !isset(d) || int(d) <= 31 && int(d) > 0 // D
    const test4 = !isset(h) || (int(h) <= 23 && int(h) >= 0) // H
    const test5 = !isset(m) || (int(m) <= 59 && int(m) >= 0) // M

    if (outputAnError && !(test1 && test2 && test3 && test4 && test5)) throw new DescriptiveError(`dateStringOrIntFormatInvalid`, { code: 422, origin: 'Date Int validator', dateStringOrInt: dateStringOrInt, extraInfo: 'Needs YYYYMMDD[HHMM] between 100001010000 and 999912312359', dateArr, isYearValid: test1, isMonthValid: test2, isDayValid: test3, isHourValid: test4, isMinutesValid: test5 })
    return true
}

export function isDateIsoOrObjectValid(dateIsoOrObj: any, outputAnError = false) {
    let dateObj: Date | number | string = dateIsoOrObj
    if (typeof dateIsoOrObj === 'string') dateObj = new Date(dateIsoOrObj)
    const valid = dateObj instanceof Date
    if (outputAnError && !valid) throw new DescriptiveError('dateIsoStringOrObjectIsNotValid', { code: 422, origin: 'Date Object validator', isoDate: dateIsoOrObj })
    return valid
}