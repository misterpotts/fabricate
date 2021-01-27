import {expect} from 'chai';
import * as sinon from 'sinon';
import {DefaultFabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import TestSystem from "../src/scripts/systems/TestSystem";
import {CraftingElement} from "../src/scripts/core/CraftingElement";

describe('Default Fabricator |', () => {
    describe('Crafting |', () => {
        it('Should clear recipes and components', () => {
            let mudPieRecipe: Recipe = TestSystem.getFirstRecipeByName('Recipe: Mud Pie');
            let mud: CraftingElement = <CraftingElement><unknown>sinon.stub();
            let sticks: CraftingElement = <CraftingElement><unknown>sinon.stub();

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

        });

        it('Should not create a Mud Pie from Recipe without components', () => {

        });

        it('Should require a Recipe', () => {

        });
    });
});