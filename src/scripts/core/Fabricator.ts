import {Recipe} from "./Recipe";
import {FabricationAction} from "./FabricationAction";
import {ActionType} from "./ActionType";
import {CraftingComponent} from "./CraftingComponent";
import {FabricationHelper} from "./FabricationHelper";
import {AlchemicalResult, EssenceCombiner} from "./EssenceCombiner";
import {FabricationOutcome, OutcomeType} from "./FabricationOutcome";
import {Inventory} from "../game/Inventory";
import FabricateApplication from "../application/FabricateApplication";

interface Fabricator {

    fabricateFromRecipe(actor: Actor, recipe: Recipe): Promise<FabricationOutcome>;
    fabricateFromComponents(actor: Actor, components: CraftingComponent[]): Promise<FabricationOutcome>;

}

class DefaultFabricator implements Fabricator {

    public async fabricateFromRecipe(actor: Actor, recipe: Recipe): Promise<FabricationOutcome> {

        let input: FabricationAction[] = recipe.ingredients.map((component) => {
            return FabricationAction.builder()
                .withComponent(component.component)
                .withQuantity(component.quantity)
                .withAction(component.consumed ? ActionType.REMOVE : ActionType.ADD)
                .build();
        });

        let output: FabricationAction[] = recipe.results.map((result) => {
            return FabricationAction.builder()
                .withComponent(result.component)
                .withAction(ActionType.ADD)
                .withQuantity(result.quantity)
                .build();
        });

        const fabricationActions: FabricationAction[] = input.concat(output);
        const inventory: Inventory = FabricateApplication.inventories.getFor(actor.id);
        return FabricationHelper.takeActionsForOutcome(inventory, fabricationActions, OutcomeType.SUCCESS);
    }

    public fabricateFromComponents(): Promise<FabricationOutcome> {
        throw new Error(`The Default Fabricator requires a Recipe and one was not provided. `);
    }

}

class EssenceCombiningFabricator<T> implements Fabricator {
    private readonly _essenceCombiner: EssenceCombiner<T>;

    constructor(essenceCombiner?: EssenceCombiner<T>) {
        this._essenceCombiner = essenceCombiner;
    }

    public async fabricateFromComponents(actor: Actor, components: CraftingComponent[]): Promise<FabricationOutcome> {
        if (!this._essenceCombiner) {
            throw new Error(`No Essence Combiner has been provided for this system. You may only craft from Recipes. `);
        }
        const alchemicalResult:AlchemicalResult<T> = this._essenceCombiner.combine(components);
        const resultantItem: CraftingComponent = this._essenceCombiner.resultantItem;
        const addedComponent: FabricationAction = FabricationAction.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withCustomData(alchemicalResult.asItemData())
            .withComponent(resultantItem)
            .build();
        const fabricationActions: FabricationAction[] = FabricationHelper.asCraftingResults(components, ActionType.REMOVE);
        fabricationActions.push(addedComponent);
        const inventory: Inventory = FabricateApplication.inventories.getFor(actor.id);
        return FabricationHelper.takeActionsForOutcome(inventory, fabricationActions, OutcomeType.SUCCESS);
    }

    public fabricateFromRecipe(actor: Actor, recipe: Recipe): Promise<FabricationOutcome> {
        const inventory: Inventory = FabricateApplication.inventories.getFor(actor.id);
        const craftingComponents = inventory.denormalizedContainedComponents().filter((component: CraftingComponent) => component.systemId === recipe.systemId);
        if (!craftingComponents || craftingComponents.length === 0) {
            throw new Error(`Essence Combining Fabricators require components to Fabricate Recipes. `);
        }
        const craftingComponentCombinations = this.analyzeCombinationsForRecipe(craftingComponents, recipe);
        const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(recipe, craftingComponentCombinations);
        if (!selectedCombination ||selectedCombination.length === 0) {
            throw new Error(`There are insufficient components available to craft Recipe ${recipe.partId}. `)
        }
        const fabricationActions = FabricationHelper.asCraftingResults(selectedCombination, ActionType.REMOVE).concat(recipe.results);
        return FabricationHelper.takeActionsForOutcome(inventory, fabricationActions, OutcomeType.SUCCESS);
    }

    private analyzeCombinationsForRecipe(components:  CraftingComponent[], recipe: Recipe): CraftingComponentCombination[] {
        const essenceIdentities: Map<string, number> = FabricationHelper.assignEssenceIdentities(recipe.essences);
        const usableComponents: CraftingComponent[] = components.filter((component: CraftingComponent) => component.essences.filter((essence: string) => recipe.essences.includes(essence)).length > 0);
        const recipeIdentity = FabricationHelper.essenceCombinationIdentity(recipe.essences, essenceIdentities);
        const componentEssenceIdentity: Map<string, number> = new Map();
        usableComponents.forEach((component: CraftingComponent) => {
            if (!componentEssenceIdentity.has(component.partId)) {
                componentEssenceIdentity.set(component.partId, FabricationHelper.essenceCombinationIdentity(component.essences, essenceIdentities));
            }
        });
        return FabricationHelper.combinationHistogram(usableComponents).map((combination: CraftingComponent[]) => {
            const essenceCombinationIdentity = combination.map((component: CraftingComponent) => componentEssenceIdentity.get(component.partId))
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
            if (combination.essenceIdentityMatches.find((match: Recipe) => match.partId === recipe.partId)) {
                exactMatches.push(combination);
            }
            if (combination.craftableRecipes.find((craftable: Recipe) => craftable.partId === recipe.partId)) {
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