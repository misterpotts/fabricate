import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";

interface Fabricator {
    fabricateFromRecipe(recipe: Recipe): CraftingResult[];

    fabricateFromComponents(): CraftingResult[];
}

class DefaultFabricator implements Fabricator {

    public fabricateFromRecipe(recipe: Recipe): CraftingResult[] {

        let input: CraftingResult[] = recipe.components.map((component) => {
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

export {Fabricator, DefaultFabricator};