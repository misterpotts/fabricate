import {expect} from 'chai';

import {DefaultFabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import TestSystem from "../src/scripts/systems/TestSystem";
import {CraftingElement} from "../src/scripts/core/CraftingElement";
import {CraftingResult} from "../src/scripts/core/CraftingResult";

describe('Default Fabricator |', () => {

    describe('Crafting |', () => {

        const mudPieRecipe: Recipe = TestSystem.getFirstRecipeByName('Recipe: Mud Pie');
        const mud: CraftingElement = CraftingElement.builder()
            .withName('Mud')
            .withCompendiumEntry(TestSystem.compendiumPackKey, 'tCmAnq9zcESt0ULf')
            .build()
        const moreMud: CraftingElement = CraftingElement.builder()
            .withName('Mud')
            .withCompendiumEntry(TestSystem.compendiumPackKey, 'tCmAnq9zcESt0ULf')
            .build();
        const sticks: CraftingElement = CraftingElement.builder()
            .withName('Sticks')
            .withCompendiumEntry(TestSystem.compendiumPackKey, 'arWeEYkLkubimBz3')
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