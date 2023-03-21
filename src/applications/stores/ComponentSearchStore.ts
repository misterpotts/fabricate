import {writable, Writable, Readable, derived, Subscriber} from "svelte/store";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";

interface ComponentSearchTerms {
    name?: string;
    hasEssences?: boolean;
    hasSalvage? : boolean;
}

class ComponentSearchStore {

    private readonly _availableComponents: Readable<CraftingComponent[]>;
    private readonly _searchResults: Readable<CraftingComponent[]>;
    private readonly _searchTerms: Writable<ComponentSearchTerms>;

    constructor({
        availableComponents,
        searchTerms = {}
    }: {
        availableComponents: Readable<CraftingComponent[]>;
        searchTerms?: ComponentSearchTerms;
    }) {
        this._availableComponents = availableComponents;
        this._searchTerms = writable(searchTerms);
        this._searchResults = derived(
            [this._availableComponents, this._searchTerms],
            ([$availableComponents, $searchTerms], set) => {
                set(this.searchComponents($availableComponents, $searchTerms));
            }
        );
        this.clearOnSystemSelection(this._availableComponents);
    }

    private clearOnSystemSelection(availableComponents: Readable<CraftingComponent[]>) {
        availableComponents.subscribe(() => this.clear());
    }

    private searchComponents(craftingComponents: CraftingComponent[], searchTerms: ComponentSearchTerms) {
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

    public subscribe(subscriber: Subscriber<CraftingComponent[]>) {
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