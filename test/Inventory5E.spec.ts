import {expect} from 'chai';
import * as Sinon from 'sinon';
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {GameSystemType} from "../src/scripts/core/GameSystemType";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {InventoryRecord} from "../src/scripts/core/InventoryRecord";

const testData = require('./resources/actor5e-inventory-proprty-value.json');
const compendiumPackKey: string = 'fabricate.fabricate-test';
const wax: CraftingComponent = CraftingComponent.builder()
    .withName('Wax')
    .withCompendiumEntry('fabricate.fabricate-test', 'DPYl8D5QtcRVH5YX')
    .build();
const mud: CraftingComponent = CraftingComponent.builder()
    .withName('Mud')
    .withCompendiumEntry('fabricate.fabricate-test', 'tCmAnq9zcESt0ULf')
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

    describe('Create |', () => {

        it('Should create an Inventory5E for an Actor5E', () => {

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: []
            };
            const actorId = 'lxQTQkhiymhGyjzx';
            Sinon.stub(mockActor, 'items').value(testData);
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

        const justOne: number = 1;
        const two: number = 2;
        const four: number = 2;

        it('Should add an Item with quantity 1', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: [],
                createOwnedItem: Sinon.stub()
            };
            Sinon.stub(mockActor, 'items').value(testData);
            // @ts-ignore
            mockActor.createOwnedItem.returns({data: {quantity: 1}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const expectedIngredient = Ingredient.builder()
                .withQuantity(justOne)
                .withIngredient(wax)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(3);
            const initialContains = underTest.contains(expectedIngredient);
            expect(initialContains).to.be.false;
            await underTest.add(wax, justOne);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(4);
            const postAddOneContains = underTest.contains(expectedIngredient);
            expect(postAddOneContains).to.be.true;
        });

        it('Should add an Item with quantity 2', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: [],
                createOwnedItem: Sinon.stub()
            };
            Sinon.stub(mockActor, 'items').value(testData);
            // @ts-ignore
            mockActor.createOwnedItem.returns({data: { quantity: 2}});
            const underTest: Inventory5E = new Inventory5E(mockActor);
            const twoWax = Ingredient.builder()
                .withQuantity(two)
                .withIngredient(wax)
                .build();
            const initialContents = underTest.contents;
            expect(initialContents.length).to.equal(3);
            await underTest.add(wax, two);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(4);
            expect(underTest.contains(twoWax)).to.be.true;

        });

        it('Should increase quantity for existing item', async () => {
            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx',
                items: []
            };
            Sinon.stub(mockActor, 'items').value(testData);
            const underTest: Inventory5E = new Inventory5E(mockActor);

            const twoMud = Ingredient.builder()
                .withQuantity(two)
                .withIngredient(mud)
                .build();
            const fourMud = Ingredient.builder()
                .withQuantity(four)
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
            const hasTwoBeforehand = underTest.contains(twoMud);
            expect(hasTwoBeforehand).to.be.true;
            await underTest.add(mud, two);
            const postAddOneContents = underTest.contents;
            expect(postAddOneContents.length).to.equal(3);
            const hasFourAfterwards = underTest.contains(fourMud);
            expect(hasFourAfterwards).to.be.true;
        });

    });

    describe('Remove Items', () => {

        it('Should remove an Item', () => {});

    });
    describe('Update Items', () => {

        it('Should update and Item\'s quantity', () => {});

    });

});