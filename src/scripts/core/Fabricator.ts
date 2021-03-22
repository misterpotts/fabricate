import {Recipe} from "./Recipe";
import {FabricationAction} from "./FabricationAction";
import {CraftingComponent} from "./CraftingComponent";
import {FabricationHelper} from "./FabricationHelper";
import {EssenceCombiner} from "./EssenceCombiner";
import {FabricationOutcome, OutcomeType} from "./FabricationOutcome";
import {Inventory} from "../game/Inventory";
import {InventoryRecord} from "../game/InventoryRecord";
import {Ingredient} from "./Ingredient";
import {AlchemyError} from "../error/AlchemyError";
import {CraftingError} from "../error/CraftingError";
import {CraftingCheck, CraftingCheckResult} from "./CraftingCheck";
import {ActionType} from "../game/CompendiumData";

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

class Fabricator<I extends Item.Data, A extends Actor<Actor.Data, I>> {
    private readonly _alchemySpecification: AlchemySpecification<I>;
    private readonly _craftingCheck: CraftingCheck<A>;

    constructor(builder: Fabricator.Builder<I, A>) {
        this._alchemySpecification = builder.alchemySpecification;
        this._craftingCheck = builder.craftingCheck;
    }

    public static builder<I extends Item.Data, A extends Actor>(): Fabricator.Builder<I, A> {
        return new Fabricator.Builder<I, A>();
    }

    get alchemySpecification(): AlchemySpecification<I> {
        return this._alchemySpecification;
    }

    get craftingCheck(): CraftingCheck<A> {
        return this._craftingCheck;
    }

    public async fabricateFromComponents(actor: A, inventory: Inventory<I>, components: CraftingComponent[]): Promise<FabricationOutcome> {
        if (!this._alchemySpecification) {
            throw new Error(`No Alchemy Specification has been provided for this system. You may only craft from Recipes. `);
        }

        if (this._craftingCheck) {
            const craftingCheckResult: CraftingCheckResult = this.craftingCheck.perform(actor, components);
            switch (craftingCheckResult.outcome) {
                case OutcomeType.SUCCESS:

                    break;
                case OutcomeType.FAILURE:
                    const removedComponents: FabricationAction<Item.Data>[] = FabricationHelper.asCraftingResults(components, ActionType.REMOVE);
                    FabricationHelper.applyResults(removedComponents, inventory);
                    return FabricationOutcome.builder()
                        .withOutcomeType(OutcomeType.FAILURE)
                        .withFailureDetails(`Rolled a ${craftingCheckResult.result}, needed a ${craftingCheckResult.successThreshold}`)
                        .withActions(removedComponents)
                        .build();
            }
        }

        const removeSuppliedComponents: FabricationAction<Item.Data>[] = FabricationHelper.asCraftingResults(components, ActionType.REMOVE);

        try {
            const baseItemData: I = await this._alchemySpecification.getBaseItemData();
            const alchemicallyModifiedItemData: I = this._alchemySpecification.essenceCombiner.combine(components, duplicate(baseItemData));
            const resultantComponentType: CraftingComponent = this._alchemySpecification.baseComponent;
            const addComponent: FabricationAction<I> = FabricationAction.builder<I>()
                .withActionType(ActionType.ADD)
                .withQuantity(1)
                .withCustomItemData(alchemicallyModifiedItemData)
                .withItemType(resultantComponentType)
                .build();
            const actions: FabricationAction<Item.Data>[] = removeSuppliedComponents.concat(addComponent);
            await FabricationHelper.applyResults(actions, inventory);
            return FabricationOutcome.builder()
                .withActions(actions)
                .withOutcomeType(OutcomeType.SUCCESS)
                .build();
        } catch (error: any) {
            if (error instanceof AlchemyError) {
                const alchemyError: AlchemyError = <AlchemyError>error;
                const actions: FabricationAction<I>[] = [];
                if (alchemyError.componentsConsumed) {
                    // @ts-ignore
                    actions.push(...removeSuppliedComponents);
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

    // todo - add actor as arg and crafting check
    public async fabricateFromRecipe(inventory: Inventory<I>, recipe: Recipe): Promise<FabricationOutcome> {
        const ownedComponents: InventoryRecord<CraftingComponent, Item>[] = inventory.components.filter((record: InventoryRecord<CraftingComponent, Item>) => record.fabricateItem.systemId === recipe.systemId);

        const input: FabricationAction<I>[] = [];
        const namedIngredientsByPartId: Map<string, Ingredient> = new Map();
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach((ingredient: Ingredient) => {
                namedIngredientsByPartId.set(ingredient.partId, ingredient);
                if (ingredient.consumed) {
                    input.push(FabricationAction.builder<I>()
                        .withQuantity(ingredient.quantity)
                        .withItemType(ingredient.component)
                        .withActionType(ActionType.REMOVE)
                        .build());
                }
            });
        }

        if (recipe.essences && recipe.essences.length > 0) {
            const availableIngredients: Ingredient[] = ownedComponents.map((componentRecord: InventoryRecord<CraftingComponent, Item>) => {
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
            if (!this.isCraftableFromEssencesInIngredients(recipe, availableIngredients)) {
                throw new CraftingError(`You don't have enough ingredients available to craft ${recipe.name}. Go shopping, try foraging or even just asking your GM nicely. `, false);
            }
            const craftingComponentCombinations = this.analyzeCombinationsForEssences(availableIngredients, recipe.essences);
            const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(recipe, craftingComponentCombinations);
            if (!selectedCombination || selectedCombination.length === 0) {
                throw new CraftingError(`You don't have enough ingredients available to craft ${recipe.name}. Go shopping, try foraging or even just asking your GM nicely. `, false)
            }
            const consumedComponents = FabricationHelper.asCraftingResults(selectedCombination, ActionType.REMOVE);
            // @ts-ignore
            input.push(...consumedComponents);
        }

        const output: FabricationAction<I>[] = recipe.results;
        const actions: FabricationAction<I>[] = output.concat(input);

        await FabricationHelper.applyResults(actions, inventory);
        return FabricationOutcome.builder()
            .withRecipe(recipe)
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
        return recipes.filter((recipe: Recipe) => this.isCraftableFromEssencesInComponents(recipe, craftingComponents));
    }

    private isCraftableFromEssencesInComponents(recipe: Recipe, components: CraftingComponent[]): boolean {
        const essences = components.map((component: CraftingComponent) => component.essences)
            .reduce((left: string[], right: string[]) => left.concat(right), []);
        return essences.every((essence: string) => recipe.essences.includes(essence)
            &&  (essences.filter((essence:string) => essence === essence).length >= recipe.essences.filter((essence:string) => essence === essence).length));
    }

    private isCraftableFromEssencesInIngredients(recipe: Recipe, ingredients: Ingredient[]): boolean {
        const essenceCount: Map<string, number> = ingredients.filter((ingredient: Ingredient) => ingredient.component.essences.some((essence: string) => recipe.essences.includes(essence)))
            .map((ingredient: Ingredient) => new Map(ingredient.component.essences.map((essence: string) => [essence, ingredient.quantity])))
            .reduce((left: Map<string, number>, right: Map<string, number>) => {
                const allEssenceKeys: string[] = Array.from(left.keys()).concat(Array.from(right.keys()))
                    .filter(((essence: string, index: number, mergedKeys: string[]) => mergedKeys.indexOf(essence) === index));
                const merged: Map<string, number> = new Map();
                allEssenceKeys.forEach((essence: string) => {
                    const leftCount: number = left.has(essence) ? left.get(essence) : 0;
                    const rightCount: number = right.has(essence) ? right.get(essence) : 0;
                    merged.set(essence, leftCount + rightCount);
                });
                return merged;
            }, new Map<string, number>());
        for (let i = 0; i < recipe.essences.length; i++) {
            const essence: string = recipe.essences[i];
            if (!essenceCount.has(essence)) {
                return false;
            }
            const count: number = essenceCount.get(essence);
            if (count <= 0) {
                return false;
            }
        }
        return true;
    }

}

namespace Fabricator {

    export class Builder<I extends Item.Data, A extends Actor> {

        public alchemySpecification: AlchemySpecification<I>;
        public craftingCheck: CraftingCheck<A>;

        public build(): Fabricator<I, A> {
            return new Fabricator<I, A>(this);
        }

        public withAlchemySpecification(value: AlchemySpecification<I>): Builder<I, A> {
            this.alchemySpecification = value;
            return this;
        }

        public withCraftingCheck(value: CraftingCheck<A>): Builder<I, A> {
            this.craftingCheck = value;
            return this;
        }

    }

}

export {Fabricator, AlchemySpecification};