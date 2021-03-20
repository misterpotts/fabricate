import {expect} from 'chai';
import * as Sinon from 'sinon';
import {SinonSandbox} from "sinon";

import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {GameSystemType} from "../src/scripts/core/GameSystemType";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {Recipe} from "../src/scripts/core/Recipe";
import {FabricationAction} from "../src/scripts/core/FabricationAction";
import {FabricateCompendiumData} from "../src/scripts/game/CompendiumData";
import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import Properties from "../src/scripts/Properties";
import FabricateApplication from "../src/scripts/application/FabricateApplication";

const Sandbox: SinonSandbox = Sinon.createSandbox();

const rawTestData = require('./resources/inventory-5e-actor-items-values.json');
const testData = rawTestData.map((item: any) => {
    item.getFlag = Sandbox.stub();
    if (item.data.flags.fabricate) {
        const flags: FabricateCompendiumData = item.data.flags.fabricate;
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.identity).returns(flags.identity);
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.partId).returns(flags.identity.partId);
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.systemId).returns(flags.identity.systemId);
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.fabricateItemType).returns(flags.type);
    } else {
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.identity).returns(undefined);
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.partId).returns(undefined);
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.systemId).returns(undefined);
        item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.fabricateItemType).returns(undefined);
    }
    return item;
});

const compendiumPackKey: string = 'fabricate.fabricate-test';

const wax: CraftingComponent = CraftingComponent.builder()
    .withName('Wax')
    .withSystemId(compendiumPackKey)
    .withPartId('DPYl8D5QtcRVH5YX')
    .build();
const mud: CraftingComponent = CraftingComponent.builder()
    .withName('Mud')
    .withSystemId(compendiumPackKey)
    .withPartId('tCmAnq9zcESt0ULf')
    .build();
const sticks: CraftingComponent = CraftingComponent.builder()
    .withName('Sticks')
    .withSystemId(compendiumPackKey)
    .withPartId('arWeEYkLkubimBz3')
    .build();
const dung: CraftingComponent = CraftingComponent.builder()
    .withName('Dung')
    .withSystemId(compendiumPackKey)
    .withPartId('Ra2Z1ujre76weR0i')
    .build();
const mudPie: CraftingComponent = CraftingComponent.builder()
    .withName('Mud Pie')
    .withSystemId(compendiumPackKey)
    .withPartId('4iHqWSLTMFjPbpuI')
    .build();
const mudPieRecipe: Recipe = Recipe.builder()
    .withName('Recipe: Mud Pie')
    .withSystemId(compendiumPackKey)
    .withPartId('z9y2U9ZfCEBN0rW6')
    .build();

before(() => {

    Sandbox.restore();

    const dummyCraftingSystem: CraftingSystem = <CraftingSystem><unknown>{
        compendiumPackKey: compendiumPackKey,
        recipes: [mudPieRecipe],
        components: [wax, mud, sticks, dung, mudPie],
        getComponentByPartId: Sandbox.stub(),
        getRecipeByPartId: Sandbox.stub(),
    };
    // @ts-ignore
    dummyCraftingSystem.getComponentByPartId.withArgs('tCmAnq9zcESt0ULf').returns(mud);
    // @ts-ignore
    dummyCraftingSystem.getComponentByPartId.withArgs('arWeEYkLkubimBz3').returns(sticks);
    // @ts-ignore
    dummyCraftingSystem.getComponentByPartId.withArgs('4iHqWSLTMFjPbpuI').returns(mudPie);
    // @ts-ignore
    dummyCraftingSystem.getComponentByPartId.withArgs('DPYl8D5QtcRVH5YX').returns(wax);
    // @ts-ignore
    dummyCraftingSystem.getRecipeByPartId.withArgs('z9y2U9ZfCEBN0rW6').returns(mudPieRecipe);

    FabricateApplication.systems.register(dummyCraftingSystem);

});



beforeEach(() => {

    // @ts-ignore
    global.game = <Game>{
        packs: {
            get: Sandbox.stub()
        }
    };
    const compendium = {
        getEntity: Sandbox.stub()
    };
    // @ts-ignore
    game.packs.get.withArgs(compendiumPackKey).returns(compendium);
    compendium.getEntity.withArgs('DPYl8D5QtcRVH5YX').returns({data:{data:{}}});
    compendium.getEntity.withArgs('Ra2Z1ujre76weR0i').returns({data:{data:{}}});

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
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            Sandbox.stub(mockActor, 'id').value(actorId);

            const underTest: Inventory5E = new Inventory5E(mockActor);

            expect(underTest.supportedGameSystems.length).to.equal(1);
            expect(underTest.supportedGameSystems).to.include.members([GameSystemType.DND5E]);
            expect(underTest.supportsGameSystem(GameSystemType.DND5E)).to.be.true;
            expect(underTest.actorId).to.equal(actorId);
            expect(underTest.size).to.equal(5);
            expect(underTest.components.length).to.equal(4);
            expect(underTest.recipes.length).to.equal(1);

            expect(underTest.componentCount).to.equal(15);

        });

    });

    describe('Add Items |', () => {

        it('Should add an Item with quantity 1', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                createEmbeddedEntity: Sandbox.stub(),
                getOwnedItem: Sandbox.stub()
            };
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.getOwnedItem.returns({data:{data:{quantity:1}}});
            // @ts-ignore
            mockActor.createEmbeddedEntity.returns({data:{quantity:1}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const oneDung = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withComponent(dung)
                .build();

            const initialContents = underTest.components;
            expect(initialContents.length).to.equal(4);

            const initialComponentCount = underTest.componentCount;
            expect(initialComponentCount).to.equal(15);

            const initialContains = underTest.containsIngredient(oneDung);
            expect(initialContains).to.be.false;

            await underTest.add(dung);

            const postAddOneContents = underTest.components;
            expect(postAddOneContents.length).to.equal(5);

            const postAddOneComponentCount = underTest.componentCount;
            expect(postAddOneComponentCount).to.equal(16);

            const postAddOneContains = underTest.containsIngredient(oneDung);
            expect(postAddOneContains).to.be.true;

        });

        it('Should add an Item with quantity 2', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                createEmbeddedEntity: Sandbox.stub(),
                getOwnedItem: Sandbox.stub()
            };
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.createEmbeddedEntity.returns({data:{quantity:2}});
            // @ts-ignore
            mockActor.getOwnedItem.returns({data:{data:{quantity:2}}});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const twoDung = Ingredient.builder()
                .withQuantity(TWO)
                .withComponent(dung)
                .build();

            const initialContents = underTest.components;
            expect(initialContents.length).to.equal(4);

            const initialComponentCount = underTest.componentCount;
            expect(initialComponentCount).to.equal(15);

            await underTest.add(dung, TWO);

            const postAddOneContents = underTest.components;
            expect(postAddOneContents.length).to.equal(5);

            const postAddOneComponentCount = underTest.componentCount;
            expect(postAddOneComponentCount).to.equal(17);

            expect(underTest.containsIngredient(twoDung)).to.be.true;

        });

        it('Should increase quantity for existing item', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                updateEmbeddedEntity: Sandbox.stub()
            };
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.updateEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const twoMudIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withComponent(mud)
                .build();
            const fourMudIngredient = Ingredient.builder()
                .withQuantity(FOUR)
                .withComponent(mud)
                .build();

            const initialContents = underTest.components;
            expect(initialContents.length).to.equal(4);

            const initialComponentCount = underTest.componentCount;
            expect(initialComponentCount).to.equal(15);

            const doesNotHaveFourBeforehand = underTest.containsIngredient(fourMudIngredient);
            expect(doesNotHaveFourBeforehand).to.be.false;

            const hasTwoBeforehand = underTest.containsIngredient(twoMudIngredient);
            expect(hasTwoBeforehand).to.be.true;

            await underTest.add(mud, TWO);

            const postAddOneContents = underTest.components;
            expect(postAddOneContents.length).to.equal(4);

            const postAddOneComponentCount = underTest.componentCount;
            expect(postAddOneComponentCount).to.equal(17);

            const hasFourAfterwards = underTest.containsIngredient(fourMudIngredient);
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
                deleteEmbeddedEntity: Sandbox.stub()
            };
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.deleteEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const oneMudIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withComponent(mud)
                .build();
            const twoMudIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withComponent(mud)
                .build();

            const initialContents = underTest.components;
            expect(initialContents.length).to.equal(4);

            const initialComponentCount = underTest.componentCount;
            expect(initialComponentCount).to.equal(15);

            const containsTwoBeforehand = underTest.containsIngredient(twoMudIngredient);
            expect(containsTwoBeforehand).to.be.true;

            await underTest.remove(mud);

            const postRemoveOneContents = underTest.components;
            expect(postRemoveOneContents.length).to.equal(4);

            const postRemoveOneComponentCount = underTest.componentCount;
            expect(postRemoveOneComponentCount).to.equal(14);

            const containsTwoAfterwards = underTest.containsIngredient(twoMudIngredient);
            expect(containsTwoAfterwards).to.be.false;

            const containsOneAfterwards = underTest.containsIngredient(oneMudIngredient);
            expect(containsOneAfterwards).to.be.true;

        });

        it('Should decrement Item quantity', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                updateEmbeddedEntity: Sandbox.stub()
            };
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.updateEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const oneStickIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withComponent(sticks)
                .build();
            const twoSticksIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withComponent(sticks)
                .build();

            const initialContents = underTest.components;
            expect(initialContents.length).to.equal(4);

            const initialComponentCount = underTest.componentCount;
            expect(initialComponentCount).to.equal(15);

            const containsTwoBeforehand = underTest.containsIngredient(twoSticksIngredient);
            expect(containsTwoBeforehand).to.be.true;

            await underTest.remove(sticks);

            const postRemoveOneContents = underTest.components;
            expect(postRemoveOneContents.length).to.equal(4);

            const postRemoveOneComponentCount = underTest.componentCount;
            expect(postRemoveOneComponentCount).to.equal(14);

            const containsTwoAfterwards = underTest.containsIngredient(twoSticksIngredient);
            expect(containsTwoAfterwards).to.be.false;

            const containsOneAfterwards = underTest.containsIngredient(oneStickIngredient);
            expect(containsOneAfterwards).to.be.true;

        });

        it('Should remove one Item and decrement quantity of another when total quantity exceeds that of most abundant item', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                },
                updateEmbeddedEntity: Sandbox.stub(),
                deleteEmbeddedEntity: Sandbox.stub()
            };
            Sandbox.stub(mockActor.items, 'values').returns(testData);
            // @ts-ignore
            mockActor.updateEmbeddedEntity.returns({});
            // @ts-ignore
            mockActor.deleteEmbeddedEntity.returns({});
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const tenWaxIngredient = Ingredient.builder()
                .withQuantity(TEN)
                .withComponent(wax)
                .build();
            const threeWaxIngredient = Ingredient.builder()
                .withQuantity(THREE)
                .withComponent(wax)
                .build();

            const initialContents = underTest.components;
            expect(initialContents.length).to.equal(4);

            const initialComponentCount = underTest.componentCount;
            expect(initialComponentCount).to.equal(15);

            const containsTenBeforehand = underTest.containsIngredient(tenWaxIngredient);
            expect(containsTenBeforehand).to.be.true;

            await underTest.remove(wax, 7);

            const postRemoveSevenContents = underTest.components;
            expect(postRemoveSevenContents.length).to.equal(4);

            const postRemoveSevenComponentCount = underTest.componentCount;
            expect(postRemoveSevenComponentCount).to.equal(8);

            const containsThreeAfterwards = underTest.containsIngredient(threeWaxIngredient);
            expect(containsThreeAfterwards).to.be.true;

        });

    });

    describe('Recipes |', () => {

        it('Should determine that an Inventory contains insufficient Ingredients for a Recipe', () => {
            const mudPieRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withPartId('4')
                .withIngredient(Ingredient.builder()
                    .withComponent(CraftingComponent.builder()
                        .withName('Mud')
                        .withPartId('1')
                        .withSystemId('compendium')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withIngredient(Ingredient.builder()
                    .withComponent(CraftingComponent.builder()
                        .withName('Sticks')
                        .withPartId('2')
                        .withSystemId('compendium')
                        .build())
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(FabricationAction.builder()
                    .withQuantity(1)
                    .withItemType(CraftingComponent.builder()
                        .withName('Mud Pie')
                        .withPartId('3')
                        .withSystemId('compendium')
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
            Sandbox.stub(mockActor.items, 'values').returns([]);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const resultFromEmpty = underTest.hasAllIngredientsFor(mudPieRecipe);
            expect(resultFromEmpty).to.be.false;
        });

        it('Should determine that an Inventory contains all Ingredients for a Recipe', () => {
            const mudPieRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withPartId('4')
                .withIngredient(Ingredient.builder()
                    .withComponent(mud)
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withIngredient(Ingredient.builder()
                    .withComponent(sticks)
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(FabricationAction.builder()
                    .withQuantity(1)
                    .withItemType(CraftingComponent.builder()
                        .withName('Mud Pie')
                        .withPartId('3')
                        .withSystemId('compendium')
                        .build())
                    .build())
                .build();

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: {
                    values: () => {}
                }
            };

            Sandbox.stub(mockActor.items, 'values').returns(testData);
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const resultWhenFull = underTest.hasAllIngredientsFor(mudPieRecipe);
            expect(resultWhenFull).to.be.true;
        });

    });

});