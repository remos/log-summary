export const fallbackComparator=(...comparators)=>(a, b)=>(
    comparators.reduce((comparison, comparator)=>(
        comparison == 0 ? comparator(a, b) : comparison
    ), 0)
);

export function getTop(map, count) {
    return Object.keys(map)
        .sort(fallbackComparator(
            (a, b)=>map[b] - map[a],
            (a, b)=>a.localeCompare(b)
        ))
        .slice(0, count);
}

export default class HashTally {
    constructor() {
        this.map = {};
    }

    increment(key, count=1) {
        this.map[key] = (this.map[key] || 0) + count;
    }

    decrement(key, count=1) {
        if(!(key in this.map)) {
            return;
        }

        this.increment(key, -count);
        
        if(this.map[key] <= 0) {
            delete this.map[key];
        }
    }

    top(count) {
        return getTop(this.map, count);
    }

    count(key) {
        return this.map[key] || 0;
    }

    countKeys() {
        return Object.keys(this.map).length;
    }
}