import {Inventory} from './Inventory';
import {Recipe} from "./Recipe";
import {CraftingCheck, CraftingCheckResult} from "./CraftingCheck";
import {Combination, Unit} from "./Combination";
import {CraftingComponent} from "./CraftingComponent";
import {ActionType, FabricationAction} from "./FabricationAction";
import {OutcomeType} from "./OutcomeType";
import {FabricationOutcome} from "./FabricationOutcome";
import {AlchemicalCombiner} from "./AlchemicalCombiner";

class Fabricator<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {

    private readonly _craftingCheck: CraftingCheck<A>;
    private readonly _consumeComponentsOnFailure: boolean;
    private readonly _alchemicalCombinersByBaseComponent: Map<CraftingComponent, AlchemicalCombiner<D>>;

    constructor(builder: Fabricator.Builder<D, A>) {
        this._craftingCheck = builder.craftingCheck;
        this._consumeComponentsOnFailure = builder.consumeComponentsOnFailure;
        this._alchemicalCombinersByBaseComponent = builder.alchemicalCombinersByBaseComponent;
    }

    get craftingCheck(): CraftingCheck<A> {
        return this._craftingCheck;
    }

    get hasCraftingCheck(): boolean {
        return !!this._craftingCheck;
    }

    get supportsAlchemy(): boolean {
        return this._alchemicalCombinersByBaseComponent.size > 0
    }

    public async followRecipe(actor: A, inventory: Inventory<D, A>, recipe: Recipe): Promise<FabricationOutcome> {
        if (recipe.hasNamedComponents && !inventory.containsIngredients(recipe.namedComponents)) {
            return this.abort(`You don't have all of the ingredients for ${recipe.name}. `);
        }

        const remainingComponents: Inventory<D, A> = inventory.excluding(recipe.namedComponents);
        if (recipe.requiresEssences && remainingComponents.containsEssences(recipe.essences)) {
            return this.abort(`There aren't enough essences amongst components in your inventory to craft ${recipe.name}. `);
        }

        const essenceContribution: Combination<CraftingComponent> = remainingComponents.selectFor(recipe.essences);
        const preparedComponents = recipe.ingredients.combineWith(essenceContribution);

        if (!this.hasCraftingCheck) {
            return await this.succeed(inventory, preparedComponents, recipe.results);
        }

        const performedCheck = this.craftingCheck.perform(actor, preparedComponents);
        switch (performedCheck.outcome) {
            case 'FAILURE':
                const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure ? preparedComponents : Combination.EMPTY();
                return await this.fail(inventory, wastedComponents, performedCheck);
            case 'SUCCESS':
                return await this.succeed(inventory, preparedComponents, recipe.results, performedCheck);
        }

    }

    public async performAlchemy(baseComponent: CraftingComponent,
                                componentMix: Combination<CraftingComponent>,
                                actor: A,
                                inventory: Inventory<D, A>): Promise<FabricationOutcome> {
        if (!this._alchemicalCombinersByBaseComponent.has(baseComponent)) {
            return this.abort(`No Alchemy Specification exists for '${baseComponent.name}' (${baseComponent.id}). `);
        }

        const alchemicalCombiner: AlchemicalCombiner<D> = this._alchemicalCombinersByBaseComponent.get(baseComponent);
        const alchemyResult: [Unit<CraftingComponent>, D] = await alchemicalCombiner.perform(componentMix);

        if (!this.hasCraftingCheck) {
            return this.succeedWith(inventory, componentMix, alchemyResult);
        }

        const performedCheck = this.craftingCheck.perform(actor, componentMix);
        switch (performedCheck.outcome) {
            case 'FAILURE':
                const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure ? componentMix : Combination.EMPTY();
                return await this.fail(inventory, wastedComponents, performedCheck);
            case 'SUCCESS':
                return await this.succeedWith(inventory, componentMix, alchemyResult, performedCheck);
        }
    }

    private abort(message: string): FabricationOutcome {
        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.NOT_ATTEMPTED)
            .withActions([])
            .withMessage(message)
            .build();
    }

    private async fail(inventory: Inventory<D, A>,
                       wastedComponents: Combination<CraftingComponent>,
                       checkResult: CraftingCheckResult): Promise<FabricationOutcome> {
        const removals: FabricationAction[] = await inventory.removeAll(wastedComponents);
        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.FAILURE)
            .withActions(removals)
            .withCheckResult(checkResult)
            .build();
    }

    private async succeed(inventory: Inventory<D, A>,
                          consumedComponents: Combination<CraftingComponent>,
                          addedComponents: Combination<CraftingComponent>,
                          checkResult?: CraftingCheckResult): Promise<FabricationOutcome> {

        const removals: FabricationAction[] = await inventory.removeAll(consumedComponents);
        const additions: FabricationAction[] = await inventory.addAll(addedComponents);

        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.SUCCESS)
            .withActions(removals.concat(additions))
            .withCheckResult(checkResult)
            .build();
    }

    private async succeedWith(inventory: Inventory<D, A>,
                          consumedComponents: Combination<CraftingComponent>,
                          alchemyResult: [Unit<CraftingComponent>, Item.Data<D>],
                          checkResult?: CraftingCheckResult): Promise<FabricationOutcome> {

        const addition: FabricationAction<D> = this.asFabricationAction(alchemyResult[0], ActionType.ADD, alchemyResult[1]);
        const removals: FabricationAction<D>[] = consumedComponents.members.map((member) => );

        const removals: FabricationAction[] = await inventory.removeAll(consumedComponents);
        const additions: FabricationAction[] = await inventory.createAll([alchemyResult]);

        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.SUCCESS)
            .withActions(removals.concat(additions))
            .withCheckResult(checkResult)
            .build();
    }

    private asFrabricationActions(components: Combination<CraftingComponent>, actionType: ActionType): FabricationAction<D>[] {
        components.units.map()
    }

    private asFabricationAction(componentUnit: Unit<CraftingComponent>, actionType: ActionType, itemData?: Item.Data<D>): FabricationAction<D> {
        return FabricationAction.builder<D>()
            .withActionType(actionType)
            .withComponent(componentUnit)
            .withItemData(itemData)
            .build();
    }

}

namespace Fabricator {

    export class Builder<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {

        public craftingCheck: CraftingCheck<A>;
        public consumeComponentsOnFailure: boolean;
        public alchemicalCombiners: AlchemicalCombiner<D>[] = [];

        public alchemicalCombinersByBaseComponent: Map<CraftingComponent, AlchemicalCombiner<D>> = new Map();

        public build(): Fabricator<D, A> {
            if (this.alchemicalCombiners && this.alchemicalCombiners.length > 0) {
                this.alchemicalCombinersByBaseComponent = new Map(this.alchemicalCombiners.map(combiner => [combiner.baseComponent, combiner]));
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

export {Fabricator}