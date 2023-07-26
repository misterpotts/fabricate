import {describe, expect, test} from '@jest/globals';
import {CraftingInventory} from "../src/scripts/actor/Inventory";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {
    AlwaysOneItemQuantityReader,
    DnD5EItemQuantityReader,
    DnD5EItemQuantityWriter, NoItemQuantityWriter
} from "../src/scripts/actor/ItemQuantity";
import {StubObjectUtility} from "./stubs/StubObjectUtility";
import {
    testComponentFive,
    testComponentFour,
    testComponentOne,
    testComponentSeven,
    testComponentSix,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {StubActorFactory} from "./stubs/StubActorFactory";
import {Combination} from "../src/scripts/common/Combination";
import {Component} from "../src/scripts/crafting/component/Component";
import {StubItem} from "./stubs/StubItem";
import {SuccessfulSalvageResult} from "../src/scripts/crafting/result/SalvageResult";
import {Unit} from "../src/scripts/common/Unit";
import {StubGameProvider} from "./stubs/foundry/StubGameProvider";

describe("Crafting Inventory", () => {

    const knownComponentsByItemUuid = new Map([
        [testComponentOne.itemUuid, testComponentOne],
        [testComponentTwo.itemUuid, testComponentTwo],
        [testComponentThree.itemUuid, testComponentThree],
        [testComponentFour.itemUuid, testComponentFour],
        [testComponentFive.itemUuid, testComponentFive],
        [testComponentSix.itemUuid, testComponentSix],
        [testComponentSeven.itemUuid, testComponentSeven]
    ]);
    const fabricateItemDataByUuid = new Map(Array.from(knownComponentsByItemUuid.values())
        .map(component => [component.itemUuid, component.itemData]));
    const documentManager = new StubDocumentManager({
        itemDataByUuid: fabricateItemDataByUuid
    });

    describe("indexing", () => {

        test.skip("should index actor's inventory with no fabricate items", async () => {

            const ownedItems = generateInventory(Combination.EMPTY(), 40);
            const actorFactory = new StubActorFactory({ownedItems});
            const actor = actorFactory.make();

            const underTest = new CraftingInventory({
                actor,
                documentManager,
                itemQuantityWriter: new DnD5EItemQuantityWriter(),
                itemQuantityReader: new DnD5EItemQuantityReader(),
                gameProvider: new StubGameProvider(),
                objectUtils: new StubObjectUtility(),
                knownComponentsByItemUuid
            });

            await underTest.index();

            expect(underTest.size).toEqual(0);
            expect(underTest.amountFor(testComponentOne)).toEqual(0);
            expect(underTest.amountFor(testComponentTwo)).toEqual(0);
            expect(underTest.amountFor(testComponentThree)).toEqual(0);
            expect(underTest.amountFor(testComponentFour)).toEqual(0);
            expect(underTest.amountFor(testComponentFive)).toEqual(0);
            expect(underTest.amountFor(testComponentSix)).toEqual(0);
            expect(underTest.amountFor(testComponentSeven)).toEqual(0);

        });

        test.skip("should index actor's inventory with some fabricate items", async () => {

            const componentOneQuantity = 7;
            const componentFiveQuantity = 4;
            const componentSevenQuantity = 1;
            const ownedItems = generateInventory(Combination.ofUnits([
                new Unit<Component>(testComponentOne, componentOneQuantity),
                new Unit<Component>(testComponentFive, componentFiveQuantity),
                new Unit<Component>(testComponentSeven, componentSevenQuantity)
            ]), 34);
            const actorFactory = new StubActorFactory({ownedItems});
            const actor = actorFactory.make();

            const underTest = new CraftingInventory({
                actor,
                documentManager,
                itemQuantityWriter: new DnD5EItemQuantityWriter(),
                itemQuantityReader: new DnD5EItemQuantityReader(),
                gameProvider: new StubGameProvider(),
                objectUtils: new StubObjectUtility(),
                knownComponentsByItemUuid
            });

            await underTest.index();

            expect(underTest.size).toEqual(12);
            expect(underTest.amountFor(testComponentOne)).toEqual(componentOneQuantity);
            expect(underTest.amountFor(testComponentTwo)).toEqual(0);
            expect(underTest.amountFor(testComponentThree)).toEqual(0);
            expect(underTest.amountFor(testComponentFour)).toEqual(0);
            expect(underTest.amountFor(testComponentFive)).toEqual(componentFiveQuantity);
            expect(underTest.amountFor(testComponentSix)).toEqual(0);
            expect(underTest.amountFor(testComponentSeven)).toEqual(componentSevenQuantity);

        });

        test.skip("should index actor's inventory without counting item quantity if reader not specified", async () => {

            const componentOneQuantity = 7;
            const componentFiveQuantity = 4;
            const componentSevenQuantity = 1;
            const ownedItems = generateInventory(Combination.ofUnits([
                new Unit<Component>(testComponentOne, componentOneQuantity),
                new Unit<Component>(testComponentFive, componentFiveQuantity),
                new Unit<Component>(testComponentSeven, componentSevenQuantity)
            ]), 34);
            generateInventory(Combination.of(testComponentOne, 1), 0)
                .forEach(value => ownedItems.set(value.id, value));
            const actorFactory = new StubActorFactory({ownedItems});
            const actor = actorFactory.make();

            const underTest = new CraftingInventory({
                actor,
                documentManager,
                itemQuantityWriter: new NoItemQuantityWriter(),
                itemQuantityReader: new AlwaysOneItemQuantityReader(),
                gameProvider: new StubGameProvider(),
                objectUtils: new StubObjectUtility(),
                knownComponentsByItemUuid
            });

            await underTest.index();

            expect(underTest.size).toEqual(4);

            const justOne = 1;
            const two = 2;

            expect(underTest.amountFor(testComponentOne)).toEqual(two);
            expect(underTest.amountFor(testComponentTwo)).toEqual(0);
            expect(underTest.amountFor(testComponentThree)).toEqual(0);
            expect(underTest.amountFor(testComponentFour)).toEqual(0);
            expect(underTest.amountFor(testComponentFive)).toEqual(justOne);
            expect(underTest.amountFor(testComponentSix)).toEqual(0);
            expect(underTest.amountFor(testComponentSeven)).toEqual(justOne);

        });

    });

    describe("accepting results", () => {

        test.skip("should salvage a component when the results are not owned", async () => {

            const ownedItems = generateInventory(Combination.of(testComponentThree, 1));
            const actorFactory = new StubActorFactory({ ownedItems });
            const actor = actorFactory.make();

            const underTest = new CraftingInventory({
                actor,
                documentManager,
                itemQuantityWriter: new DnD5EItemQuantityWriter(),
                itemQuantityReader: new DnD5EItemQuantityReader(),
                gameProvider: new StubGameProvider(),
                objectUtils: new StubObjectUtility(),
                knownComponentsByItemUuid
            });

            await underTest.index();

            expect(underTest.size).toEqual(1);

            const componentSevenQuantity = 2;
            const componentOneQuantity = 1;
            const salvageResult = new SuccessfulSalvageResult({
                consumed: Combination.of(testComponentThree, 1),
                created: Combination.ofUnits([
                    new Unit(testComponentSeven, componentSevenQuantity),
                    new Unit(testComponentOne, componentOneQuantity)
                ])
            });

            await underTest.acceptSalvageResult(salvageResult);

            expect(underTest.size).toEqual(3);
            expect(underTest.amountFor(testComponentThree)).toEqual(0);
            expect(underTest.amountFor(testComponentSeven)).toEqual(componentSevenQuantity);
            expect(underTest.amountFor(testComponentOne)).toEqual(componentOneQuantity);

        });

        test.skip("should salvage a component when the results are owned", async () => {
            const ownedItems = generateInventory(Combination.ofUnits([
                new Unit(testComponentThree, 1),
                new Unit(testComponentSeven, 1),
                new Unit(testComponentOne, 1)
            ]));
            const actorFactory = new StubActorFactory({ ownedItems });
            const actor = actorFactory.make();

            const underTest = new CraftingInventory({
                actor,
                documentManager,
                itemQuantityWriter: new DnD5EItemQuantityWriter(),
                itemQuantityReader: new DnD5EItemQuantityReader(),
                gameProvider: new StubGameProvider(),
                objectUtils: new StubObjectUtility(),
                knownComponentsByItemUuid
            });

            await underTest.index();

            expect(underTest.size).toEqual(3);
            const initialItemCollectionSize = actor.items.size;

            const componentSevenQuantity = 2;
            const componentOneQuantity = 1;
            const salvageResult = new SuccessfulSalvageResult({
                consumed: Combination.of(testComponentThree, 1),
                created: Combination.ofUnits([
                    new Unit(testComponentSeven, componentSevenQuantity),
                    new Unit(testComponentOne, componentOneQuantity)
                ])
            });

            await underTest.acceptSalvageResult(salvageResult);

            expect(underTest.size).toEqual(5);
            expect(underTest.amountFor(testComponentThree)).toEqual(0);
            expect(underTest.amountFor(testComponentSeven)).toEqual(componentSevenQuantity + 1);
            expect(underTest.amountFor(testComponentOne)).toEqual(componentOneQuantity + 1);

            expect(actor.items.size).toEqual(initialItemCollectionSize - 1);
        });

    });

});

function generateInventory(ownedComponents: Combination<Component> = Combination.EMPTY(), additionalItemCount = 10): Map<string, StubItem> {
    const result: Map<string, StubItem> = new Map();
    for (let i = 0; i < additionalItemCount; i++) {
        const id = randomIdentifier();
        result.set(id, new StubItem({ id }));
    }
    ownedComponents.units.map(unit => {
        const id = randomIdentifier();
        result.set(id, new StubItem({
            id: id,
            flags: {
                core: {
                    sourceId: unit.element.itemUuid
                }
            },
            system: {
                quantity: unit.quantity
            }
        }));
    });
    return result;
}

function randomIdentifier(): string {
    return (Math.random() + 1)
        .toString(36)
        .substring(2);
}