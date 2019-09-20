import HashTally, {
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

    it('gets the top 2 counts of a map', ()=>{
        const map = {
            a: 3,
            d: 1,
            c: 10,
            e: 91
        };

        expect(getTop(map, 2)).toStrictEqual(['e', 'c']);
    });
});

describe('HashTally', ()=>{
    it('adds missing keys during increment', ()=>{
        const tally = new HashTally();
        expect(tally.top(2)).toStrictEqual([]);
        expect(tally.countKeys()).toBe(0);

        tally.increment('Test Key 1');
        expect(tally.top(2)).toStrictEqual(['Test Key 1']);
        expect(tally.countKeys()).toBe(1);
    });

    it('does not add missing keys during decrement', ()=>{
        const tally = new HashTally();
        expect(tally.top(2)).toStrictEqual([]);
        expect(tally.countKeys()).toBe(0);

        tally.decrement('Test Key 1');
        expect(tally.top(2)).toStrictEqual([]);
        expect(tally.countKeys()).toBe(0);
    });

    it('tracks multiple keys and returns correct number of keys', ()=>{
        const tally = new HashTally();

        tally.increment('Test Key 1');
        expect(tally.top(2)).toStrictEqual(['Test Key 1']);
        expect(tally.countKeys()).toBe(1);

        tally.increment('Test Key 2', 5);
        expect(tally.top(2)).toStrictEqual(['Test Key 2', 'Test Key 1']);
        expect(tally.countKeys()).toBe(2);

        tally.increment('Test Key 3');
        expect(tally.top(2)).toStrictEqual(['Test Key 2', 'Test Key 1']);
        expect(tally.countKeys()).toBe(3);

        tally.increment('Test Key 4', 2);
        expect(tally.top(2)).toStrictEqual(['Test Key 2', 'Test Key 4']);
        expect(tally.countKeys()).toBe(4);
    });

    it('returns 0 count for missing keys', ()=>{
        const tally = new HashTally();

        expect(tally.count('Test Key 1')).toBe(0);
    });

    it('correctly decrements a tally', ()=>{
        const tally = new HashTally();

        tally.increment('Test Key 1', 6);
        expect(tally.count('Test Key 1')).toBe(6);

        tally.decrement('Test Key 1', 1);
        expect(tally.count('Test Key 1')).toBe(5);
    });

    it('removes zeroed tallies', ()=>{
        const tally = new HashTally();

        tally.increment('Test Key 1');
        expect(tally.top(2)).toStrictEqual(['Test Key 1']);
        expect(tally.countKeys()).toBe(1);

        tally.decrement('Test Key 1', 6);
        expect(tally.top(2)).toStrictEqual([]);
        expect(tally.countKeys()).toBe(0);
    });
});