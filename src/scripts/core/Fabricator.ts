import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {CraftingElement} from "./CraftingElement";
import {Action} from "./Action";
import {RecipeComponent} from "./RecipeComponent";

interface Fabricator {
    preparedRecipe?: Recipe;
    preparedCraftingElements?: CraftingElement[];

    prepare(recipe: Recipe, craftingElements?: CraftingElement[]): void;

    add(craftingElements: CraftingElement): void;

    clear(): boolean;

    /**
     *
    * */
    fabricate(): CraftingResult[];

    ready(): boolean;
}

class DefaultFabricator implements Fabricator {
    private _preparedCraftingElements: CraftingElement[] = [];
    private _preparedRecipe!: Recipe;
    private _remainingComponents!: Map<string, number>;

    fabricate(): CraftingResult[] {
        if (!this._preparedRecipe) {
            throw new Error(`The Default Fabricator requires a recipe and one was not prepared. `);
        }
        if (!this.ready()) {
            throw new Error(`Unable to craft ${this._preparedRecipe.name}`);
        }
        let input: CraftingResult[] = this._preparedRecipe.components.map((component) => {
            return CraftingResult.builder()
                .withItem(component.ingredient)
                .withQuantity(component.quantity)
                .withAction(component.isConsumed ? Action.REMOVE : Action.ADD)
                .build();
        });
        let output: CraftingResult[] = this._preparedRecipe.results.map((result) => {
            return CraftingResult.builder()
                .withItem(result.item)
                .withAction(Action.ADD)
                .withQuantity(result.quantity)
                .build();
        });
        return input.concat(output);
    }

    prepare(recipe: Recipe, craftingElements?: CraftingElement[]) {
        this._preparedRecipe = recipe;
        if (craftingElements && craftingElements.length > 0) {
            this._preparedCraftingElements.concat(craftingElements);
        }
        this._remainingComponents = new Map(this.preparedRecipe.components.map((component: RecipeComponent) => [component.ingredient.compendiumEntry.itemId, component.quantity]));
        this._preparedCraftingElements.forEach((craftingElement: CraftingElement) => this.accountFor(craftingElement));
    }

    private accountFor(craftingElement: CraftingElement) {
        let remaining: number = this._remainingComponents.get(craftingElement.compendiumEntry.itemId);
        if (remaining > 0) {
            this._remainingComponents.set(craftingElement.compendiumEntry.itemId, --remaining);
        }
    }

    add(craftingElement: CraftingElement) {
        this._preparedCraftingElements.push(craftingElement);
        this.accountFor(craftingElement);
    }

    get preparedCraftingElements(): CraftingElement[] {
        return this._preparedCraftingElements;
    }

    get preparedRecipe(): Recipe {
        return this._preparedRecipe;
    }

    clear() {
        let elementsRemoved: boolean = this._preparedRecipe != null || this._preparedCraftingElements.length > 0;
        this._preparedRecipe = null;
        this._preparedCraftingElements = [];
        return elementsRemoved;
    }

    ready() {
        let ready: boolean = true;
        this._remainingComponents.forEach((value) => {
            if (value > 0) {
                ready = false;
            }
        });
        return ready;
    }
}

export {Fabricator, DefaultFabricator};