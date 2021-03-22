import {AbstractInventory, Inventory} from './Inventory';
import {Recipe} from "./Recipe";
import {Ingredient} from "./CraftingComponent";
import {CraftingCheck} from "./CraftingCheck";

class FabricationOutcome {

}

class Fabricator<I extends Item, A extends Actor<Actor.Data, I>> {

    private readonly _craftingCheck: CraftingCheck;

    constructor(builder: Fabricator.Builder<I, A>) {
        this._craftingCheck = builder.craftingCheck;
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

        const essenceContribution: Ingredient[] = remainingComponents.selectFor(recipe.essences);
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

    private fail(inventory: Inventory<I, A>, wastedComponents: Ingredient[], craftingCheck: CraftingCheck) {
        const removals = FabricationAction.asRemovals(wastedComponents);
        await inventory.removeAll(removals);
        return FabricationOutcome.builder
            .withOutcome('FAILURE')
            .withActions(removals)
            .withCheckResult(craftingCheck)
            .build();
    }

    private succeed(inventory: Inventory<I, A>, consumedComponents: Ingredient[], addedComponents: Ingredient[], craftingCheck?: CraftingCheck) {
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

export {Fabricator}