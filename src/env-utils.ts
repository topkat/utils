//----------------------------------------
// ENV UTILS
//----------------------------------------

/** Parse one dimention object undefined, true, false, null represented as string will be converted to primitives */
export function parseEnv(env: Record<string, any>) {
    const newEnv = {} as Record<string, undefined | null | number | boolean | string>
    for (const k in env) {
        const val = env[k]
        if (val === 'undefined') newEnv[k] = undefined
        else if (val === 'true') newEnv[k] = true
        else if (val === 'false') newEnv[k] = false
        else if (val === 'null') newEnv[k] = null
        else newEnv[k] = env[k]
    }
    return newEnv
}

/** READ ONLY, get the environment variables (Eg. NODE_ENV) with parsed values ("true" => true, "4" => 4, "null" => null). On env variables all values are strings
 * use it like ENV().NODE_ENV
 */
export function ENV(): { [key: string]: any } {
    const throwErr = () => { throw new Error('Please use process.env to write to env') }
    return new Proxy(parseEnv(process.env), {
        set: throwErr,
        defineProperty: throwErr,
        deleteProperty: throwErr,
    })
}