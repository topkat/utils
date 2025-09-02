

/** Best way to stringify a value! Default indent: 2 */
export function removeCircularJSONstringify(object: Record<string, any>, indent = 2) {
    const getCircularReplacer = () => {
        const seen = new WeakSet()
        return (_: any, value: any) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return
                }
                seen.add(value)
            }
            return value
        }
    }

    return JSON.stringify(object, getCircularReplacer(), indent)
}