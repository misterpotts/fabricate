interface MultiKeyMap<KL, KR, V> {
    has(key: { left: KL, right: KR } | { left: KL } | { right: KR }): boolean;
    set(left: KL, right: KR, value: V): void;
    delete(key: { left: KL, right: KR } | { left: KL } | { right: KR }): void;
    get(key: { left: KL, right: KR } | { left: KL } | { right: KR }): V;
    values(): IterableIterator<V>;
    size: number;
    clear(): void;
    leftKeys(): IterableIterator<KL>;
    rightKeys(): IterableIterator<KR>;
    leftSingleKeyMap(): Map<KL, V>;
    rightSingleKeyMap(): Map<KR, V>;

    entries(): Iterator<MultiKeyEntry<KL, KR, V>>;
}

interface MultiKeyEntry<KL, KR, V> {
    right: KR;
    left: KL;
    value: V;
}

class MultiKeyMapIterator<KL, KR, V> implements IterableIterator<MultiKeyEntry<KL, KR, V>> {

    private _index: number;
    private readonly _values: MultiKeyEntry<KL, KR, V>[];

    constructor(values: MultiKeyEntry<KL, KR, V>[]) {
        this._values = values;
        this._index = 0;
    }

    next(): IteratorResult<MultiKeyEntry<KL, KR, V>> {
        const done = this._index >= this._values.length;
        const value = !done ? this._values[this._index] : undefined;
        this._index = !done ? this._index++ : this._index;
        return {
            done,
            value
        }
    }

    [Symbol.iterator](): IterableIterator<MultiKeyEntry<KL, KR, V>> {
        return this;
    }

}

class MultiKeyHashMap<KL, KR, V> implements MultiKeyMap<KL, KR, V> {

    private readonly _left: Map<KL, V>;
    private readonly _leftLookup: Map<KR, KL>;
    private readonly _right: Map<KR, V>;
    private readonly _rightLookup: Map<KL, KR>;

    constructor() {
        this._right = new Map();
        this._rightLookup = new Map();
        this._left = new Map();
        this._leftLookup = new Map();
    }

    delete(key: { left: KL, right: KR } | { left: KL } | { right: KR }): void {
        if (!key) { return }
        const { left, right } = this.lookupKeys(key);
        if (!left || !right) {
            return;
        }
        this._left.delete(left);
        this._rightLookup.delete(left);
        this._right.delete(right);
        this._leftLookup.delete(right);
    }

    private lookupKeys(key: { left: KL, right: KR } | { left: KL } | { right: KR }): { left: KL, right: KR} {
        let left: KL;
        let right: KR;
        if ("left" in key && "right" in key) {
            left = key.left;
            right = key.right;
        } else if ("left" in key) {
            left = key.left;
            right = this._rightLookup.get(left);
        } else if ("right" in key) {
            right = key.right;
            left = this._leftLookup.get(right);
        }
        return { right, left };
    }

    get(key: { left: KL, right: KR } | { left: KL } | { right: KR }): V {
        if (!key) { return }
        const { left, right } = this.lookupKeys(key);
        if (!left || !right) {
            return;
        }
        return this._left.get(left);
    }

    has(key: { left: KL, right: KR } | { left: KL } | { right: KR }): boolean {
        if (!key) { return }
        const { left, right } = this.lookupKeys(key);
        if (!left || !right) {
            return;
        }
        return this._left.has(left);
    }

    set(left: KL, right: KR, value: V): void {
        if (!left || !right) { return }
        if (this._left.has(left) && this._rightLookup.get(left) !== right) { throw new Error("Keys may only appear in one key pair. "); }
        if (this._right.has(right) && this._leftLookup.get(right) !== left) { throw new Error("Keys may only appear in one key pair. "); }
        this._left.set(left, value);
        this._leftLookup.set(right, left);
        this._right.set(right, value);
        this._rightLookup.set(left, right);
    }

    values(): IterableIterator<V> {
        return this._left.values();
    }

    get size(): number {
        return this._left.size;
    }

    leftKeys(): IterableIterator<KL> {
        return this._left.keys();
    }

    rightKeys(): IterableIterator<KR> {
        return this._right.keys();
    }

    clear(): void {
        this._right.clear();
        this._rightLookup.clear();
        this._left.clear();
        this._leftLookup.clear();
    }

    leftSingleKeyMap(): Map<KL, V> {
        return new Map<KL, V>(this._left);
    }

    rightSingleKeyMap(): Map<KR, V> {
        return new Map<KR, V>(this._right)
    }

    entries(): IterableIterator<MultiKeyEntry<KL, KR, V>> {
        const entriesArray: MultiKeyEntry<KL, KR, V>[] = Array.from(this._left.keys()).map(left => {
            const right = this._rightLookup.get(left);
            const value = this._left.get(left);
            return {right, left, value}
        });
        return new MultiKeyMapIterator(entriesArray);
    }

    [Symbol.iterator](): Iterator<MultiKeyEntry<KL, KR, V>> {
        return this.entries();
    }
}

export { MultiKeyMap, MultiKeyHashMap, MultiKeyEntry, MultiKeyMapIterator }