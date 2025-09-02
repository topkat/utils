export function isset(...elms: any[]) {
    return elms.every(elm => typeof elm !== 'undefined' && elm !== null)
}