import {writable, Writable, Readable, derived, Subscriber} from "svelte/store";
import {CraftingAssessment} from "./CraftingAssessment";

interface RecipeSummarySearchTerms {

    name?: string;
    craftableOnly?: boolean;

}

class RecipeSummarySearchStore {

    private readonly _availableRecipes: Writable<CraftingAssessment[]>;
    private readonly _searchResults: Readable<CraftingAssessment[]>;
    private readonly _searchTerms: Writable<RecipeSummarySearchTerms>;

    constructor({
        availableRecipes = writable([]),
        searchTerms = {}
    }: {
        availableRecipes?: Writable<CraftingAssessment[]>;
        searchTerms?: RecipeSummarySearchTerms;
    } = {}) {
        this._availableRecipes = availableRecipes;
        this._searchTerms = writable(searchTerms);
        this._searchResults = derived(
            [this._availableRecipes, this._searchTerms],
            ([$availableRecipes, $searchTerms], set) => {
                set(this.searchRecipes($availableRecipes, $searchTerms));
            }
        );
    }

    set availableRecipes(value: CraftingAssessment[]) {
        this._availableRecipes.set(value);
    }

    private searchRecipes(recipes: CraftingAssessment[], searchTerms: RecipeSummarySearchTerms) {
        return recipes.filter((recipe) => {
            if (searchTerms.craftableOnly && !recipe.isCraftable) {
                return false;
            }
            if (!searchTerms.name) {
                return true;
            }
            return recipe.recipeName.search(new RegExp(searchTerms.name, "i")) >= 0;
        });
    }

    public subscribe(subscriber: Subscriber<RecipeSummarySearchTerms[]>) {
        return this._searchResults.subscribe(subscriber);
    }

    get searchTerms(): Readable<RecipeSummarySearchTerms> {
        return this._searchTerms;
    }

    set searchTerms(value: RecipeSummarySearchTerms) {
        this._searchTerms.set(value);
    }

    clear() {
        this._searchTerms.set({
            name: "",
            craftableOnly: false
        });
    }

}

export { RecipeSummarySearchStore, RecipeSummarySearchTerms }