import { dateFormatted, getDateAsInt, dateArray, getDateAsObject, getDateAsInt12 } from './date-utils'

describe('dateFormatted', () => {
  it('should format a YYYY-MM-DD string with default separator', () => {
    expect(dateFormatted('2023-05-15')).toBe('15/05/2023')
  })

  it('should format a YYYY-MM-DD string with custom separator', () => {
    expect(dateFormatted('2023-05-15', '-')).toBe('15-05-2023')
    expect(dateFormatted('2023-05-15', '.')).toBe('15.05.2023')
  })

  it('should format a dateInt8 string', () => {
    expect(dateFormatted('20230515')).toBe('15/05/2023')
  })

  it('should format a dateInt8 number', () => {
    expect(dateFormatted(20230515)).toBe('15/05/2023')
  })

  it('should format an ISO date string', () => {
    expect(dateFormatted('2023-05-15T10:30:00.000Z')).toBe('15/05/2023')
  })

  it('should format a Date object', () => {
    const date = new Date(Date.UTC(2023, 4, 15)) // May 15 2023
    expect(dateFormatted(date)).toBe('15/05/2023')
  })

  it('should format a DD/MM/YYYY string', () => {
    expect(dateFormatted('15/05/2023')).toBe('15/05/2023')
  })

  it('should handle single-digit day and month in YYYY-MM-DD', () => {
    expect(dateFormatted('2023-01-05')).toBe('05/01/2023')
  })

  it('should handle end-of-year dates', () => {
    expect(dateFormatted('2023-12-31')).toBe('31/12/2023')
  })

  it('should handle start-of-year dates', () => {
    expect(dateFormatted('2023-01-01')).toBe('01/01/2023')
  })
})

describe('getDateAsInt', () => {
  it('should convert YYYY-MM-DD string to dateInt8', () => {
    expect(getDateAsInt('2023-05-15')).toBe('20230515')
  })

  it('should convert YYYY-MM-DD with single digits', () => {
    expect(getDateAsInt('2023-01-05')).toBe('20230105')
  })

  it('should convert dateInt8 number', () => {
    expect(getDateAsInt(20230515)).toBe('20230515')
  })

  it('should convert dateInt8 string', () => {
    expect(getDateAsInt('20230515')).toBe('20230515')
  })

  it('should convert DD/MM/YYYY format', () => {
    expect(getDateAsInt('15/05/2023')).toBe('20230515')
  })

  it('should convert a Date object', () => {
    const date = new Date(Date.UTC(2023, 4, 15, 10, 30))
    expect(getDateAsInt(date)).toBe('20230515')
  })

  it('should convert an ISO string', () => {
    expect(getDateAsInt('2023-05-15T10:30:00.000Z')).toBe('20230515')
  })

  it('should include hours and minutes when requested', () => {
    const date = new Date(Date.UTC(2023, 4, 15, 10, 30))
    expect(getDateAsInt(date, false, true)).toBe('202305151030')
  })
})

describe('dateArray', () => {
  it('should return [DD, MM, YYYY] from YYYY-MM-DD string', () => {
    expect(dateArray('2023-05-15')).toEqual(['15', '05', '2023'])
  })

  it('should return [DD, MM, YYYY] from dateInt8', () => {
    expect(dateArray(20230515)).toEqual(['15', '05', '2023'])
  })
})

describe('getDateAsInt12', () => {
  it('should return 12-digit int string from YYYY-MM-DD', () => {
    const result = getDateAsInt12('2023-05-15')
    expect(result).toHaveLength(12)
    expect(result.substring(0, 8)).toBe('20230515')
  })
})
