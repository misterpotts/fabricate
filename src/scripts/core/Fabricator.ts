import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";
import {CraftingComponent} from "./CraftingComponent";
import {FabricationHelper} from "./FabricationHelper";
import {EssenceCombiner} from "./EssenceCombiner";

interface Fabricator {
    fabricateFromRecipe(recipe: Recipe, components?: CraftingComponent[]): CraftingResult[];

    fabricateFromComponents(components: CraftingComponent[]): CraftingResult;
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

    public fabricateFromComponents(): CraftingResult {
        throw new Error(`The Default Fabricator requires a Recipe and one was not provided. `);
    }

}

class EssenceCombiningFabricator<T> implements Fabricator {
    private readonly _essenceCombiner: EssenceCombiner<T>;

    constructor(essenceCombiner?: EssenceCombiner<T>) {
        this._essenceCombiner = essenceCombiner;
    }

    public fabricateFromComponents(components: CraftingComponent[]): CraftingResult {
        if (!this._essenceCombiner) {
            throw new Error(`No Essence Combiner has been provided for this system. You may only craft from Recipes. `);
        }
        const alchemicalResult = this._essenceCombiner.combine(components);
        const resultantItem = this._essenceCombiner.resultantItem;
        return CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withCustomData(alchemicalResult.asItemData())
            .withItem(CraftingComponent.builder()
                .withCompendiumEntry(resultantItem.compendiumKey, resultantItem.entryId)
                .build())
            .build();
    }

    public fabricateFromRecipe(recipe: Recipe, craftingComponents: CraftingComponent[]): CraftingResult[] {
        if (!craftingComponents || craftingComponents.length === 0) {
            throw new Error(`Essence Combining Fabricators require components to Fabricate Recipes. `);
        }
        const craftingComponentCombinations = this.analyzeCombinationsForRecipe(craftingComponents, recipe);
        const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(recipe, craftingComponentCombinations);
        if (!selectedCombination ||selectedCombination.length === 0) {
            throw new Error(`There are insufficient components available to craft Recipe ${recipe.entryId}. `)
        }
        return FabricationHelper.asCraftingResults(selectedCombination, ActionType.REMOVE).concat(recipe.results);
    }

    private analyzeCombinationsForRecipe(components:  CraftingComponent[], recipe: Recipe): CraftingComponentCombination[] {
        const essenceIdentities: Map<string, number> = FabricationHelper.assignEssenceIdentities(recipe.essences);
        const usableComponents: CraftingComponent[] = components.filter((component: CraftingComponent) => component.essences.filter((essence: string) => recipe.essences.includes(essence)).length > 0);
        const recipeIdentity = FabricationHelper.essenceCombinationIdentity(recipe.essences, essenceIdentities);
        const componentEssenceIdentity: Map<string, number> = new Map();
        usableComponents.forEach((component: CraftingComponent) => {
            if (!componentEssenceIdentity.has(component.compendiumEntry.entryId)) {
                componentEssenceIdentity.set(component.compendiumEntry.entryId, FabricationHelper.essenceCombinationIdentity(component.essences, essenceIdentities));
            }
        });
        return FabricationHelper.combinationHistogram(usableComponents).map((combination: CraftingComponent[]) => {
            const essenceCombinationIdentity = combination.map((component: CraftingComponent) => componentEssenceIdentity.get(component.compendiumEntry.entryId))
                .reduce((left: number, right: number) => left * right, 1);
            const craftableRecipes: Recipe[] = [];
            if (this.isCraftableFromEssencesIn(recipe, combination)) {
                craftableRecipes.push(recipe);
            }
            const essenceIdentityMatchForRecipes: Recipe[] = [];
            if (essenceCombinationIdentity === recipeIdentity) {
                essenceIdentityMatchForRecipes.push(recipe);
            }
            return new CraftingComponentCombination(combination, craftableRecipes, essenceCombinationIdentity, essenceIdentityMatchForRecipes);
        });
    }

    private isCraftableFromEssencesIn(recipe: Recipe, components: CraftingComponent[]): boolean {
        const essences = components.map((component: CraftingComponent) => component.essences)
            .reduce((left: string[], right: string[]) => left.concat(right), []);
        return essences.every((essence: string) => recipe.essences.includes(essence)
            &&  (essences.filter((essence:string) => essence === essence).length >= recipe.essences.filter((essence:string) => essence === essence).length));
    }

    public filterCraftableRecipesFor(craftingComponents: CraftingComponent[], recipes: Recipe[]) {
        return recipes.filter((recipe: Recipe) => this.isCraftableFromEssencesIn(recipe, craftingComponents));
    }

    private selectBestCombinationFrom(recipe: Recipe, combinations: CraftingComponentCombination[]): CraftingComponent[] {
        const exactMatches: CraftingComponentCombination[] = [];
        const supersets: CraftingComponentCombination[] = [];
        combinations.forEach((combination: CraftingComponentCombination) => {
            if (combination.essenceIdentityMatches.find((match: Recipe) => match.entryId === recipe.entryId)) {
                exactMatches.push(combination);
            }
            if (combination.craftableRecipes.find((craftable: Recipe) => craftable.entryId === recipe.entryId)) {
                supersets.push(combination);
            }
        });
        const selectFewestComponents = (combinations: CraftingComponentCombination[]) => {
            return combinations.sort((left, right) => left.components.length - right.components.length)
                .find(() => true)
                .components;
        };
        if ( exactMatches.length === 1) {
            return exactMatches[0].components;
        } else if ( exactMatches.length > 1) {
            return selectFewestComponents(exactMatches);
        } else if (supersets.length === 1) {
            return supersets[0].components;
        } else if (supersets.length > 1) {
            return selectFewestComponents(supersets);
        } else {
            return [];
        }
    }
}

class CraftingComponentCombination {

    private readonly _components: CraftingComponent[];
    private readonly _craftableRecipes: Recipe[];
    private readonly _essenceIdentityMatches: Recipe[];
    private readonly _essenceIdentity: number;

    constructor(components: CraftingComponent[], craftableRecipes: Recipe[], essenceIdentity: number, essencceIdentityMatches: Recipe[]) {
        this._components = components;
        this._craftableRecipes = craftableRecipes;
        this._essenceIdentity = essenceIdentity;
        this._essenceIdentityMatches = essencceIdentityMatches;
    }

    get components(): CraftingComponent[] {
        return this._components;
    }

    get craftableRecipes(): Recipe[] {
        return this._craftableRecipes;
    }

    get essenceIdentity(): number {
        return this._essenceIdentity;
    }

    get essenceIdentityMatches(): Recipe[] {
        return this._essenceIdentityMatches;
    }
}

export {Fabricator, DefaultFabricator, EssenceCombiningFabricator};