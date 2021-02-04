import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";
import {CraftingComponent} from "./CraftingComponent";

interface Fabricator {
    fabricateFromRecipe(recipe: Recipe): CraftingResult[];

    fabricateFromComponents(): CraftingResult[];
}

class DefaultFabricator implements Fabricator {

    public fabricateFromRecipe(recipe: Recipe): CraftingResult[] {

        let input: CraftingResult[] = recipe.ingredients.map((component) => {
            return CraftingResult.builder()
                .withItem(component.componentType)
                .withQuantity(component.quantity)
                .withAction(component.consumed ? ActionType.REMOVE : ActionType.ADD)
                .build();
        });

        let output: CraftingResult[] = recipe.results.map((result) => {
            return CraftingResult.builder()
                .withItem(result.item)
                .withAction(ActionType.ADD)
                .withQuantity(result.quantity)
                .build();
        });

        return input.concat(output);

    }

    public fabricateFromComponents(): CraftingResult[] {
        throw new Error(`The Default Fabricator requires a Recipe and one was not provided. `);
    }

}

class EssenceCombiningFabricator extends DefaultFabricator {
    private readonly _knownRecipesById: Map<string, Recipe>;

    constructor(knownRecipes: Recipe[]) {
        super();
        this._knownRecipesById = new Map();
        knownRecipes.forEach((recipe: Recipe) => {
            if (this._knownRecipesById.has(recipe.entryId)) {
                throw new Error(`Recipe ${recipe.entryId} is not unique! `);
            }
            this._knownRecipesById.set(recipe.entryId, recipe);
        });
    }

    public fabricateFromComponents(): CraftingResult[] {
        return [];
    }

    public fabricateFromRecipe(recipe: Recipe): CraftingResult[] {
        if (!this._knownRecipesById.has(recipe.entryId)) {
            throw new Error(`Recipe ${recipe.entryId} is not known and cannot be crafted `);
        }

        return [];
    }

    public listCraftableRecipesForComponents(craftingComponents: CraftingComponent[]): Recipe[] {
        const essenceCount: Map<string, number> = new Map();
        craftingComponents.forEach((component: CraftingComponent) => {
            component.essences.forEach((essence:string) => {
                const count: number = essenceCount.has(essence) ? essenceCount.get(essence) + 1 : 1;
                essenceCount.set(essence, count);
            });
        });
        return Array.from(this._knownRecipesById.values()).filter((recipe: Recipe) => {
            let craftable = true;
            recipe.essences.forEach((required: number, name: string) => {
                if (essenceCount.get(name) < required) {
                    craftable = false;
                }
            });
            return craftable;
        });
    }

}

export {Fabricator, DefaultFabricator, EssenceCombiningFabricator};