import {Recipe} from "./Recipe";
import {FabricationAction, FabricationActionType} from "./FabricationAction";
import {CraftingComponent} from "./CraftingComponent";
import {FabricationHelper} from "./FabricationHelper";
import {EssenceCombiner} from "./EssenceCombiner";
import {FabricationOutcome, OutcomeType} from "./FabricationOutcome";
import {Inventory} from "../game/Inventory";
import {InventoryRecord} from "../game/InventoryRecord";
import {Ingredient} from "./Ingredient";

class AlchemySpecification<T> {
    private readonly _essenceCombiner: EssenceCombiner<T>;
    private _baseItemData: T;
    private readonly _baseComponent: CraftingComponent;

    constructor(essenceCombiner: EssenceCombiner<T>, baseComponent: CraftingComponent) {
        if (!essenceCombiner || !baseComponent) {
            throw new Error('Alchemy Specifications require an Essence Combiner and a Base Crafting Component. ');
        }
        this._essenceCombiner = essenceCombiner;
        this._baseComponent = baseComponent;
    }

    get essenceCombiner(): EssenceCombiner<T> {
        return this._essenceCombiner;
    }

    get baseComponent(): CraftingComponent {
        return this._baseComponent;
    }

    async getBaseItemData(): Promise<T> {
        if (this._baseItemData) {
            return this._baseItemData;
        }
        const compendium: Compendium = game.packs.get(this.baseComponent.systemId);
        // @ts-ignore
        const entity: Entity<T> = await compendium.getEntity(this.baseComponent.partId);
        this._baseItemData = entity.data.data;
        return this._baseItemData;
    }
}

class Fabricator<T> {
    private readonly _alchemySpecification: AlchemySpecification<T>;

    constructor(alchemySpecification?: AlchemySpecification<T>) {
        this._alchemySpecification = alchemySpecification;
    }

    public async fabricateFromComponents(inventory: Inventory, components: CraftingComponent[]): Promise<FabricationOutcome> {
        if (!this._alchemySpecification) {
            throw new Error(`No Alchemy Specification has been provided for this system. You may only craft from Recipes. `);
        }
        const baseItemData: T = await this._alchemySpecification.getBaseItemData();
        const alchemicallyModifiedItemData: T = this._alchemySpecification.essenceCombiner.combine(components, duplicate(baseItemData));
        const resultantComponentType: CraftingComponent = this._alchemySpecification.baseComponent;
        const addComponentAction: FabricationAction = FabricationAction.builder()
            .withAction(FabricationActionType.ADD)
            .withQuantity(1)
            .withCustomData(alchemicallyModifiedItemData)
            .withComponent(resultantComponentType)
            .build();
        const fabricationActions: FabricationAction[] = FabricationHelper.asCraftingResults(components, FabricationActionType.REMOVE);
        fabricationActions.push(addComponentAction);
        return FabricationHelper.takeActionsForOutcome(inventory, fabricationActions, OutcomeType.SUCCESS);
    }

    public fabricateFromRecipe(inventory: Inventory, recipe: Recipe): Promise<FabricationOutcome> {
        const ownedComponents: InventoryRecord<CraftingComponent>[] = inventory.components.filter((record: InventoryRecord<CraftingComponent>) => record.fabricateItem.systemId === recipe.systemId);

        const catalysts: CraftingComponent[] = [];
        const consumedIngredients: CraftingComponent[] = [];
        if (recipe.ingredients && recipe.ingredients.length > 0) {
           recipe.ingredients.forEach((ingredient: Ingredient) => {
               const component: CraftingComponent = CraftingComponent.builder()
                   .withName(ingredient.name)
                   .withPartId(ingredient.partId)
                   .withSystemId(ingredient.systemId)
                   .withImageUrl(ingredient.imageUrl)
                   .build();
               if (!ingredient.consumed) {
                   catalysts.push(component);
               } else {
                   consumedIngredients.push(component);
               }
           });
        }

        ownedComponents.map((componentRecord: InventoryRecord<CraftingComponent>));

        if (recipe.essences && recipe.essences.length > 0) {

        }

        const input: FabricationAction[] = [];
        const output: FabricationAction[] = [];

        const craftingComponentCombinations = this.analyzeCombinationsForRecipe(ownedComponents, recipe);
        const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(recipe, craftingComponentCombinations);
        if (!selectedCombination || selectedCombination.length === 0) {
            throw new Error(`There are insufficient components available to craft the Recipe "${recipe.name}". `)
        }
        const fabricationActions = FabricationHelper.asCraftingResults(selectedCombination, FabricationActionType.REMOVE).concat(recipe.results);
        return FabricationHelper.takeActionsForOutcome(inventory, fabricationActions, OutcomeType.SUCCESS, recipe);
    }

    private analyzeCombinationsForRecipe(records: InventoryRecord<CraftingComponent>[], recipe: Recipe): CraftingComponentCombination[] {
        const essenceIdentities: Map<string, number> = FabricationHelper.assignEssenceIdentities(recipe.essences);
        const usableComponentRecords: InventoryRecord<CraftingComponent>[] = records.filter((record: InventoryRecord<CraftingComponent>) => record.fabricateItem.essences.filter((essence: string) => recipe.essences.includes(essence)).length > 0);
        const recipeIdentity = FabricationHelper.essenceCombinationIdentity(recipe.essences, essenceIdentities);
        const componentEssenceIdentity: Map<string, number> = new Map();
        usableComponentRecords.forEach((record: InventoryRecord<CraftingComponent>) => {
            if (!componentEssenceIdentity.has(record.fabricateItem.partId)) {
                componentEssenceIdentity.set(record.fabricateItem.partId, FabricationHelper.essenceCombinationIdentity(record.fabricateItem.essences, essenceIdentities));
            }
        });
        return FabricationHelper.asComponentCombinations(usableComponentRecords, recipe)
            .map((combination: CraftingComponent[]) => {
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

export {Fabricator};