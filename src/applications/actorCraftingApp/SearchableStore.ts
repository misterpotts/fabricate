import {derived, get, Readable, Subscriber, writable, Writable} from "svelte/store";

/**
 * @description A searchable store holds a list of items and search terms, projecting a derived list of items that match
 *  the search terms.
 * @param {T} T - The type of the Search Terms
 * @param {I} I - The type of the Items
 */
interface SearchableStore<T extends object, I> extends Readable<I[]> {

    searchTerms: T;

    items: I[];

    clearSearchTerms(): void;

}

export { SearchableStore }

class DefaultSearchableStore<T extends object, I> implements SearchableStore<T, I> {

    private readonly _items: Writable<I[]>;
    private readonly _searchTerms: Writable<T>;
    private readonly _searchResults: Readable<I[]>;
    private readonly _searchFunction: (item: I, searchTerms: T) => boolean;

    constructor({
        items = [],
        searchTerms = {} as T,
        searchFunction = () => true
    }: {
        items?: [];
        searchTerms?: T;
        searchFunction?: (item: I, searchTerms: T) => boolean;
    } = {}) {
        this._items = writable(items);
        this._searchTerms = writable(searchTerms);
        this._searchFunction = searchFunction;
        this._searchResults = derived(
            [this._items, this._searchTerms],
            ([$items, $searchTerms], set) => {
                set(this.search($items, $searchTerms));
            }
        );
    }

    private search(items: I[], searchTerms: T) {
        return items.filter((item) => this._searchFunction(item, searchTerms));
    }

    get searchTerms(): T {
        return get(this._searchTerms);
    }

    set searchTerms(value: T) {
        this._searchTerms.set(value);
    }

    get items(): I[] {
        return get(this._items);
    }

    set items(value: I[]) {
        this._items.set(value);
    }

    public subscribe(subscriber: Subscriber<I[]>) {
        return this._searchResults.subscribe(subscriber);
    }

    public clearSearchTerms(): void {
        this._searchTerms.set({} as T);
    }

}

export { DefaultSearchableStore }