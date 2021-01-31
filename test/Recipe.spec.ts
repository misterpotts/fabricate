import { expect } from 'chai';
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingResult} from "../src/scripts/core/CraftingResult";

describe('Recipe |', () => {
    describe('Create |', () => {
        it('Should create a Recipe', () => {
            let testRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withItemId('4')
                .withComponent(Ingredient.builder()
                    .withIngredient(CraftingComponent.builder()
                        .withName('Mud')
                        .withCompendiumEntry('compendium', '1')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withComponent(Ingredient.builder()
                    .withIngredient(CraftingComponent.builder()
                        .withName('Sticks')
                        .withCompendiumEntry('compendium', '2')
                        .build())
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(CraftingResult.builder()
                    .withQuantity(1)
                    .withItem(CraftingComponent.builder()
                        .withName('Mud Pie')
                        .withCompendiumEntry('compendium', '3')
                        .build())
                    .build())
                .build();

            expect(testRecipe.name).to.equal('Simple mud pie recipe');
            expect(testRecipe.components.length).to.equal(2);
            expect(testRecipe.itemId).to.equal('4');
            expect(testRecipe.components).to.deep.include.members([
                { _componentType: { _name: 'Mud', _compendiumEntry: { _compendiumKey: 'compendium', _entryId: '1' } }, _quantity: 2, _consumed: true },
                { _componentType: { _name: 'Sticks', _compendiumEntry: { _compendiumKey: 'compendium', _entryId: '2' } }, _quantity: 1, _consumed: true }
            ]);
        });
    });
});