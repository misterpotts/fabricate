import {AbstractInventory} from './Inventory';
import {Recipe} from "./Recipe";

class Fabricator<I extends Item, A extends Actor<Actor.Data, I>> {

    public fabricateRecipe(actor: A, inventory: AbstractInventory<I, A>, recipe: Recipe) {
        if (recipe.requiresCatalysts && !inventory.containsIngredients(recipe.catalysts)) {
            return this.abort();
        }

        if (recipe.hasSpecificIngredients && !inventory.containsIngredients(recipe.ingredients)) {
            return this.abort();
        }

        const namedComponents = recipe.ingredients.concat(recipe.catalysts);
        if (recipe.requiresEssences && inventory.excluding(namedComponents).containsEssences(recipe.essences)) {
            return this.abort();
        }

        const essenceContribution = inventory.excluding(namedComponents).selectFor(recipe.essences);
        const preparedComponents = recipe.ingredients.concat(essenceContribution);

        if (this.hasCraftingCheck) {
            const performedCheck = this.craftingCheck.perform(actor, preparedComponents);
            switch (performedCheck.outcome) {
                case 'FAILURE':
                    const wastedComponents = this.consumeComponentsOnFailure ? preparedComponents : [];
                    return this.fail(wastedComponents, performedCheck);
                case 'SUCCESS':
                    return this.succeed(preparedComponents, recipe.results, performedCheck);
            }
        }

        return this.succeed(preparedComponents, recipe.results);
    }

    private abort() {
        return FabricationOutcome.builder
            .withOutcome('NOT_ATTEMPTED')
            .withActions([])
            .build();
    }

    private fail(inventory, wastedComponents, craftingCheck) {
        const removals = FabricationAction.asRemovals(wastedComponents);
        await inventory.removeAll(removals);
        return FabricationOutcome.builder
            .withOutcome('FAILURE')
            .withActions(removals)
            .withCheckResult(craftingCheck)
            .build();
    }

    private succeed(inventory, consumedComponents, addedComponents, craftingCheck) {
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