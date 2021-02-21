import {expect} from 'chai';

import {DefaultFabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {ActionType} from "../src/scripts/core/ActionType";

describe('Default Fabricator |', () => {

    describe('Crafting |', () => {

        const compendiumPackKey = 'fabricate.fabricate-test';
        const mud: CraftingComponent = CraftingComponent.builder()
            .withName('Mud')
            .withCompendiumEntry(compendiumPackKey, 'tCmAnq9zcESt0ULf')
            .build()
        const sticks: CraftingComponent = CraftingComponent.builder()
            .withName('Sticks')
            .withCompendiumEntry(compendiumPackKey, 'arWeEYkLkubimBz3')
            .build();
        const mudPie = CraftingComponent.builder()
            .withName('Mud Pie')
            .withCompendiumEntry(compendiumPackKey, 'nWhTa8gD1QL1f9O3')
            .build();
        const mudPieRecipe: Recipe = Recipe.builder()
            .withName('Recipe: Mud Pie')
            .withEntryId('4iHqWSLTMFjPbpuI')
            .withIngredient(Ingredient.builder()
                .isConsumed(true)
                .withQuantity(2)
                .withComponent(mud)
                .build())
            .withIngredient(Ingredient.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withComponent(sticks)
                .build())
            .withResult(CraftingResult.builder()
                .withAction(ActionType.ADD)
                .withQuantity(1)
                .withItem(mudPie)
                .build())
            .build();


        it('Should create a Mud Pie from Recipe and components', () => {

            let underTest = new DefaultFabricator();
            let craftingResults: CraftingResult[] = underTest.fabricateFromRecipe(mudPieRecipe);
            expect(craftingResults.length).to.equal(3);
            expect(craftingResults).to.deep.include.members([
                CraftingResult.builder()
                    .withAction(ActionType.ADD)
                    .withQuantity(1)
                    .withItem(mudPie)
                    .build(),
                CraftingResult.builder()
                    .withAction(ActionType.REMOVE)
                    .withQuantity(2)
                    .withItem(mud)
                    .build(),
                CraftingResult.builder()
                    .withAction(ActionType.REMOVE)
                    .withQuantity(1)
                    .withItem(sticks)
                    .build()
            ]);
        });

        it('Should require a Recipe', () => {

            let underTest = new DefaultFabricator();
            expect(() => underTest.fabricateFromComponents()).to.throw('The Default Fabricator requires a Recipe and one was not provided.');

        });
    });
});