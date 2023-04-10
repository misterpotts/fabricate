import {writable, Writable, Readable, derived, Subscriber} from "svelte/store";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";

interface RecipeSearchTerms {
    name?: string;
    requiresEssences?: boolean;
    requiresNamedIngredients? : boolean;
}

class RecipeSearchStore {

    private readonly _availableRecipes: Readable<Recipe[]>;
    private readonly _searchResults: Readable<Recipe[]>;
    private readonly _searchTerms: Writable<RecipeSearchTerms>;

    constructor({
        availableRecipes,
        searchTerms = {}
    }: {
        availableRecipes: Readable<Recipe[]>;
        searchTerms?: RecipeSearchTerms;
    }) {
        this._availableRecipes = availableRecipes;
        this._searchTerms = writable(searchTerms);
        this._searchResults = derived(
            [this._availableRecipes, this._searchTerms],
            ([$availableRecipes, $searchTerms], set) => {
                set(this.searchRecipes($availableRecipes, $searchTerms));
            }
        );
        this.clearOnSystemSelection(this._availableRecipes);
    }

    private clearOnSystemSelection(availableComponents: Readable<Recipe[]>) {
        availableComponents.subscribe(() => this.clear());
    }

    private searchRecipes(recipes: Recipe[], searchTerms: RecipeSearchTerms) {
        return recipes.filter((recipe) => {
            if (searchTerms.requiresEssences && !recipe.requiresEssences) {
                return false;
            }
            if (searchTerms.requiresNamedIngredients && !recipe.hasRequirements) {
                return false;
            }
            if (!searchTerms.name) {
                return true;
            }
            return recipe.name.search(new RegExp(searchTerms.name, "i")) >= 0;
        });
    }

    public subscribe(subscriber: Subscriber<RecipeSearchTerms[]>) {
        return this._searchResults.subscribe(subscriber);
    }

    public get searchTerms(): Readable<RecipeSearchTerms> {
        return this._searchTerms;
    }

    clear() {
        this._searchTerms.set({
            name: "",
            requiresNamedIngredients: false,
            requiresEssences: false
        })
    }
}

export { RecipeSearchStore, RecipeSearchTerms }