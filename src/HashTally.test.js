import {
    getTop
} from './HashTally';

describe('getTop', ()=>{
    it('gets the top 3 counts of a map', ()=>{
        const map = {
            a: 0,
            d: 5,
            c: 2,
            e: 2
        };

        expect(getTop(map, 3)).toStrictEqual(['d', 'c', 'e']);
    });
});