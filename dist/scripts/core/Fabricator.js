import { CraftingResult } from "./CraftingResult";
import { Action } from "./Action";
class DefaultFabricator {
    constructor() {
        this._preparedCraftingElements = [];
    }
    fabricate() {
        if (!this._preparedRecipe) {
            throw new Error(`The Default Fabricator requires a recipe and one was not prepared. `);
        }
        let input = this._preparedRecipe.components.map((component) => {
            return CraftingResult.builder()
                .withItem(component.ingredient)
                .withQuantity(component.quantity)
                .withAction(component.isConsumed ? Action.REMOVE : Action.ADD)
                .build();
        });
        let output = this._preparedRecipe.results.map((result) => {
            return CraftingResult.builder()
                .withItem(result.item)
                .withAction(Action.ADD)
                .withQuantity(result.quantity)
                .build();
        });
        return input.concat(output);
    }
    prepare(recipe, craftingElements) {
        this._preparedRecipe = recipe;
        if (craftingElements && craftingElements.length > 0) {
            this._preparedCraftingElements.concat(craftingElements);
        }
    }
    add(craftingElement) {
        this._preparedCraftingElements.push(craftingElement);
    }
    get preparedCraftingElements() {
        return this._preparedCraftingElements;
    }
    get preparedRecipe() {
        return this._preparedRecipe;
    }
    clear() {
        let elementsRemoved = this._preparedRecipe != null || this._preparedCraftingElements.length > 0;
        this._preparedRecipe = null;
        this._preparedCraftingElements = [];
        return elementsRemoved;
    }
}
export { DefaultFabricator };
