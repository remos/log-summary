export const fallbackComparitor=(...comparitors)=>(a, b)=>(
    comparitors.reduce((comparison, comparitor)=>(
        comparison == 0 ? comparitor(a, b) : comparison
    ), 0)
);

export function getTop(map, count) {
    return Object.keys(map)
        .sort(fallbackComparitor(
            (a, b)=>map[b] - map[a],
            (a, b)=>a - b
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
        this.increment(key, -count);
    }

    top(count) {
        return getTop(this.map, count);
    }

    countKeys() {
        return Object.keys(this.map).length;
    }
}