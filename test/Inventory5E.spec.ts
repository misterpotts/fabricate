import {expect} from 'chai';
import * as Sinon from 'sinon';
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {GameSystemType} from "../src/scripts/core/GameSystemType";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingResult} from "../src/scripts/core/CraftingResult";

const testData = require('./resources/inventory-5e-actor-items-values.json');

const compendiumPackKey: string = 'fabricate.fabricate-test';
const wax: CraftingComponent = CraftingComponent.builder()
    .withName('Wax')
    .withCompendiumEntry('fabricate.fabricate-test', 'DPYl8D5QtcRVH5YX')
    .build();
const mud: CraftingComponent = CraftingComponent.builder()
    .withName('Mud')
    .withCompendiumEntry('fabricate.fabricate-test', 'tCmAnq9zcESt0ULf')
    .build();
const sticks: CraftingComponent = CraftingComponent.builder()
    .withName('Sticks')
    .withCompendiumEntry('fabricate.fabricate-test', 'arWeEYkLkubimBz3')
    .build();
const dung: CraftingComponent = CraftingComponent.builder()
    .withName('Dung')
    .withCompendiumEntry('fabricate.fabricate-test', 'Ra2Z1ujre76weR0i')
    .build();


beforeEach(() => {
    // @ts-ignore
    global.game = {
        packs: {
            get: Sinon.stub()
        }
    };
    const compendium = {
        getEntity: Sinon.stub()
    };
    // @ts-ignore
    game.packs.get.withArgs(compendiumPackKey).returns(compendium);
    compendium.getEntity.withArgs('DPYl8D5QtcRVH5YX').returns({});
    compendium.getEntity.withArgs('Ra2Z1ujre76weR0i').returns({});
});

describe('Inventory5E |', () => {

    const JUST_ONE: number = 1;
    const TWO: number = 2;
    const THREE: number = 3;
    const FOUR: number = 4;
    const TEN: number = 10;

    describe('Create |', () => {

        it('Should create an Inventory5E for an Actor5E', () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                }
            };
            const actorId = 'lxQTQkhiymhGyjzx';
            Sinon.stub(mockActor.items, 'values').returns(testData);
            Sinon.stub(mockActor, 'id').value(actorId);
            const underTest: Inventory5E = new Inventory5E(mockActor);
            expect(underTest.supportedGameSystems.length).to.equal(1);
            expect(underTest.supportedGameSystems).to.include.members([GameSystemType.DND5E]);
            expect(underTest.supportsGameSystem(GameSystemType.DND5E)).to.be.true;
            expect(underTest.actorId).to.equal(actorId);
            expect(underTest.size).to.equal(6);

        });

    });

    describe('Add Items |', () => {

        it('Should add an Item with quantity 1', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                createEmbeddedEntity: Sinon.stub()
            };
            Sinon.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.createEmbeddedEntity.returns({data: {quantity: 1}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const oneDung = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withComponentType(dung)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(6);
            const initialContains = underTest.contains(oneDung);
            expect(initialContains).to.be.false;
            await underTest.add(dung);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(7);
            const postAddOneContains = underTest.contains(oneDung);
            expect(postAddOneContains).to.be.true;
        });

        it('Should add an Item with quantity 2', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                createEmbeddedEntity: Sinon.stub()
            };
            Sinon.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.createEmbeddedEntity.returns({data: { quantity: 2}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const twoDung = Ingredient.builder()
                .withQuantity(TWO)
                .withComponentType(dung)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(6);
            await underTest.add(dung, TWO);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(7);
            expect(underTest.contains(twoDung)).to.be.true;

        });

        it('Should increase quantity for existing item', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                updateEmbeddedEntity: Sinon.stub()
            };
            Sinon.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.updateEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const twoMudIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withComponentType(mud)
                .build();
            const fourMudIngredient = Ingredient.builder()
                .withQuantity(FOUR)
                .withComponentType(mud)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(6);
            const doesNotHaveFourBeforehand = underTest.contains(fourMudIngredient);
            expect(doesNotHaveFourBeforehand).to.be.false;
            const hasTwoBeforehand = underTest.contains(twoMudIngredient);
            expect(hasTwoBeforehand).to.be.true;
            await underTest.add(mud, TWO);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(6);
            const hasFourAfterwards = underTest.contains(fourMudIngredient);
            expect(hasFourAfterwards).to.be.true;
        });

    });

    describe('Remove |', () => {

        it('Should remove an Item of quantity 1', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                deleteEmbeddedEntity: Sinon.stub()
            };
            Sinon.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.deleteEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const oneMudIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withComponentType(mud)
                .build();
            const twoMudIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withComponentType(mud)
                .build();

            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(6);

            const containsTwoBeforehand = underTest.contains(twoMudIngredient);
            expect(containsTwoBeforehand).to.be.true;

            await underTest.remove(mud);

            const postRemoveOneContents = underTest.contents;
            expect(postRemoveOneContents.length).to.equal(5);

            const containsTwoAfterwards = underTest.contains(twoMudIngredient);
            expect(containsTwoAfterwards).to.be.false;

            const containsOneAfterwards = underTest.contains(oneMudIngredient);
            expect(containsOneAfterwards).to.be.true;

        });

        it('Should decrement Item quantity', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                updateEmbeddedEntity: Sinon.stub()
            };
            Sinon.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.updateEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const oneStickIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withComponentType(sticks)
                .build();
            const twoSticksIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withComponentType(sticks)
                .build();

            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(6);

            const containsTwoBeforehand = underTest.contains(twoSticksIngredient);
            expect(containsTwoBeforehand).to.be.true;

            await underTest.remove(sticks);

            const postRemoveOneContents = underTest.contents;
            expect(postRemoveOneContents.length).to.equal(6);

            const containsTwoAfterwards = underTest.contains(twoSticksIngredient);
            expect(containsTwoAfterwards).to.be.false;

            const containsOneAfterwards = underTest.contains(oneStickIngredient);
            expect(containsOneAfterwards).to.be.true;

        });

        it('Should remove one Item and decrement quantity of another when total quantity exceeds that of most abundant item', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                updateEmbeddedEntity: Sinon.stub(),
                deleteEmbeddedEntity: Sinon.stub()
            };
            Sinon.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.updateEmbeddedEntity.returns({});
            // @ts-ignore
            mockActor.deleteEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const tenWaxIngredient = Ingredient.builder()
                .withQuantity(TEN)
                .withComponentType(wax)
                .build();
            const threeWaxIngredient = Ingredient.builder()
                .withQuantity(THREE)
                .withComponentType(wax)
                .build();

            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(6);

            const containsTenBeforehand = underTest.contains(tenWaxIngredient);
            expect(containsTenBeforehand).to.be.true;

            await underTest.remove(wax, 7);

            const postRemoveSevenContents = underTest.contents;
            expect(postRemoveSevenContents.length).to.equal(5);

            const containsThreeAfterwards = underTest.contains(threeWaxIngredient);
            expect(containsThreeAfterwards).to.be.true;

        });

    });

    describe('Recipes |', () => {

        it('Should determine that an Inventory contains insufficient Ingredients for a Recipe', () => {
            const mudPieRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withEntryId('4')
                .withIngredient(Ingredient.builder()
                    .withComponentType(CraftingComponent.builder()
                        .withName('Mud')
                        .withCompendiumEntry('compendium', '1')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withIngredient(Ingredient.builder()
                    .withComponentType(CraftingComponent.builder()
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

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                }
            };

            // @ts-ignore
            Sinon.stub(mockActor.items, 'values').returns([]);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const resultFromEmpty = underTest.hasAllIngredientsFor(mudPieRecipe);
            expect(resultFromEmpty).to.be.false;
        });

        it('Should determine that an Inventory contains all Ingredients for a Recipe', () => {
            const mudPieRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withEntryId('4')
                .withIngredient(Ingredient.builder()
                    .withComponentType(mud)
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withIngredient(Ingredient.builder()
                    .withComponentType(sticks)
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

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                }
            };

            Sinon.stub(mockActor.items, 'values').returns(testData);
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const resultWhenFull = underTest.hasAllIngredientsFor(mudPieRecipe);
            expect(resultWhenFull).to.be.true;
        });

    });

});