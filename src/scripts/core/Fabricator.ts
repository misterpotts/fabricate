import {Recipe} from "./Recipe";
import {FabricationAction, FabricationActionType} from "./FabricationAction";
import {CraftingComponent} from "./CraftingComponent";
import {FabricationHelper} from "./FabricationHelper";
import {EssenceCombiner} from "./EssenceCombiner";
import {FabricationOutcome, OutcomeType} from "./FabricationOutcome";
import {Inventory} from "../game/Inventory";
import {InventoryRecord} from "../game/InventoryRecord";
import {Ingredient} from "./Ingredient";
import {AlchemyError} from "../error/AlchemyError";

enum EssenceMatchType {
    EXACT = 'EXACT',
    SUPERSET = 'SUPERSET',
    NONE = 'NONE'
}

class CraftingComponentCombination {

    private readonly _essenceIdentities: Map<string, number> = new Map();
    private readonly _components: CraftingComponent[] = [];
    private readonly _combinationIdentity: number;

    constructor(components: CraftingComponent[], essenceIdentities: Map<string, number>) {
        this._components = components;
        this._essenceIdentities = essenceIdentities;
        this._combinationIdentity = components.map((component: CraftingComponent) => FabricationHelper.essenceCombinationIdentity(component.essences, essenceIdentities))
            .reduce((left: number, right: number) => left * right, 1);
    }

    get components(): CraftingComponent[] {
        return this._components;
    }

    get combinationIdentity(): number {
        return this._combinationIdentity;
    }

    public essenceMatchType(requiredEssences: string[]): EssenceMatchType {
        const requiredEssenceCombinationIdentity = FabricationHelper.essenceCombinationIdentity(requiredEssences, this._essenceIdentities);
        if (requiredEssenceCombinationIdentity === this._combinationIdentity) {
            return EssenceMatchType.EXACT;
        }
        if (requiredEssenceCombinationIdentity > this._combinationIdentity) {
            return EssenceMatchType.NONE;
        }
        const testResult = this._combinationIdentity % requiredEssenceCombinationIdentity;
        if (testResult === 0) {
            return EssenceMatchType.SUPERSET;
        }
        return EssenceMatchType.NONE;
    }

}

class AlchemySpecification<T extends Item.Data> {
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

class Fabricator<T extends Item.Data> {
    private readonly _alchemySpecification: AlchemySpecification<T>;

    constructor(alchemySpecification?: AlchemySpecification<T>) {
        this._alchemySpecification = alchemySpecification;
    }

    public async fabricateFromComponents(inventory: Inventory<T>, components: CraftingComponent[]): Promise<FabricationOutcome> {
        if (!this._alchemySpecification) {
            throw new Error(`No Alchemy Specification has been provided for this system. You may only craft from Recipes. `);
        }

        const removeSuppliedComponents: FabricationAction<T>[] = FabricationHelper.asCraftingResults(components, FabricationActionType.REMOVE);

        try {
            const baseItemData: T = await this._alchemySpecification.getBaseItemData();
            const alchemicallyModifiedItemData: T = this._alchemySpecification.essenceCombiner.combine(components, duplicate(baseItemData));
            const resultantComponentType: CraftingComponent = this._alchemySpecification.baseComponent;
            const addComponent: FabricationAction<T> = FabricationAction.builder<T>()
                .withActionType(FabricationActionType.ADD)
                .withQuantity(1)
                .withCustomItemData(alchemicallyModifiedItemData)
                .withItemType(resultantComponentType)
                .build();
            const actions: FabricationAction<T>[] = removeSuppliedComponents.concat(addComponent);
            await FabricationHelper.applyResults(actions, inventory);
            return FabricationOutcome.builder()
                .withActions(actions)
                .withOutcomeType(OutcomeType.SUCCESS)
                .build();
        } catch (error: any) {
            if (error instanceof AlchemyError) {
                const alchemyError: AlchemyError = <AlchemyError>error;
                const actions: FabricationAction<T>[] = [];
                if (alchemyError.componentsConsumed) {
                    actions.concat(removeSuppliedComponents);
                    await FabricationHelper.applyResults(removeSuppliedComponents, inventory);
                }
                return FabricationOutcome.builder()
                    .withOutcomeType(OutcomeType.FAILURE)
                    .withFailureDetails(alchemyError.message)
                    .withActions(actions)
                    .build();
            }
            throw error;
        }
    }

    public async fabricateFromRecipe(inventory: Inventory<T>, recipe: Recipe): Promise<FabricationOutcome> {
        const ownedComponents: InventoryRecord<CraftingComponent>[] = inventory.components.filter((record: InventoryRecord<CraftingComponent>) => record.fabricateItem.systemId === recipe.systemId);

        const input: FabricationAction<T>[] = [];
        const namedIngredientsByPartId: Map<string, Ingredient> = new Map();
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach((ingredient: Ingredient) => {
                namedIngredientsByPartId.set(ingredient.partId, ingredient);
                if (ingredient.consumed) {
                    input.push(FabricationAction.builder<T>()
                        .withQuantity(ingredient.quantity)
                        .withItemType(ingredient.component)
                        .withActionType(FabricationActionType.REMOVE)
                        .build());
                }
            });
        }

        if (recipe.essences && recipe.essences.length > 0) {
            const availableIngredients: Ingredient[] = ownedComponents.map((componentRecord: InventoryRecord<CraftingComponent>) => {
                if (namedIngredientsByPartId.has(componentRecord.fabricateItem.partId)) {
                    const namedIngredient: Ingredient = namedIngredientsByPartId.get(componentRecord.fabricateItem.partId);
                    const availableQuantityForEssenceExtraction: number = componentRecord.totalQuantity > namedIngredient.quantity ? componentRecord.totalQuantity - namedIngredient.quantity : 0;
                    return Ingredient.builder()
                        .isConsumed(namedIngredient.consumed)
                        .withComponent(componentRecord.fabricateItem)
                        .withQuantity(availableQuantityForEssenceExtraction)
                        .build();
                }
                return Ingredient.builder()
                    .isConsumed(true)
                    .withComponent(componentRecord.fabricateItem)
                    .withQuantity(componentRecord.totalQuantity)
                    .build();
            });
            const craftingComponentCombinations = this.analyzeCombinationsForEssences(availableIngredients, recipe.essences);
            const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(recipe, craftingComponentCombinations);
            if (!selectedCombination || selectedCombination.length === 0) {
                throw new Error(`There are insufficient components available to craft the Recipe "${recipe.name}". `)
            }
            const consumedComponents = FabricationHelper.asCraftingResults(selectedCombination, FabricationActionType.REMOVE);
            input.concat(consumedComponents);
        }

        const output: FabricationAction<T>[] = recipe.results;
        const actions: FabricationAction<T>[] = output.concat(input);

        await FabricationHelper.applyResults(actions, inventory);
        return FabricationOutcome.builder()
            .withActions(actions)
            .withOutcomeType(OutcomeType.SUCCESS)
            .build();
    }

    private analyzeCombinationsForEssences(availableIngredients: Ingredient[], requiredEssences: string[]): CraftingComponentCombination[] {
        const usableIngredients: Ingredient[] = availableIngredients.filter((ingredient: Ingredient) => ingredient.component.essences.filter((essence: string) => requiredEssences.includes(essence)).length > 0);
        const uniqueEssencesInUsableComponents: string[] = usableIngredients.map((ingredient: Ingredient) => ingredient.component.essences)
            .reduce((left: string[],right:string[]) => left.concat(right), [])
            .filter(((essence, index, essences) => essences.indexOf(essence) === index));
        const essenceIdentities: Map<string, number> = FabricationHelper.assignEssenceIdentities(uniqueEssencesInUsableComponents);
        return FabricationHelper.asComponentCombinations(usableIngredients, requiredEssences.length)
            .map((combination: CraftingComponent[]) => {
            return new CraftingComponentCombination(combination, essenceIdentities);
        });
    }

    private selectBestCombinationFrom(recipe: Recipe, combinations: CraftingComponentCombination[]): CraftingComponent[] {
        const exactMatches: CraftingComponentCombination[] = [];
        const supersets: CraftingComponentCombination[] = [];
        combinations.forEach((combination: CraftingComponentCombination) => {
            const essenceMatchType: EssenceMatchType = combination.essenceMatchType(recipe.essences);
            switch (essenceMatchType) {
                case EssenceMatchType.EXACT:
                    exactMatches.push(combination);
                    break;
                case EssenceMatchType.SUPERSET:
                    supersets.push(combination);
                    break;
            }
        });
        const selectFewestComponents = (combinations: CraftingComponentCombination[]) => {
            return combinations.sort((left, right) => left.components.length - right.components.length)
                .find(() => true)
                .components;
        };
        if (exactMatches.length === 0 && supersets.length === 0) {
            return [];
        }
        return exactMatches.length > 0 ? selectFewestComponents(exactMatches) : selectFewestComponents(supersets);
    }

    public filterCraftableRecipesFor(craftingComponents: CraftingComponent[], recipes: Recipe[]) {
        return recipes.filter((recipe: Recipe) => this.isCraftableFromEssencesIn(recipe, craftingComponents));
    }

    private isCraftableFromEssencesIn(recipe: Recipe, components: CraftingComponent[]): boolean {
        const essences = components.map((component: CraftingComponent) => component.essences)
            .reduce((left: string[], right: string[]) => left.concat(right), []);
        return essences.every((essence: string) => recipe.essences.includes(essence)
            &&  (essences.filter((essence:string) => essence === essence).length >= recipe.essences.filter((essence:string) => essence === essence).length));
    }
}

export {Fabricator, AlchemySpecification};