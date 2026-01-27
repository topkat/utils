import { revertObjectKeysAndValues } from './object-utils'

describe('revertObjectKeysAndValues', () => {
  it('should revert keys and values for string keys and number values', () => {
    const input = { a: 1, b: 2, c: 3 }
    const result = revertObjectKeysAndValues(input)
    expect(result).toEqual({ 1: 'a', 2: 'b', 3: 'c' })
  })

  it('should revert keys and values for string keys and string values', () => {
    const input = { a: 'x', b: 'y', c: 'z' }
    const result = revertObjectKeysAndValues(input)
    expect(result).toEqual({ x: 'a', y: 'b', z: 'c' })
  })

  it('should revert keys and values for string keys and number values (mixed)', () => {
    const input = { a: 1, b: 'test', c: 42 }
    const result = revertObjectKeysAndValues(input)
    expect(result).toEqual({ 1: 'a', test: 'b', 42: 'c' })
  })

  it('should handle empty object', () => {
    const input = {}
    const result = revertObjectKeysAndValues(input)
    expect(result).toEqual({})
  })

  it('should handle single key-value pair', () => {
    const input = { key: 'value' }
    const result = revertObjectKeysAndValues(input)
    expect(result).toEqual({ value: 'key' })
  })

  it('should preserve types correctly', () => {
    const input = { a: 1, b: 2 } as const
    const result = revertObjectKeysAndValues(input)
    // Type check: result should have keys 1 and 2, values 'a' and 'b'
    expect(result[1]).toBe('a')
    expect(result[2]).toBe('b')
  })

  it('should handle numeric keys', () => {
    const input = { 1: 'a', 2: 'b', 3: 'c' }
    const result = revertObjectKeysAndValues(input)
    expect(result).toEqual({ a: '1', b: '2', c: '3' })
  })

  it('should handle duplicate values by keeping the last one', () => {
    const input = { a: 1, b: 1, c: 2 }
    const result = revertObjectKeysAndValues(input)
    // When values are duplicated, the last key overwrites
    expect(result[1]).toBe('b')
    expect(result[2]).toBe('c')
    expect(Object.keys(result)).toHaveLength(2)
  })

  it('should handle symbol values', () => {
    const sym1 = Symbol('test1')
    const sym2 = Symbol('test2')
    const input = { a: sym1, b: sym2 }
    const result = revertObjectKeysAndValues(input)
    expect(result[sym1]).toBe('a')
    expect(result[sym2]).toBe('b')
  })
})
