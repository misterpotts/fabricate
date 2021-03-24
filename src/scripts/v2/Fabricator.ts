import {Inventory} from './Inventory';
import {Recipe} from "./Recipe";
import {CraftingCheck, CraftingCheckResult} from "./CraftingCheck";
import {Combination} from "./Combination";
import {CraftingComponent} from "./CraftingComponent";
import {FabricationAction} from "./FabricationAction";
import {OutcomeType} from "./OutcomeType";
import {FabricationOutcome} from "./FabricationOutcome";

class Fabricator<I extends Item, A extends Actor<Actor.Data, I>> {

    private readonly _craftingCheck: CraftingCheck<I, A>;
    private _consumeComponentsOnFailure: boolean;

    constructor(builder: Fabricator.Builder<I, A>) {
        this._craftingCheck = builder.craftingCheck;
        this._consumeComponentsOnFailure = builder.consumeComponentsOnFailure;
    }

    get craftingCheck(): CraftingCheck<I, A> {
        return this._craftingCheck;
    }

    get hasCraftingCheck(): boolean {
        return !!this._craftingCheck;
    }

    public async followRecipe(actor: A, inventory: Inventory<I, A>, recipe: Recipe) {
        if (recipe.hasNamedComponents && !inventory.containsIngredients(recipe.namedComponents)) {
            return this.abort(`You don't have all of the ingredients for ${recipe.name}. `);
        }

        const remainingComponents: Inventory<I, A> = inventory.excluding(recipe.namedComponents);
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
                const wastedComponents: Combination<CraftingComponent> = this._consumeComponentsOnFailure ? preparedComponents : Combination.EMPTY;
                return await this.fail(inventory, wastedComponents, performedCheck);
            case 'SUCCESS':
                return await this.succeed(inventory, preparedComponents, recipe.results, performedCheck);
        }

    }

    private abort(message: string) {
        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.NOT_ATTEMPTED)
            .withActions([])
            .withMessage(message)
            .build();
    }

    private async fail(inventory: Inventory<I, A>,
                       wastedComponents: Combination<CraftingComponent>,
                       checkResult: CraftingCheckResult) {
        const removals: FabricationAction[] = await inventory.removeAll(wastedComponents);
        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.FAILURE)
            .withActions(removals)
            .withCheckResult(checkResult)
            .build();
    }

    private async succeed(inventory: Inventory<I, A>,
                          consumedComponents: Combination<CraftingComponent>,
                          addedComponents: Combination<CraftingComponent>,
                          checkResult?: CraftingCheckResult) {

        const removals: FabricationAction[] = await inventory.removeAll(consumedComponents);
        const additions: FabricationAction[] = await inventory.addAll(addedComponents);

        return FabricationOutcome.builder()
            .withOutcome(OutcomeType.SUCCESS)
            .withActions(removals.concat(additions))
            .withCheckResult(checkResult)
            .build();
    }

}

namespace Fabricator {

    export class Builder<I extends Item, A extends Actor<Actor.Data, I>> {

        public craftingCheck: CraftingCheck<I, A>;
        public consumeComponentsOnFailure: boolean;

        public build(): Fabricator<I, A> {
            return new Fabricator<I, A>(this);
        }

        public withCraftingCheck(value: CraftingCheck<I, A>): Builder<I, A> {
            this.craftingCheck = value;
            return this;
        }

        public withConsumeComponentsOnFailure(value: boolean): Builder<I, A> {
            this.consumeComponentsOnFailure = value;
            return this;
        }

    }

}

export {Fabricator}