import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {CraftingComponent} from "./CraftingComponent";
import {Action} from "./Action";
import {RecipeComponent} from "./RecipeComponent";

interface Fabricator {
    preparedRecipe?: Recipe;
    preparedCraftingElements?: CraftingComponent[];

    prepare(recipe: Recipe, craftingElements?: CraftingComponent[]): void;

    add(craftingElements: CraftingComponent): void;

    clear(): boolean;

    /**
     *
    * */
    fabricate(): CraftingResult[];

    ready(): boolean;
}

class DefaultFabricator implements Fabricator {
    private _preparedCraftingElements: CraftingComponent[] = [];
    private _preparedRecipe!: Recipe;
    private _remainingComponents: Map<string, number> = new Map();

    fabricate(): CraftingResult[] {
        if (!this._preparedRecipe) {
            throw new Error(`The Default Fabricator requires a recipe and one was not prepared. `);
        }
        if (!this.ready()) {
            throw new Error(`Unable to craft ${this._preparedRecipe.name}. `);
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

    prepare(recipe: Recipe, craftingElements?: CraftingComponent[]) {
        this._preparedRecipe = recipe;
        if (craftingElements && craftingElements.length > 0) {
            this._preparedCraftingElements.push(...craftingElements);
        }
        this._remainingComponents = new Map(this.preparedRecipe.components.map((component: RecipeComponent) => [component.ingredient.compendiumEntry.itemId, component.quantity]));
        this._preparedCraftingElements.forEach((craftingElement: CraftingComponent) => this.accountFor(craftingElement));
    }

    private accountFor(craftingElement: CraftingComponent) {
        let remaining: number = this._remainingComponents.get(craftingElement.compendiumEntry.itemId);
        if (remaining > 0) {
            this._remainingComponents.set(craftingElement.compendiumEntry.itemId, --remaining);
        }
    }

    add(craftingElement: CraftingComponent) {
        this._preparedCraftingElements.push(craftingElement);
        this.accountFor(craftingElement);
    }

    get preparedCraftingElements(): CraftingComponent[] {
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
        if (!this._preparedRecipe) {
            return false;
        }
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