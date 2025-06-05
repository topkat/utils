# Topkat Utils

```
|\_____/| ▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ |\_____/|
|  |||  |    █  █▀▀█ █▀▀█ █  █ ▄▀▀▄ ▀▀█▀▀    █  █ ▀▀█▀▀ █ █   █▀▀▀ |  |||  |
\◥■■=■■◤/    █  █  █ █▀▀▀ █▀▀▄ █▀▀█   █      █  █   █   █ █   ▀▀▀█ \◥■■=■■◤/
 \__^__/     ▀  ▀▀▀▀ ▀    ▀  ▀ ▀  ▀   ▀      ▀▀▀▀   ▀   ▀ ▀▀▀ ▀▀▀▀  \__^__/
```

A powerful collection of utility functions for JavaScript/TypeScript projects. Fast, functional, and fully typed.

## Installation

```bash
npm install topkat-utils
# or
yarn add topkat-utils
```

## Error handler

- `DescriptiveError(value, type)`: Improves JS `Error` class by adding a way to add extraInformations to error, which is a must have in the context of debugging and logging the right informations
```typescript
// Example usage
try {
  if(user.age < 18) {
    throw new DescriptiveError('Not allowed', { age: user.age, code: 403, ...additionalInfosToDisplayInLogs })
  }
} catch (error) {
  // Error message: "Expected number, got string: '25'"
  C.error(error.message) //
  C.error(error.logs) // display logs as string array
  C.error(error.errorDescription) // display all extraInfos / options provided as second param
}
```

## Logger

- `C`: all in one logger util
```typescript
// Basic usage
C.log('Hello World')   // [INFO] Hello World
C.info('Info!')        // [INFO] Info! Usually blue

// Errors and warning will take the most informations out of your errors and does particularly fit with DescriptiveError() class
C.error('Oops!')       // [ERROR] Oops! Error: Something went wrong\nat doSomething (/app/src/utils.js:42:15)...
C.error(false, 'Oops!')// Error without stack trace
C.warning('Warning!')     // [WARN] Warning! Error: Something went wrong\nat doSomething (/app/src/utils.js:42:15)...
C.warning(false, 'Warning!') // Same without stack trace

// With objects parsing
C.log({ user: 'John', age: 30 }) // [INFO] { user: 'John', age: 30 }
// Terminal custom colors
C.log(C.red('Hello') + C.dim('World') + C.green('of') + C.logClr('Typescript', [0, 255, 150]))

C.success('Successfully built') // Color green `'✓ Successfully built'`

C.clearLastLines(2) // clears the last two lines of the terminal
```
- `perfTimer()`: Util to measure performances
``` typescript
const time = perfTimer()

for(let i = 0; i < 9999;i++) longProcess()

console.log('Process took ' + time.end()) // 'Process took 2.22 seconds
```
- `cliProgressBar`
- `cliLoadingSpinner`
- `removeCircularJSONstringify(str)`: convert circular structures to valid JSON  // TypeError: Converting circular structure to JSON

## Core Utilities

### Value Checking & Validation
- `validator(value, type)`: Type validation utility. Will throw an error if not valid. If you prefer that the function returns an error array, use `validatorReturnErrArray`
```typescript
validator(
    { value: 3, type: 'number', gte: 1, lte: 3 },
    { name: 'email', value: 'name@site.com', regexp: /[^\s@]+@[^\s@]+\.[^\s@]/},
)
```
- `isset(value)`: Check if a value is defined and not null (ignores other falsy values)
- `isEmpty(value)`: Check if a value is empty
- `isObject(value)`: Check if value is a plain object (not null, not Date, not array, etc.)

### Object Manipulation
- `deepClone(obj)`: Deep clone objects, useful when you want to manipulate object with subobjects without modifying any references to those objects
- `mergeDeep(obj1, obj2)`: Deep merge objects
- `objForceWrite(obj, 'user.address.line1', addressVar)`, `objForceWriteIfNotSet()`: Forces a path to be written in nested object and create subObjects if necessary
- `flattenObject(obj)`: Flatten nested objects with pros as dot notation
```typescript
// Example of flattenObject
const nested = {
  user: {
    name: 'John',
    address: {
      street: '123 Main St',
      city: 'New York'
    }
  },
  settings: {
    theme: 'dark'
  }
}

const flattened = flattenObject(nested)
// Result:
// {
//   'user.name': 'John',
//   'user.address.street': '123 Main St',
//   'user.address.city': 'New York',
//   'settings.theme': 'dark'
// }
```
- `unflattenObject(obj)`: Unflatten objects back to nested structure
- `objFilterUndefined(obj)`: Remove undefined values from object
- `findByAddress(obj, path)`: Get value by dot notation path
```typescript
const obj = {
  user: {
    profile: {
      name: 'John'
    }
  }
}

findByAddress(obj, 'user.profile.name') // 'John'
findByAddress(obj, 'user.settings.theme') // undefined
```

### Array Operations
- `shuffleArray(array)`: Randomize array order
- `randomItemInArray(array)`: Get random item from array
- `pushIfNotExist(array, item)`: Push item if not already present
- `noDuplicateFilter(array)`: Remove duplicates from array
- `getArrayInCommon(arr1, arr2)`: Get common elements between arrays
- `getArrayDiff(arr1, arr2)`: Get difference between arrays
- `arrayCount(arr, 'stringInstance')`: Count number of occurence of item in array


### Number Operations
- `isBetween(value, min, max)`: Check if a number is within a range
- `random(min, max)`: Generate random number between two values
- `minMax(value, min, max)`: Clamp a number between min and max values
- `average(array)`: Calculate average of array values
- `sumArray(array)`: Sum values in an array
- `round(number, nbDecimals)`: Round number to X decimal places
- `round2(number)`: Round number to 2 decimal places

### String Manipulation
- `miniTemplater(template, data)`: Simple template engine
```typescript
// Basic usage
miniTemplater('Hello {{name}}!', { name: 'John' }) // 'Hello John!'
```
- `cln(value)`: Clean string for printing (undefined, null, NaN)
- `pad(number, length)`: Pad numbers with leading zeros
- `generateToken(length, isUnique, mode)`: Generate random tokens (not to use un security workflows)
- `convertAccentedCharacters(str, options)`: Eg: `'éçàÉ' => 'ecaE'`. Convert accented characters to non-accented with options to remove spaces or numbers
- `nbOccurenceInString(str, occurence)`

### Loop Operations
- `forI`, `forIAsync`: A mix between js `for(let i = ....i++)` loop and a map. Iterates over a specified number of times, passing each iteration's result to the next callback
```typescript
// Generate Fibonacci sequence
forI(8, (i, previousItem, results) => {
  if (i <= 1) return 1
  return results[i-1] + results[i-2]
})
// Returns: [1, 1, 2, 3, 5, 8, 13, 21]
```
- `recursiveGenericFunction`, `recursiveGenericFunctionSync`: The simplest way do iterate recursively on every item of an object
```typescript
recursiveGenericFunctionSync(
    { a: { b: true } }, // object OR array
    (item, addr, lastElementKey, parent) => {
        C.log(item)           // true
        C.log(addr)           // 'a.b'
        C.log(lastElementKey) // 'b'
        C.log(parent)         // { a: { b: 3 } }
        C.log(findByAddress(addr)) // true // just aother way to get the value
        return false
    }
)
```

### Date Operations
- `getDateAsInt(date)`: Convert date to integer format (20290101)
- `dateOffset(date, offset)`: Add time offset to date
- `getDuration(start, end)`: Calculate duration between dates
- `isWeekend(date)`: Check if date is weekend
- `firstDayOfMonth(date)`: Get first day of month
- `lastDayOfMonth(date)`: Get last day of month

### URL & Path Operations
- `urlPathJoin(...paths)`: Join URL paths (like path.join but for URLs)
```typescript
// Handles double slashes correctly
urlPathJoin('https://api.example.com//v1', '/users/', 'userId') // => 'https://api.example.com/v1/users/userId'
```

- `escapeRegexp(str)`:  Will escape all special character in a string to output a valid regexp string to put in RegExp(myString)
  - Eg: from `'path.*.addr(*)'` will output `'aa\..*?\.addr\(.*?\)'` so regexp match `'path.random.addr(randomItem)'`

### Case Conversion
- `camelCaseify(str)`: Replace `'hello-world'`, `'hello World'`, `'hello_World'`, `'helloWorld'` => `'helloWorld'`
- `capitalize1st(string)`: `helloWorld` => `HelloWorld`
- `camelCase([word1, word2])`: Convert to camelCase
- `snakeCase([word1, word2])`: Convert to snake_case
- `kebabCase([word1, word2])`: Convert to kebab-case
- `pascalCase([word1, word2])`: Convert to PascalCase
- `titleCase([word1, word2])`: Convert to Titlecase

## Additional Utilities


### Environment & Configuration
- `ENV`: shortcut to `process.env`. Parse boolean and number values
- `parseBool(value)`: Parse boolean values


### Async Operations
- `timeout(ms)`: Promise-based timeout

## Object Control
- `readOnly(obj)`: Lock all 1st level props of an object to read only (not rewritable / modifiable)
- `reassignForbidden(obj)`: Fields of the object can be created BUT NOT reassignated
- `readOnlyRecursive(obj)`: All fields and subFields of the object will be readOnly
- `createProxy(obj)`: replace `new Proxy(...)` from javascript with correct handling for JSON.stringify and a `__isProxy: true` helper prop

### Typescript equivalent of Js functions (Fix types)
- `lowerCase(str)`: `lowerCase('HelloWorld' as const) // type: 'helloworld'` (Equivalent of type `LowerCase<MyString>`)
- `upperCase(str)`: `upperCase('HelloWorld' as const) // type: 'HELLOWORLD'` (Equivalent of type `UpperCase<MyString>`)
- `objEntries(obj)`: In JS object entries are not correctly typed (`Object.entries({ a: 1, b: true }) // type: [string, number | boolean]`). With this function we are typed like `objEntries({ a: 1, b: true }) // ["a", number] | ["b", boolean]`
- `objKeys`: In JS object keys are not correctly typed (`Object.keys({ a: 1, b: 2 }) // type: string`). With this function we are typed like `objKeys({ a: 1, b: 2 }) // type: 'a' | 'b'`
- `includes(str)`: Fix this always happening ts error when using includes and your search string is not typed as an array element (which is very dumb IMO)

## Configuration

Place that at the top of your code

``` typescript
registerConfig({
  terminal: {
    // Custom colors for terminal logs
    theme: {...},
    // disable colors in case your logs are outputted as plain text
    noColor: true,
  },
  // if you use topkatUtils as a logger and error handler
  // onError custom callback
  onError: () => { /**  */ },
  /** Exemple of preprocessing log */
  preprocessLog(log: string) { return 'MyAppName: ' + Date.now() + ' ' + log }
})
```

## TypeScript Support

This library is fully typed and provides TypeScript definitions out of the box. Every Util is documented via JsDoc and documentation should appear on hover in your IDE

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request

## Used by

This lib is used as util library in [green_dot backend framework](https://github.com/topkat/green_dot)

## License

MIT

## Support

If you need help or have questions, please open an issue on GitHub.