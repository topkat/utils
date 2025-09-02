
export function cleanStackTrace(stack: any) {
    if (typeof stack !== 'string') return ''
    stack.replace(/home\/[^/]+\/[^/]+\//g, '')
    const lines = stack.split('\n')
    const removeIfContain = [
        'logger-utils.js',
        'TCP.onread',
        'readableAddChunk',
        'Socket.EventEmitter.emit (domain.js',
        'Socket.emit (events.js',
        'Connection.EventEmitter.emit (domain.js',
        'Connection.emit (events.js',
        'Socket.Readable.push (_stream_readable',
        'model.Query',
        'Object.promiseOrCallback',
        'Connection.<anonymous>',
        'process.topLevelDomainCallback',
        // internal
        'internal/process',
        'internal/timers',
        'internal/modules',
        'internal/main',
        'DefaultError.throw',
        'Object.throw',
        'mongoose/lib/utils',
        'at Array.forEach (<anonymous>)',
        '/core.error.'
    ]
    const linesClean = lines
        .filter(l => l && !removeIfContain.some(text => l.includes(text)))
        .map((line, i) => {
            if (i === 0) return '' // usually just the word "Error:"
            else return line
        })
        .join('\n')
    return linesClean
}
