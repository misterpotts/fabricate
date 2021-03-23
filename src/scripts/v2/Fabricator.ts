import {Inventory} from './Inventory';
import {Recipe} from "./Recipe";
import {ComponentUnit} from "./CraftingComponent";
import {CraftingCheck} from "./CraftingCheck";
import {EssenceDefinition, EssenceIdentityProvider} from "./EssenceDefinition";

class FabricationOutcome {

}

class Fabricator<I extends Item, A extends Actor<Actor.Data, I>> {

    private readonly _craftingCheck: CraftingCheck;
    private readonly _essenceIdentityProvider: EssenceIdentityProvider;

    constructor(builder: Fabricator.Builder<I, A>) {
        this._craftingCheck = builder.craftingCheck;
        this._essenceIdentityProvider = EssenceIdentityProvider.for(builder.systemEssences);
    }

    get hasCraftingCheck(): boolean {
        return !!this._craftingCheck;
    }

    public followRecipe(actor: A, inventory: Inventory<I, A>, recipe: Recipe) {
        if (recipe.hasNamedComponents && !inventory.containsIngredients(recipe.namedComponents)) {
            return this.abort(`You don't have all of the ingredients for ${recipe.name}. `);
        }

        const remainingComponents: Inventory<I, A> = inventory.excluding(recipe.namedComponents);
        if (recipe.requiresEssences && remainingComponents.containsEssences(recipe.essences)) {
            return this.abort(`There aren't enough essences amongst components in your inventory to craft ${recipe.name}. `);
        }

        const essenceContribution: ComponentUnit[] = remainingComponents.selectFor(recipe.essences, this._essenceIdentityProvider);
        const preparedComponents = recipe.ingredients.concat(essenceContribution);

        if (!this.hasCraftingCheck) {
            return this.succeed(inventory, preparedComponents, recipe.results);
        }

        const performedCheck = this.craftingCheck.perform(actor, preparedComponents);
        switch (performedCheck.outcome) {
            case 'FAILURE':
                const wastedComponents = this.consumeComponentsOnFailure ? preparedComponents : [];
                return this.fail(inventory, wastedComponents, performedCheck);
            case 'SUCCESS':
                return this.succeed(inventory, preparedComponents, recipe.results, performedCheck);
        }

    }

    private abort(message: string) {
        return FabricationOutcome.builder
            .withOutcome('NOT_ATTEMPTED')
            .withActions([])
            .build();
    }

    private fail(inventory: Inventory<I, A>, wastedComponents: ComponentUnit[], craftingCheck: CraftingCheck) {
        const removals = FabricationAction.asRemovals(wastedComponents);
        await inventory.removeAll(removals);
        return FabricationOutcome.builder
            .withOutcome('FAILURE')
            .withActions(removals)
            .withCheckResult(craftingCheck)
            .build();
    }

    private succeed(inventory: Inventory<I, A>, consumedComponents: ComponentUnit[], addedComponents: ComponentUnit[], craftingCheck?: CraftingCheck) {
        const removals = FabricationAction.asRemovals(consumedComponents);
        await inventory.removeAll(removals);
        const additions = FabricationAction.asRemovals(addedComponents);
        await inventory.addAll(additions);
        return FabricationOutcome.builder
            .withOutcome('SUCCESS')
            .withActions(removals.concat(additions))
            .withCheckResult(craftingCheck)
            .build();
    }

}

namespace Fabricator {

    export class Builder<I extends Item, A extends Actor<Actor.Data, I>> {

        public craftingCheck: CraftingCheck;
        public systemEssences: EssenceDefinition[] = [];

        public build(): Fabricator<I, A> {
            return new Fabricator<I, A>(this)
        }

        public withCraftingCheck(value: CraftingCheck): Builder<I, A> {
            this.craftingCheck = value;
            return this;
        }

        public withSystemEssences(value: EssenceDefinition[]): Builder<I, A> {
            this.systemEssences = value;
            return this;
        }

    }

}

export {Fabricator}