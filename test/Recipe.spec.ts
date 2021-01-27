import { expect } from 'chai';
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingElement} from "../src/scripts/core/CraftingElement";
import {RecipeComponent} from "../src/scripts/core/RecipeComponent";
import {CraftingResult} from "../src/scripts/core/CraftingResult";

describe('Recipe |', () => {
    describe('Create |', () => {
        it('Should create a Recipe', () => {
            let testRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withItemId('4')
                .withComponent(RecipeComponent.builder()
                    .withIngredient(CraftingElement.builder()
                        .withName('Mud')
                        .withCompendiumEntry('compendium', '1')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withComponent(RecipeComponent.builder()
                    .withIngredient(CraftingElement.builder()
                        .withName('Sticks')
                        .withCompendiumEntry('compendium', '2')
                        .build())
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(CraftingResult.builder()
                    .withQuantity(1)
                    .withItem(CraftingElement.builder()
                        .withName('Mud Pie')
                        .withCompendiumEntry('compendium', '3')
                        .build())
                    .build())
                .build();

            expect(testRecipe.name).to.equal('Simple mud pie recipe');
            expect(testRecipe.components.length).to.equal(2);
            expect(testRecipe.itemId).to.equal('4');
            expect(testRecipe.components).to.deep.include.members([
                { _ingredient: { _name: 'Mud', _compendiumEntry: { _compendiumKey: 'compendium', _itemId: '1' } }, _quantity: 2, _consumed: true },
                { _ingredient: { _name: 'Sticks', _compendiumEntry: { _compendiumKey: 'compendium', _itemId: '2' } }, _quantity: 1, _consumed: true }
            ]);
        });
    });
});