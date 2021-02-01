import {expect} from 'chai';
import * as Sinon from 'sinon';
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {GameSystemType} from "../src/scripts/core/GameSystemType";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {InventoryRecord} from "../src/scripts/core/InventoryRecord";

const addScenariosTestData = require('./resources/actor5e-inventory-add-scenario-data.json');
const removeScenariosTestData = require('./resources/actor5e-inventory-remove-scenario-data.json');

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
                data: {
                    items: []
                }
            };
            const actorId = 'lxQTQkhiymhGyjzx';
            Sinon.stub(mockActor.data, 'items').value(addScenariosTestData);
            Sinon.stub(mockActor, 'id').value(actorId);
            const underTest: Inventory5E = new Inventory5E(mockActor);
            expect(underTest.supportedGameSystems.length).to.equal(1);
            expect(underTest.supportedGameSystems).to.include.members([GameSystemType.DND5E]);
            expect(underTest.supportsGameSystem(GameSystemType.DND5E)).to.be.true;
            expect(underTest.actorId).to.equal(actorId);
            expect(underTest.size).to.equal(3);

        });

    });

    describe('Add Items |', () => {

        it('Should add an Item with quantity 1', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                data: {
                    items: []
                },
                createOwnedItem: Sinon.stub()
            };
            Sinon.stub(mockActor.data, 'items').value(addScenariosTestData);
            // @ts-ignore
            mockActor.createOwnedItem.returns({data: {quantity: 1}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const expectedIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withIngredient(wax)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(3);
            const initialContains = underTest.contains(expectedIngredient);
            expect(initialContains).to.be.false;
            await underTest.add(wax, JUST_ONE);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(4);
            const postAddOneContains = underTest.contains(expectedIngredient);
            expect(postAddOneContains).to.be.true;
        });

        it('Should add an Item with quantity 2', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                data: {
                    items: []
                },
                createOwnedItem: Sinon.stub()
            };
            Sinon.stub(mockActor.data, 'items').value(addScenariosTestData);
            // @ts-ignore
            mockActor.createOwnedItem.returns({data: { quantity: 2}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const twoWax = Ingredient.builder()
                .withQuantity(TWO)
                .withIngredient(wax)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(3);
            await underTest.add(wax, TWO);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(4);
            expect(underTest.contains(twoWax)).to.be.true;

        });

        it('Should increase quantity for existing item', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                data: {
                    items: []
                }
            };
            Sinon.stub(mockActor.data, 'items').value(addScenariosTestData);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const twoMudIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withIngredient(mud)
                .build();
            const fourMudIngredient = Ingredient.builder()
                .withQuantity(FOUR)
                .withIngredient(mud)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(3);
            initialContents.forEach((record: InventoryRecord) => {
                if (record.componentType.compendiumEntry.equals(mud.compendiumEntry)) {
                    record.item.update = Sinon.stub();
                    // @ts-ignore
                    record.item.update.returns({});
                }
            });
            const doesNotHaveFourBeforehand = underTest.contains(fourMudIngredient);
            expect(doesNotHaveFourBeforehand).to.be.false;
            const hasTwoBeforehand = underTest.contains(twoMudIngredient);
            expect(hasTwoBeforehand).to.be.true;
            await underTest.add(mud, TWO);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(3);
            const hasFourAfterwards = underTest.contains(fourMudIngredient);
            expect(hasFourAfterwards).to.be.true;
        });

    });

    describe('Remove Items', () => {

        it('Should remove an Item of quantity 1', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                data: {
                    items: []
                }
            };
            Sinon.stub(mockActor.data, 'items').value(removeScenariosTestData);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const oneMudIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withIngredient(mud)
                .build();
            const twoMudIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withIngredient(mud)
                .build();

            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(5);

            initialContents.forEach((record: InventoryRecord) => {
                if (record.componentType.compendiumEntry.equals(mud.compendiumEntry)) {
                    record.item.delete = Sinon.stub();
                    // @ts-ignore
                    record.item.delete.returns({});
                }
            });

            const containsTwoBeforehand = underTest.contains(twoMudIngredient);
            expect(containsTwoBeforehand).to.be.true;

            await underTest.remove(mud);

            const postRemoveOneContents = underTest.contents;
            expect(postRemoveOneContents.length).to.equal(4);

            const containsTwoAfterwards = underTest.contains(twoMudIngredient);
            expect(containsTwoAfterwards).to.be.false;

            const containsOneAfterwards = underTest.contains(oneMudIngredient);
            expect(containsOneAfterwards).to.be.true;

        });

        it('Should decrement Item quantity', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                data: {
                    items: []
                }
            };
            Sinon.stub(mockActor.data, 'items').value(removeScenariosTestData);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const oneStickIngredient = Ingredient.builder()
                .withQuantity(JUST_ONE)
                .withIngredient(sticks)
                .build();
            const twoSticksIngredient = Ingredient.builder()
                .withQuantity(TWO)
                .withIngredient(sticks)
                .build();

            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(5);

            const containsTwoBeforehand = underTest.contains(twoSticksIngredient);
            expect(containsTwoBeforehand).to.be.true;

            initialContents.forEach((record: InventoryRecord) => {
                if (record.componentType.compendiumEntry.equals(sticks.compendiumEntry)) {
                    record.item.update = Sinon.stub();
                    // @ts-ignore
                    record.item.update.returns({});
                }
            });

            await underTest.remove(sticks);

            const postRemoveOneContents = underTest.contents;
            expect(postRemoveOneContents.length).to.equal(5);

            const containsTwoAfterwards = underTest.contains(twoSticksIngredient);
            expect(containsTwoAfterwards).to.be.false;

            const containsOneAfterwards = underTest.contains(oneStickIngredient);
            expect(containsOneAfterwards).to.be.true;

        });

        it('Should remove one Item and decrement quantity of another when total quantity exceeds that of most abundant item', async () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                data: {
                    items: []
                }
            };
            Sinon.stub(mockActor.data, 'items').value(removeScenariosTestData);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const tenWaxIngredient = Ingredient.builder()
                .withQuantity(TEN)
                .withIngredient(wax)
                .build();
            const threeWaxIngredient = Ingredient.builder()
                .withQuantity(THREE)
                .withIngredient(wax)
                .build();

            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(5);

            const containsTenBeforehand = underTest.contains(tenWaxIngredient);
            expect(containsTenBeforehand).to.be.true;

            initialContents.forEach((record: InventoryRecord) => {
                if (record.componentType.compendiumEntry.equals(wax.compendiumEntry)) {
                    record.item.update = Sinon.stub();
                    // @ts-ignore
                    record.item.update.returns({});
                    record.item.delete = Sinon.stub();
                    // @ts-ignore
                    record.item.delete.returns({});
                }
            });

            await underTest.remove(wax, 7);

            const postRemoveSevenContents = underTest.contents;
            expect(postRemoveSevenContents.length).to.equal(4);

            const containsThreeAfterwards = underTest.contains(threeWaxIngredient);
            expect(containsThreeAfterwards).to.be.true;

        });

    });

});