import {describe, expect, test} from '@jest/globals';
import {Combination} from "../src/scripts/common/Combination";
import {Component} from "../src/scripts/crafting/component/Component";
import {StubItem} from "./stubs/StubItem";
import {DefaultInventoryFactory} from "../src/scripts/actor/InventoryFactory";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubObjectUtility} from "./stubs/StubObjectUtility";
import {StubActorFactory} from "./stubs/StubActorFactory";
import {
    allTestComponents,
    testComponentFive, testComponentFour,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {Unit} from "../src/scripts/common/Unit";
import {SimpleInventoryAction} from "../src/scripts/actor/InventoryAction";

describe("Crafting Inventory", () => {

    const dnd5eInventoryFactory = new DefaultInventoryFactory({
        localization: new StubLocalizationService(),
        objectUtility: new StubObjectUtility(),
    });

    describe("indexing", () => {

        test("should index actor's inventory without fabricate items and without known components", () => {

            const stubActor = new StubActorFactory().make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, new Map());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(0);

        });

        test("should index actor's inventory without fabricate items with known components", () => {

            const stubActor = new StubActorFactory().make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(0);

        });

        test("should index actor's inventory with some fabricate items", () => {

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(5);
            expect(contents.amountFor(testComponentTwo)).toBe(3);
            expect(contents.amountFor(testComponentFive)).toBe(2);

        });

        test("should index actor's inventory without counting item quantity if no item quantity property path is known", () => {

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = dnd5eInventoryFactory.make("notDnd5e", stubActor, allTestComponentsByItemUuid());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(2);
            expect(contents.amountFor(testComponentTwo)).toBe(1);
            expect(contents.amountFor(testComponentFive)).toBe(1);

        });

        test("should register item quantity property path", () => {

            const inventoryFactory = new DefaultInventoryFactory({
                localization: new StubLocalizationService(),
                objectUtility: new StubObjectUtility(),
            });

            inventoryFactory.registerGameSystemItemQuantityPropertyPath("notDnd5e", "system.quantity");

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = inventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(5);
            expect(contents.amountFor(testComponentTwo)).toBe(3);
            expect(contents.amountFor(testComponentFive)).toBe(2);

        });

    });

    describe("performing actions", () => {

        test("should add items without removing if no removals are specified", async () => {

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const addOneTestComponentThreeOnly = new SimpleInventoryAction({
                additions: Combination.ofUnits([new Unit(testComponentThree, 1)])
            });

            const result = await underTest.perform(addOneTestComponentThreeOnly);
            expect(result).not.toBeNull();
            expect(result.size).toBe(6);
            expect(result.amountFor(testComponentTwo)).toBe(3);
            expect(result.amountFor(testComponentFive)).toBe(2);
            expect(result.amountFor(testComponentThree)).toBe(1);

        });

        test("should remove items without adding if no additions are specified", async () => {

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const removeTwoTestComponentTwoOnly = new SimpleInventoryAction({
                removals: Combination.ofUnits([new Unit(testComponentTwo, 2)])
            });

            const result = await underTest.perform(removeTwoTestComponentTwoOnly);
            expect(result).not.toBeNull();
            expect(result.size).toBe(3);
            expect(result.amountFor(testComponentTwo)).toBe(1);
            expect(result.amountFor(testComponentFive)).toBe(2);

        });

        test("should add and remove items if both are specified", async () => {

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const removeTwoTestComponentTwoAndTestComponentFiveAndAddTwoTestComponentThree = new SimpleInventoryAction({
                removals: Combination.ofUnits([
                    new Unit(testComponentTwo, 2),
                    new Unit(testComponentFive, 2),
                ]),
                additions: Combination.ofUnits([
                    new Unit(testComponentThree, 2),
                ]),
            });

            const result = await underTest.perform(removeTwoTestComponentTwoAndTestComponentFiveAndAddTwoTestComponentThree);
            expect(result).not.toBeNull();
            expect(result.size).toBe(3);
            expect(result.amountFor(testComponentTwo)).toBe(1);
            expect(result.amountFor(testComponentThree)).toBe(2);

        });

        test("should rationalise complete overlapping additions and removals to no action", async () => {

            const stubActor = new StubActorFactory(
                {
                    ownedItems: generateInventory(Combination.ofUnits([
                        new Unit(testComponentTwo, 3),
                        new Unit(testComponentFive, 2),
                    ]), 5),
                }
            ).make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, allTestComponentsByItemUuid());
            const removeTwoTestComponentTFourAndAddTwoTestComponentFour = new SimpleInventoryAction({
                removals: Combination.ofUnits([new Unit(testComponentFour, 2)]),
                additions: Combination.ofUnits([new Unit(testComponentFour, 2)]),
            });

            const result = await underTest.perform(removeTwoTestComponentTFourAndAddTwoTestComponentFour);
            expect(result).not.toBeNull();
            expect(result.size).toBe(5);
            expect(result.amountFor(testComponentTwo)).toBe(3);
            expect(result.amountFor(testComponentFive)).toBe(2);

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

function allTestComponentsByItemUuid() {
    return Array.from(allTestComponents.values())
        .reduce((map, component) => {
            map.set(component.itemUuid, component);
            return map;
        }, new Map<string, Component>());
}