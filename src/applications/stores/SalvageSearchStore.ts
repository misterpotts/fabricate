import {writable, Writable, Readable, derived, Subscriber} from "svelte/store";
import {Component} from "../../scripts/common/Component";

interface SalvageSearchTerms {
    name?: string;
}

class SalvageSearchStore {

    private readonly _availableComponents: Readable<Component[]>;
    private readonly _selectedComponent: Readable<Component>;
    private readonly _searchResults: Readable<Component[]>;
    private readonly _searchTerms: Writable<SalvageSearchTerms>;

    constructor({
        availableComponents,
        selectedComponent,
        searchTerms = {}
    }: {
        availableComponents: Readable<Component[]>;
        selectedComponent: Readable<Component>;
        searchTerms?: SalvageSearchTerms;
    }) {
        this._availableComponents = availableComponents;
        this._selectedComponent = selectedComponent;
        this._searchTerms = writable(searchTerms);
        this._searchResults = derived(
            [this._availableComponents, this._selectedComponent, this._searchTerms],
            ([$availableComponents, $selectedComponent, $searchTerms], set) => {
                set(this.searchComponents($availableComponents,$selectedComponent, $searchTerms));
            }
        );
        this.clearOnSystemSelection(this._availableComponents);
        this.clearOnComponentSelection(this._selectedComponent);
    }

    private clearOnSystemSelection(availableComponents: Readable<Component[]>) {
        availableComponents.subscribe(() => this.clear());
    }

    private clearOnComponentSelection(selectedComponent: Readable<Component>) {
        selectedComponent.subscribe(() => this.clear());
    }

    private searchComponents(craftingComponents: Component[], selectedComponent: Component, searchTerms: SalvageSearchTerms) {
        return craftingComponents
            .filter(component => component !== selectedComponent)
            .filter((component) => {
            if (!searchTerms.name) {
                return true;
            }
            return component.name.search(new RegExp(searchTerms.name, "i")) >= 0;
        });
    }

    public subscribe(subscriber: Subscriber<Component[]>) {
        return this._searchResults.subscribe(subscriber);
    }

    public get searchTerms(): Readable<SalvageSearchTerms> {
        return this._searchTerms;
    }

    clear() {
        this._searchTerms.set({
            name: ""
        })
    }
}

export { SalvageSearchStore, SalvageSearchTerms }