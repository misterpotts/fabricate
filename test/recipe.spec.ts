import { expect } from 'chai';
import {Recipe} from "../src/scripts/core/Recipe";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {RecipeComponent} from "../src/scripts/core/RecipeComponent";

describe('Recipe |', () => {
    describe('Create |', () => {
        it('Should create a Recipe', () => {
            let testRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withComponent(RecipeComponent.builder()
                    .forIngredient(Ingredient.builder()
                        .withName('Mud')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withComponent(RecipeComponent.builder()
                    .forIngredient(Ingredient.builder()
                        .withName('Sticks')
                        .build())
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(null) // Don't know how to deal with Foundry Item types yet!
                .build();

            expect(testRecipe.name).to.equal('Simple mud pie recipe');
            expect(testRecipe.components.length).to.equal(2);
            expect(testRecipe.components).to.deep.include.members([
                { _ingredient: { _name: 'Mud' }, _quantity: 2, _consumed: true },
                { _ingredient: { _name: 'Sticks' }, _quantity: 1, _consumed: true }
                ]);

        });
    });
});