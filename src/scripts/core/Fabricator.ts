import {Inventory} from '../actor/Inventory';
import {Recipe} from "../crafting/Recipe";
import {CraftingCheck} from "../crafting/CraftingCheck";
import {Combination, Unit} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {ActionType, FabricationAction} from "./FabricationAction";
import {OutcomeType} from "./OutcomeType";
import {FabricationOutcome} from "./FabricationOutcome";
import {AlchemicalCombiner} from "../crafting/alchemy/AlchemicalCombiner";
import {CraftingCheckResult} from "../crafting/CraftingCheckResult";
import {AlchemyError} from "../error/AlchemyError";
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

class Fabricator<ItemData, Actor> {

    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _consumeComponentsOnFailure: boolean;
    private readonly _alchemicalCombinersByBaseComponent: Map<CraftingComponent, AlchemicalCombiner>;

    constructor(builder: Fabricator.Builder<ItemData, Actor>) {
        this._craftingCheck = builder.craftingCheck;
        this._consumeComponentsOnFailure = builder.consumeComponentsOnFailure;
        this._alchemicalCombinersByBaseComponent = builder.alchemicalCombinersByBaseComponent;
    }

    public static builder<ItemData, Actor>(): Fabricator.Builder<ItemData, Actor> {
        return new Fabricator.Builder<ItemData, Actor>();
    }

    get craftingCheck(): CraftingCheck<Actor> {
        return this._craftingCheck;
    }

    get hasCraftingCheck(): boolean {
        return !!this._craftingCheck;
    }

    get supportsAlchemy(): boolean {
        return this._alchemicalCombinersByBaseComponent.size > 0
    }

    public async followRecipe(actor: Actor, inventory: Inventory<ItemData, Actor>, recipe: Recipe): Promise<FabricationOutcome> {
        if (recipe.hasNamedComponents && !inventory.containsIngredients(recipe.namedComponents)) {
            return this.abort(`You don't have all of the ingredients for ${recipe.name}. `);
        }

        const remainingComponents: Inventory<D, Actor> = inventory.excluding(recipe.namedComponents);
        if (recipe.requiresEssences && !remainingComponents.containsEssences(recipe.essences)) {
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
                const failureMessage: string = `Your crafting attempt was unsuccessful! ${this._consumeComponentsOnFailure ? 'The ingredients were wasted. ' : 'No ingredients were consumed. ' }`;
                return await this.fail(inventory, wastedComponents, failureMessage, performedCheck);
            case 'SUCCESS':
                return await this.succeed(inventory, preparedComponents, recipe.results, performedCheck);
        }

    }

    public async performAlchemy(baseComponent: CraftingComponent,
                                componentMix: Combination<CraftingComponent>,
                                actor: Actor,
                                inventory: Inventory<ItemData, Actor>): Promise<FabricationOutcome> {

        if (!this._alchemicalCombinersByBaseComponent.has(baseComponent)) {
            return this.abort(`No Alchemy Specification exists for '${baseComponent.name}' (${baseComponent.id}). `);
        }

        const alchemicalCombiner = <AlchemicalCombiner>this._alchemicalCombinersByBaseComponent.get(baseComponent);
        let alchemyResult: [Unit<CraftingComponent>, ItemData];
        try {
            alchemyResult = await alchemicalCombiner.perform(componentMix);
        } catch (error) {
            if (error instanceof AlchemyError) {
                const alchemyError: AlchemyError = <AlchemyError>error;
                const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure && alchemyError.causesWastage ? componentMix : Combination.EMPTY();
                return this.fail(inventory, wastedComponents, alchemyError.message)
            }
        }

        if (!this.hasCraftingCheck) {
            return this.succeedWith(inventory, componentMix, alchemyResult);
        }

        const performedCheck = this.craftingCheck.perform(actor, componentMix);
        switch (performedCheck.outcome) {
            case 'FAILURE':
                const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure ? componentMix : Combination.EMPTY();
                const failureMessage: string = `Your alchemical combination failed! ${this._consumeComponentsOnFailure ? 'The ingredients were wasted. ' : 'No ingredients were consumed. ' }`;
                return await this.fail(inventory, wastedComponents, failureMessage, performedCheck);
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

    private async fail(inventory: Inventory<ItemData, Actor>,
                       wastedComponents: Combination<CraftingComponent>,
                       message: string,
                       checkResult?: CraftingCheckResult): Promise<FabricationOutcome> {

        const removals: FabricationAction[] = [];
        if (!wastedComponents.isEmpty()) {
            this.asFabricationActions(wastedComponents, ActionType.REMOVE)
                .forEach((removal: FabricationAction) => removals.push(removal));
            await inventory.perform(removals);
        }

        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.FAILURE)
            .withActions(removals)
            .withCheckResult(checkResult)
            .withMessage(message)
            .build();
    }

    private async succeed(inventory: Inventory<ItemData, Actor>,
                          consumedComponents: Combination<CraftingComponent>,
                          addedComponents: Combination<CraftingComponent>,
                          checkResult?: CraftingCheckResult): Promise<FabricationOutcome> {

        const removals: FabricationAction[] = this.asFabricationActions(consumedComponents, ActionType.REMOVE);
        const additions: FabricationAction[] = this.asFabricationActions(addedComponents, ActionType.ADD);
        const allActions: FabricationAction[] = additions.concat(removals);

        await inventory.perform(allActions);

        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.SUCCESS)
            .withActions(allActions)
            .withCheckResult(checkResult)
            .build();
    }

    private async succeedWith(inventory: Inventory<Document, Actor>,
                          consumedComponents: Combination<CraftingComponent>,
                          alchemyResult: [Unit<CraftingComponent>, ItemData],
                          checkResult?: CraftingCheckResult): Promise<FabricationOutcome> {

        const removals: FabricationAction[] = this.asFabricationActions(consumedComponents, ActionType.REMOVE);
        const addition: FabricationAction = this.asFabricationAction(alchemyResult[0], ActionType.ADD, alchemyResult[1]);
        const allActions: FabricationAction[] = [addition].concat(removals);

        await inventory.perform(allActions);

        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.SUCCESS)
            .withActions(allActions)
            .withCheckResult(checkResult)
            .build();
    }

    private asFabricationActions(components: Combination<CraftingComponent>, actionType: ActionType): FabricationAction[] {
        return components.units.map((unit: Unit<CraftingComponent>) => {
            return FabricationAction.builder()
                .withActionType(actionType)
                .withComponent(unit)
                .withHasCustomData(false)
                .build();
        });
    }

    private asFabricationAction(componentUnit: Unit<CraftingComponent>, actionType: ActionType, itemData?: Item.Data): FabricationAction {
        return FabricationAction.builder()
            .withActionType(actionType)
            .withComponent(componentUnit)
            .withItemData(itemData)
            .build();
    }

}

namespace Fabricator {

    export class Builder<D, A extends Actor> {

        public craftingCheck: CraftingCheck<A>;
        public consumeComponentsOnFailure: boolean;
        public alchemicalCombiners: AlchemicalCombiner[] = [];

        public alchemicalCombinersByBaseComponent: Map<CraftingComponent, AlchemicalCombiner> = new Map();

        public build(): Fabricator<D, A> {
            if (this.alchemicalCombiners && this.alchemicalCombiners.length > 0) {
                this.alchemicalCombinersByBaseComponent = new Map(this.alchemicalCombiners.map(combiner => [combiner.baseComponent, combiner]));
            }
            return new Fabricator<D, A>(this);
        }

        public withAlchemicalCombiner(value: AlchemicalCombiner): Builder<D, A> {
            this.alchemicalCombiners.push(value);
            return this;
        }

        public withAlchemicalCombiners(value: AlchemicalCombiner[]): Builder<D, A> {
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