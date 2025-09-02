


import { transaction } from './transaction-utils'

import { timeout } from './timer-utils'


describe('TRANSACTION TEST', () => {
    const statusArr = [] as number[]

    const asyncCallback = (i: number) => async () => {
        await timeout(1000)
        statusArr.push(i)
    }

    it('should execute the async callback and resolve the result', async () => {

        transaction('test', asyncCallback(1), 1500)
        transaction('test', asyncCallback(2), 1500)
        const now = Date.now()
        await transaction('test', asyncCallback(3), 1500)
        const timeSpent = Date.now() - now

        expect(statusArr).toEqual([1, 2, 3])

        expect(timeSpent < 5000).toEqual(true)
        expect(timeSpent > 2999).toEqual(true)

    })


    it('Second run', async () => {



        transaction('test', asyncCallback(4), 1500)
        transaction('test', asyncCallback(5), 1500)
        const now = Date.now()
        await transaction('test', asyncCallback(6), 1500)
        const timeSpent = Date.now() - now

        expect(statusArr).toEqual([1, 2, 3, 4, 5, 6])

        expect(timeSpent < 5000).toEqual(true)
        expect(timeSpent > 2999).toEqual(true)

    })

    const infiniteCallback = async () => await timeout(5000)


    it('Transaction timeout if the transaction is infinite and other transaction run correctly', async () => {

        const now = Date.now()
        let hasErr = false
        try {
            await transaction('test', infiniteCallback, 1000)
        } catch (err) {
            hasErr = true
        }
        const timeSpent = Date.now() - now

        await transaction('test', asyncCallback(7), 1500)

        expect(hasErr).toEqual(true)

        expect(statusArr).toEqual([1, 2, 3, 4, 5, 6, 7])

        expect(timeSpent < 2000).toEqual(true)
        expect(timeSpent > 999).toEqual(true)

    })
})