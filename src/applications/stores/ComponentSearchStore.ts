import {writable, Writable, Readable, derived, Subscriber} from "svelte/store";
import {Component} from "../../scripts/crafting/component/Component";

interface ComponentSearchTerms {
    name?: string;
    hasEssences?: boolean;
    hasSalvage? : boolean;
}

class ComponentSearchStore {

    private readonly _availableComponents: Readable<Component[]>;
    private readonly _searchResults: Readable<Component[]>;
    private readonly _searchTerms: Writable<ComponentSearchTerms>;

    constructor({
        components,
        searchTerms = {}
    }: {
        components: Readable<Component[]>;
        searchTerms?: ComponentSearchTerms;
    }) {
        this._availableComponents = components;
        this._searchTerms = writable(searchTerms);
        this._searchResults = derived(
            [this._availableComponents, this._searchTerms],
            ([$availableComponents, $searchTerms], set) => {
                set(this.searchComponents($availableComponents, $searchTerms));
            }
        );
        this.clearOnSystemSelection(this._availableComponents);
    }

    private clearOnSystemSelection(availableComponents: Readable<Component[]>) {
        availableComponents.subscribe(() => this.clear());
    }

    private searchComponents(craftingComponents: Component[], searchTerms: ComponentSearchTerms) {
        return craftingComponents.filter((component) => {
            if (searchTerms.hasEssences && !component.hasEssences) {
                return false;
            }
            if (searchTerms.hasSalvage && !component.isSalvageable) {
                return false;
            }
            if (!searchTerms.name) {
                return true;
            }
            return component.name.search(new RegExp(searchTerms.name, "i")) >= 0;
        });
    }

    public subscribe(subscriber: Subscriber<Component[]>) {
        return this._searchResults.subscribe(subscriber);
    }

    public get searchTerms(): Readable<ComponentSearchTerms> {
        return this._searchTerms;
    }

    clear() {
        this._searchTerms.set({
            name: "",
            hasSalvage: false,
            hasEssences: false
        })
    }
}

export { ComponentSearchStore, ComponentSearchTerms }