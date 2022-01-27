import { Inventory } from '../actor/Inventory';
import { Recipe } from '../crafting/Recipe';
import { CraftingCheck } from '../crafting/CraftingCheck';
import { Combination, Unit } from '../common/Combination';
import { CraftingComponent } from '../common/CraftingComponent';
import { ActionType, FabricationAction } from './FabricationAction';
import { OutcomeType } from './OutcomeType';
import { FabricationOutcome } from './FabricationOutcome';
import { AlchemicalCombiner } from '../crafting/alchemy/AlchemicalCombiner';
import { CraftingCheckResult } from '../crafting/CraftingCheckResult';
import { AlchemyError } from '../error/AlchemyError';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { game } from '../settings';
import { FabricationHelper } from './FabricationHelper';

class AlchemySpecification<T extends ItemData, A extends Actor> {
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
      const compendium: CompendiumCollection<any> = <CompendiumCollection<any>>game.packs.get(this.baseComponent.systemId);
      // @ts-ignore
      const entity: Entity<T> = await compendium.getDocument(this.baseComponent.partId); // await compendium.getEntity(this.baseComponent.partId);
      this._baseItemData = entity.data.data;
      return this._baseItemData;
  }
}

class Fabricator<D extends ItemData, A extends Actor> {
  private readonly _craftingCheck: CraftingCheck<A>;
  private readonly _consumeComponentsOnFailure: boolean;
  private readonly _alchemicalCombinersByBaseComponent: Map<CraftingComponent, AlchemicalCombiner<D>>;
  private readonly _alchemySpecification: AlchemySpecification<D,A>;

  constructor(builder: Fabricator.Builder<D, A>) {
    this._craftingCheck = builder.craftingCheck;
    this._consumeComponentsOnFailure = builder.consumeComponentsOnFailure;
    this._alchemicalCombinersByBaseComponent = builder.alchemicalCombinersByBaseComponent;
  }

  public static builder<D extends ItemData, A extends Actor>(): Fabricator.Builder<D, A> {
    return new Fabricator.Builder<D, A>();
  }

  get craftingCheck(): CraftingCheck<A> {
    return this._craftingCheck;
  }

  get hasCraftingCheck(): boolean {
    return !!this._craftingCheck;
  }

  get supportsAlchemy(): boolean {
    return this._alchemicalCombinersByBaseComponent.size > 0;
  }

  public async followRecipe(
    actor: A,
    inventory: Inventory<D, A>,
    recipe: Recipe,
  ): Promise<FabricationOutcome | undefined> {
    if (recipe.hasNamedComponents && !inventory.containsIngredients(recipe.namedComponents)) {
      return <FabricationOutcome>this.abort(`You don't have all of the ingredients for ${recipe.name}. `);
    }

    const remainingComponents: Inventory<D, A> = inventory.excluding(recipe.namedComponents);
    if (recipe.requiresEssences && !remainingComponents.containsEssences(recipe.essences)) {
      return <FabricationOutcome>(
        this.abort(`There aren't enough essences amongst components in your inventory to craft ${recipe.name}. `)
      );
    }

    const essenceContribution: Combination<CraftingComponent> = remainingComponents.selectFor(recipe.essences);
    const preparedComponents = recipe.ingredients.combineWith(essenceContribution);

    if (!this.hasCraftingCheck) {
      return <FabricationOutcome>await this.succeed(inventory, preparedComponents, recipe.results);
    }

    const performedCheck = this.craftingCheck.perform(actor, preparedComponents);
    switch (performedCheck.outcome) {
      case 'FAILURE':
        const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure
          ? preparedComponents
          : Combination.EMPTY();
        const failureMessage: string = `Your crafting attempt was unsuccessful! ${
          this._consumeComponentsOnFailure ? 'The ingredients were wasted. ' : 'No ingredients were consumed. '
        }`;
        return <FabricationOutcome>await this.fail(inventory, wastedComponents, failureMessage, performedCheck);
      case 'SUCCESS':
        return <FabricationOutcome>await this.succeed(inventory, preparedComponents, recipe.results, performedCheck);
    }
    return undefined;
  }

  public async performAlchemy(
    baseComponent: CraftingComponent,
    componentMix: Combination<CraftingComponent>,
    actor: A,
    inventory: Inventory<D, A>,
  ): Promise<FabricationOutcome | undefined> {
    if (!this._alchemicalCombinersByBaseComponent.has(baseComponent)) {
      return <FabricationOutcome>(
        this.abort(`No Alchemy Specification exists for '${baseComponent.name}' (${baseComponent.id}). `)
      );
    }

    const alchemicalCombiner: AlchemicalCombiner<D> = <AlchemicalCombiner<D>>(
      this._alchemicalCombinersByBaseComponent.get(baseComponent)
    );
    let alchemyResult;
    try {
      alchemyResult = <[Unit<CraftingComponent>, ItemData]>await alchemicalCombiner.perform(componentMix);
    } catch (error) {
      if (error instanceof AlchemyError) {
        const alchemyError: AlchemyError = <AlchemyError>error;
        const wastedComponents: Combination<CraftingComponent> =
          this._consumeComponentsOnFailure && alchemyError.causesWastage ? componentMix : Combination.EMPTY();
        return <FabricationOutcome>await this.fail(inventory, wastedComponents, alchemyError.message);
      }
    }

    if (!this.hasCraftingCheck) {
      return <FabricationOutcome>await this.succeedWith(inventory, componentMix, alchemyResult);
    }

    const performedCheck = this.craftingCheck.perform(actor, componentMix);
    switch (performedCheck.outcome) {
      case 'FAILURE': {
        const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure
          ? componentMix
          : Combination.EMPTY();
        const failureMessage: string = `Your alchemical combination failed! ${
          this._consumeComponentsOnFailure ? 'The ingredients were wasted. ' : 'No ingredients were consumed. '
        }`;
        return <FabricationOutcome>await this.fail(inventory, wastedComponents, failureMessage, performedCheck);
      }
      case 'SUCCESS': {
        return <FabricationOutcome>await this.succeedWith(inventory, componentMix, alchemyResult, performedCheck);
      }
    }
    return undefined;
  }

  private abort(message: string): FabricationOutcome {
    return FabricationOutcome.builder()
      .withOutcome(OutcomeType.NOT_ATTEMPTED)
      .withActions([])
      .withMessage(message)
      .build();
  }

  private async fail(
    inventory: Inventory<D, A>,
    wastedComponents: Combination<CraftingComponent>,
    message: string,
    checkResult?: CraftingCheckResult,
  ): Promise<FabricationOutcome> {
    const removals: FabricationAction<D>[] = [];
    if (!wastedComponents.isEmpty()) {
      this.asFabricationActions(wastedComponents, ActionType.REMOVE).forEach((removal: FabricationAction<D>) =>
        removals.push(removal),
      );
      await inventory.perform(removals);
    }

    return FabricationOutcome.builder()
      .withOutcome(OutcomeType.FAILURE)
      .withActions(removals)
      .withCheckResult(<CraftingCheckResult>checkResult)
      .withMessage(message)
      .build();
  }

  private async succeed(
    inventory: Inventory<D, A>,
    consumedComponents: Combination<CraftingComponent>,
    addedComponents: Combination<CraftingComponent>,
    checkResult?: CraftingCheckResult,
  ): Promise<FabricationOutcome> {
    const removals: FabricationAction<D>[] = this.asFabricationActions(consumedComponents, ActionType.REMOVE);
    const additions: FabricationAction<D>[] = this.asFabricationActions(addedComponents, ActionType.ADD);
    const allActions: FabricationAction<D>[] = additions.concat(removals);

    await inventory.perform(allActions);

    return FabricationOutcome.builder()
      .withOutcome(OutcomeType.SUCCESS)
      .withActions(allActions)
      .withCheckResult(<CraftingCheckResult>checkResult)
      .build();
  }

  private async succeedWith(
    inventory: Inventory<D, A>,
    consumedComponents: Combination<CraftingComponent>,
    alchemyResult: [Unit<CraftingComponent>, ItemData],
    checkResult?: CraftingCheckResult,
  ): Promise<FabricationOutcome> {
    const removals: FabricationAction<D>[] = this.asFabricationActions(consumedComponents, ActionType.REMOVE);
    const addition: FabricationAction<D> = this.asFabricationAction(alchemyResult[0], ActionType.ADD, alchemyResult[1]);
    const allActions: FabricationAction<D>[] = [addition].concat(removals);

    await inventory.perform(allActions);

    return FabricationOutcome.builder()
      .withOutcome(OutcomeType.SUCCESS)
      .withActions(allActions)
      .withCheckResult(<CraftingCheckResult>checkResult)
      .build();
  }

  private asFabricationActions(
    components: Combination<CraftingComponent>,
    actionType: ActionType,
  ): FabricationAction<D>[] {
    return components.units.map((unit: Unit<CraftingComponent>) => {
      return FabricationAction.builder<D>()
        .withActionType(actionType)
        .withComponent(unit)
        .withHasCustomData(false)
        .build();
    });
  }

  private asFabricationAction(
    componentUnit: Unit<CraftingComponent>,
    actionType: ActionType,
    itemData?: ItemData,
  ): FabricationAction<D> {
    return FabricationAction.builder<D>()
      .withActionType(actionType)
      .withComponent(componentUnit)
      .withItemData(<ItemData>itemData)
      .build();
  }

  // ===================================================================

  public async fabricateFromComponents(
    inventory: Inventory<D,A>,
    components: CraftingComponent[],
  ): Promise<FabricationOutcome> {
    if (!this._alchemySpecification) {
      throw new Error(`No Alchemy Specification has been provided for this system. You may only craft from Recipes. `);
    }

    const removeSuppliedComponents: FabricationAction<D,A>[] = FabricationHelper.asCraftingResults(
      components,
      ActionType.REMOVE,
    );

    try {
      const baseItemData: D = await this._alchemySpecification.getBaseItemData();
      const alchemicallyModifiedItemData: D = this._alchemySpecification.essenceCombiner.combine(
        components,
        duplicate(baseItemData),
      );
      const resultantComponentType: CraftingComponent = this._alchemySpecification.baseComponent;
      const addComponent: FabricationAction<D> = FabricationAction.builder<D>()
        .withActionType(ActionType.ADD)
        // .withQuantity(1)
        .withItemData(alchemicallyModifiedItemData)
        .withComponent(resultantComponentType)
        .build();
      const actions: FabricationAction<T>[] = removeSuppliedComponents.concat(addComponent);
      await FabricationHelper.applyResults(actions, inventory);
      return FabricationOutcome.builder().withActions(actions).withOutcome(OutcomeType.SUCCESS).build();
    } catch (error: any) {
      if (error instanceof AlchemyError) {
        const alchemyError: AlchemyError = <AlchemyError>error;
        const actions: FabricationAction<T>[] = [];
        if (alchemyError.components) {
          actions.push(...removeSuppliedComponents);
          await FabricationHelper.applyResults(removeSuppliedComponents, inventory);
        }
        return FabricationOutcome.builder()
          .withOutcome(OutcomeType.FAILURE)
          .withMessage(alchemyError.message)
          .withActions(actions)
          .build();
      }
      throw error;
    }
  }

  public async fabricateFromRecipe(inventory: Inventory<T>, recipe: Recipe): Promise<FabricationOutcome> {
    const ownedComponents: InventoryRecord<CraftingComponent>[] = inventory.components.filter(
      (record: InventoryRecord<CraftingComponent>) => record.fabricateItem.systemId === recipe.systemId,
    );

    const input: FabricationAction<T>[] = [];
    const namedIngredientsByPartId: Map<string, Ingredient> = new Map();
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ingredient: Ingredient) => {
        namedIngredientsByPartId.set(ingredient.partId, ingredient);
        if (ingredient.consumed) {
          input.push(
            FabricationAction.builder<T>()
              .withQuantity(ingredient.quantity)
              .withItemType(ingredient.component)
              .withActionType(ActionType.REMOVE)
              .build(),
          );
        }
      });
    }

    if (recipe.essences && recipe.essences.length > 0) {
      const availableIngredients: Ingredient[] = ownedComponents.map(
        (componentRecord: InventoryRecord<CraftingComponent>) => {
          if (namedIngredientsByPartId.has(componentRecord.fabricateItem.partId)) {
            const namedIngredient: Ingredient = namedIngredientsByPartId.get(componentRecord.fabricateItem.partId);
            const availableQuantityForEssenceExtraction: number =
              componentRecord.totalQuantity > namedIngredient.quantity
                ? componentRecord.totalQuantity - namedIngredient.quantity
                : 0;
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
        },
      );
      if (!this.isCraftableFromEssencesInIngredients(recipe, availableIngredients)) {
        throw new CraftingError(
          `You don't have enough ingredients available to craft ${recipe.name}. Go shopping, try foraging or even just asking your GM nicely. `,
          false,
        );
      }
      const craftingComponentCombinations = this.analyzeCombinationsForEssences(availableIngredients, recipe.essences);
      const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(
        recipe,
        craftingComponentCombinations,
      );
      if (!selectedCombination || selectedCombination.length === 0) {
        throw new CraftingError(
          `You don't have enough ingredients available to craft ${recipe.name}. Go shopping, try foraging or even just asking your GM nicely. `,
          false,
        );
      }
      const consumedComponents = FabricationHelper.asCraftingResults(selectedCombination, ActionType.REMOVE);
      input.push(...consumedComponents);
    }

    const output: FabricationAction<T>[] = recipe.results;
    const actions: FabricationAction<T>[] = output.concat(input);

    await FabricationHelper.applyResults(actions, inventory);
    return FabricationOutcome.builder()
      .withRecipe(recipe)
      .withActions(actions)
      .withOutcomeType(OutcomeType.SUCCESS)
      .build();
  }

  private analyzeCombinationsForEssences(
    availableIngredients: Ingredient[],
    requiredEssences: string[],
  ): CraftingComponentCombination[] {
    const usableIngredients: Ingredient[] = availableIngredients.filter(
      (ingredient: Ingredient) =>
        ingredient.component.essences.filter((essence: string) => requiredEssences.includes(essence)).length > 0,
    );
    const uniqueEssencesInUsableComponents: string[] = usableIngredients
      .map((ingredient: Ingredient) => ingredient.component.essences)
      .reduce((left: string[], right: string[]) => left.concat(right), [])
      .filter((essence, index, essences) => essences.indexOf(essence) === index);
    const essenceIdentities: Map<string, number> = FabricationHelper.assignEssenceIdentities(
      uniqueEssencesInUsableComponents,
    );
    return FabricationHelper.asComponentCombinations(usableIngredients, requiredEssences.length).map(
      (combination: CraftingComponent[]) => {
        return new CraftingComponentCombination(combination, essenceIdentities);
      },
    );
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
      return combinations.sort((left, right) => left.components.length - right.components.length).find(() => true)
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
    const essences = components
      .map((component: CraftingComponent) => component.essences)
      .reduce((left: string[], right: string[]) => left.concat(right), []);
    return essences.every(
      (essence: string) =>
        recipe.essences.includes(essence) &&
        essences.filter((essence: string) => essence === essence).length >=
          recipe.essences.filter((essence: string) => essence === essence).length,
    );
  }

  private isCraftableFromEssencesInIngredients(recipe: Recipe, ingredients: Ingredient[]): boolean {
    const essenceCount: Map<string, number> = ingredients
      .filter((ingredient: Ingredient) =>
        ingredient.component.essences.some((essence: string) => recipe.essences.includes(essence)),
      )
      .map(
        (ingredient: Ingredient) =>
          new Map(ingredient.component.essences.map((essence: string) => [essence, ingredient.quantity])),
      )
      .reduce((left: Map<string, number>, right: Map<string, number>) => {
        const allEssenceKeys: string[] = Array.from(left.keys())
          .concat(Array.from(right.keys()))
          .filter((essence: string, index: number, mergedKeys: string[]) => mergedKeys.indexOf(essence) === index);
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
  export class Builder<D extends ItemData, A extends Actor> {
    public craftingCheck: CraftingCheck<A>;
    public consumeComponentsOnFailure: boolean;
    public alchemicalCombiners: AlchemicalCombiner<D>[] = [];

    public alchemicalCombinersByBaseComponent: Map<CraftingComponent, AlchemicalCombiner<D>> = new Map();

    public build(): Fabricator<D, A> {
      if (this.alchemicalCombiners && this.alchemicalCombiners.length > 0) {
        this.alchemicalCombinersByBaseComponent = new Map(
          this.alchemicalCombiners.map((combiner) => [combiner.baseComponent, combiner]),
        );
      }
      return new Fabricator<D, A>(this);
    }

    public withAlchemicalCombiner(value: AlchemicalCombiner<D>): Builder<D, A> {
      this.alchemicalCombiners.push(value);
      return this;
    }

    public withAlchemicalCombiners(value: AlchemicalCombiner<D>[]): Builder<D, A> {
      this.alchemicalCombiners = value;
      return this;
    }

    public withCraftingCheck(value: CraftingCheck<A>): Builder<D, A> {
      this.craftingCheck = value;
      return this;
    }

    public withConsumeComponentsOnFailure(value: boolean): Builder<D, A> {
      this.consumeComponentsOnFailure = value;
      return this;
    }
  }
}

export { Fabricator };
