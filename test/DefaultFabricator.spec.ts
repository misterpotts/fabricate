import {expect} from 'chai';

import {DefaultFabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {RecipeComponent} from "../src/scripts/core/RecipeComponent";
import {Action} from "../src/scripts/core/Action";

describe('Default Fabricator |', () => {

    describe('Crafting |', () => {

        const compendiumPackKey = 'fabricate.fabricate-test';
        const mud: CraftingComponent = CraftingComponent.builder()
            .withName('Mud')
            .withCompendiumEntry(compendiumPackKey, 'tCmAnq9zcESt0ULf')
            .build()
        const moreMud: CraftingComponent = CraftingComponent.builder()
            .withName('Mud')
            .withCompendiumEntry(compendiumPackKey, 'tCmAnq9zcESt0ULf')
            .build();
        const sticks: CraftingComponent = CraftingComponent.builder()
            .withName('Sticks')
            .withCompendiumEntry(compendiumPackKey, 'arWeEYkLkubimBz3')
            .build();
        const mudPieRecipe: Recipe = Recipe.builder()
            .withName('Recipe: Mud Pie')
            .withItemId('4iHqWSLTMFjPbpuI')
            .withComponent(RecipeComponent.builder()
                .isConsumed(true)
                .withQuantity(2)
                .withIngredient(mud)
                .build())
            .withComponent(RecipeComponent.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withIngredient(sticks)
                .build())
            .withResult(CraftingResult.builder()
                .withAction(Action.ADD)
                .withQuantity(1)
                .withItem(CraftingComponent.builder()
                    .withName('Mud Pie')
                    .withCompendiumEntry(compendiumPackKey, 'nWhTa8gD1QL1f9O3')
                    .build())
                .build())
            .build();

        it('Should clear recipes and components', () => {

            let underTest = new DefaultFabricator();
            underTest.prepare(mudPieRecipe, [mud, sticks]);
            expect(underTest.clear()).to.equal(true);
            expect(underTest.preparedCraftingElements).to.be.empty;
            expect(underTest.preparedRecipe).to.be.null;

            underTest = new DefaultFabricator();
            underTest.prepare(mudPieRecipe);
            expect(underTest.clear()).to.equal(true);
            expect(underTest.preparedCraftingElements).to.be.empty;
            expect(underTest.preparedRecipe).to.be.null;

            underTest = new DefaultFabricator();
            expect(underTest.clear()).to.equal(false);
            expect(underTest.preparedCraftingElements).to.be.empty;
            expect(underTest.preparedRecipe).to.be.null;

        });

        it('Should create a Mud Pie from Recipe and components', () => {

            let underTest = new DefaultFabricator();
            underTest.prepare(mudPieRecipe, [mud, moreMud, sticks]);
            let ready: boolean = underTest.ready();
            expect(ready).to.equal(true);
            let craftingResults: CraftingResult[] = underTest.fabricate();
            expect(craftingResults.length).to.equal(3);
            expect(craftingResults).to.deep.include({
                _quantity: 1,
                _action: 'ADD',
                _item: {
                    _name: 'Mud Pie',
                    _compendiumEntry: {
                        _compendiumKey: 'fabricate.fabricate-test',
                        _itemId: 'nWhTa8gD1QL1f9O3'
                    }
                }
            });
            expect(craftingResults).to.deep.include({
                _quantity: 2,
                _action: 'REMOVE',
                _item: {
                    _name: 'Mud',
                    _compendiumEntry: {
                        _compendiumKey: 'fabricate.fabricate-test',
                        _itemId: 'tCmAnq9zcESt0ULf'
                    }
                }
            });
            expect(craftingResults).to.deep.include({
                _quantity: 1,
                _action: 'REMOVE',
                _item: {
                    _name: 'Sticks',
                    _compendiumEntry: {
                        _compendiumKey: 'fabricate.fabricate-test',
                        _itemId: 'arWeEYkLkubimBz3'
                    }
                }
            });

        });

        it('Should not create a Mud Pie from Recipe without components', () => {

            let underTest = new DefaultFabricator();
            underTest.prepare(mudPieRecipe);
            let ready: boolean = underTest.ready();
            expect(ready).to.equal(false);
            expect(() => underTest.fabricate()).to.throw('Unable to craft Recipe: Mud Pie.');

        });

        it('Should require a Recipe', () => {

            let underTest = new DefaultFabricator();
            underTest.add(mud);
            underTest.add(moreMud);
            underTest.add(sticks);
            let ready: boolean = underTest.ready();
            expect(ready).to.equal(false);
            expect(() => underTest.fabricate()).to.throw('The Default Fabricator requires a recipe and one was not prepared.');

        });
    });
});