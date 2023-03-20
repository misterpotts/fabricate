import {describe, expect, test} from '@jest/globals';
import {CraftingInventory} from "../src/scripts/actor/Inventory";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {
    AlwaysOneItemQuantityReader,
    DnD5EItemQuantityReader,
    DnD5EItemQuantityWriter, NoItemQuantityWriter
} from "../src/scripts/actor/ItemQuantity";
import {StubGameProvider} from "./stubs/StubGameProvider";
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
import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";
import {StubItem} from "./stubs/StubItem";

describe("Crafting Inventory", () => {

    const stubGameObject = <Game><unknown>{};
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
    const documentManager = new StubDocumentManager(fabricateItemDataByUuid);

    test("should index actor's inventory with no fabricate items", async () => {

        const ownedItems = generateInventory(Combination.EMPTY(), 40);
        const actorFactory = new StubActorFactory({ownedItems});
        const actor = actorFactory.make();

        const underTest = new CraftingInventory({
            actor,
            documentManager,
            itemQuantityWriter: new DnD5EItemQuantityWriter(),
            itemQuantityReader: new DnD5EItemQuantityReader(),
            gameProvider: new StubGameProvider(stubGameObject),
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

    test("should index actor's inventory with some fabricate items", async () => {

        const componentOneQuantity = 7;
        const componentFiveQuantity = 4;
        const componentSevenQuantity = 1;
        const ownedItems = generateInventory(Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, componentOneQuantity),
            new Unit<CraftingComponent>(testComponentFive, componentFiveQuantity),
            new Unit<CraftingComponent>(testComponentSeven, componentSevenQuantity)
        ]), 34);
        const actorFactory = new StubActorFactory({ownedItems});
        const actor = actorFactory.make();

        const underTest = new CraftingInventory({
            actor,
            documentManager,
            itemQuantityWriter: new DnD5EItemQuantityWriter(),
            itemQuantityReader: new DnD5EItemQuantityReader(),
            gameProvider: new StubGameProvider(stubGameObject),
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

    test("should index actor's inventory without counting item quantity if reader not specified", async () => {

        const componentOneQuantity = 7;
        const componentFiveQuantity = 4;
        const componentSevenQuantity = 1;
        const ownedItems = generateInventory(Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, componentOneQuantity),
            new Unit<CraftingComponent>(testComponentFive, componentFiveQuantity),
            new Unit<CraftingComponent>(testComponentSeven, componentSevenQuantity)
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
            gameProvider: new StubGameProvider(stubGameObject),
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

function generateInventory(ownedComponents: Combination<CraftingComponent> = Combination.EMPTY(), additionalItemCount = 10): Map<string, StubItem> {
    const result: Map<string, StubItem> = new Map();
    for (let i = 0; i < additionalItemCount; i++) {
        const id = randomIdentifier();
        result.set(id, new StubItem({ id }));
    }
    ownedComponents.units.map(unit => {
        result.set(unit.part.itemUuid, new StubItem({
            id: unit.part.id,
            flags: {
                core: {
                    sourceId: unit.part.itemUuid
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