import {describe, expect, test} from '@jest/globals';
import {DefaultInventoryFactory} from "../src/scripts/actor/InventoryFactory";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubObjectUtility} from "./stubs/StubObjectUtility";
import {StubActorFactory} from "./stubs/StubActorFactory";
import {
    allTestComponents,
    testComponentFive,
    testComponentFour,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {DefaultUnit} from "../src/scripts/common/Unit";
import {SimpleInventoryAction} from "../src/scripts/actor/InventoryAction";
import {DefaultCombination} from "../src/scripts/common/Combination";

describe("Crafting Inventory", () => {

    const dnd5eInventoryFactory = new DefaultInventoryFactory({
        localizationService: new StubLocalizationService(),
        objectUtility: new StubObjectUtility(),
    });

    describe("indexing", () => {

        test("should index actor's inventory without fabricate items and without known components", () => {

            const stubActor = new StubActorFactory().make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, []);
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(0);

        });

        test("should index actor's inventory without fabricate items with known components", () => {

            const stubActor = new StubActorFactory().make();
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(0);

        });

        test("should index actor's inventory with some fabricate items", () => {

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(5);
            expect(contents.amountFor(testComponentTwo)).toBe(3);
            expect(contents.amountFor(testComponentFive)).toBe(2);

        });

        test("should index actor's inventory in unknown system if default item quantity property path is populated on items", () => {

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("notDnd5e", stubActor, getAllTestComponents());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(5);
            expect(contents.amountFor(testComponentTwo)).toBe(3);
            expect(contents.amountFor(testComponentFive)).toBe(2);

        });

        test("should index actor's inventory without counting item quantity if no item quantity property path is known and default item quantity path is not populated on items", () => {

            const stubActor = new StubActorFactory("data.amount")
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("notDnd5e", stubActor, getAllTestComponents());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(2);
            expect(contents.amountFor(testComponentTwo)).toBe(1);
            expect(contents.amountFor(testComponentFive)).toBe(1);

        });

        test("should register item quantity property path", () => {

            const inventoryFactory = new DefaultInventoryFactory({
                localizationService: new StubLocalizationService(),
                objectUtility: new StubObjectUtility(),
            });

            inventoryFactory.registerGameSystemItemQuantityPropertyPath("notDnd5e", "system.quantity");

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = inventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const contents = underTest.getContents();
            expect(contents).not.toBeNull();
            expect(contents.size).toBe(5);
            expect(contents.amountFor(testComponentTwo)).toBe(3);
            expect(contents.amountFor(testComponentFive)).toBe(2);

        });

    });

    describe("performing actions", () => {

        test("should add items without removing if no removals are specified", async () => {

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const addOneTestComponentThreeOnly = new SimpleInventoryAction({
                additions: DefaultCombination.ofUnits([new DefaultUnit(testComponentThree, 1)])
            });

            const result = await underTest.perform(addOneTestComponentThreeOnly);
            expect(result).not.toBeNull();
            expect(result.size).toBe(6);
            expect(result.amountFor(testComponentTwo)).toBe(3);
            expect(result.amountFor(testComponentFive)).toBe(2);
            expect(result.amountFor(testComponentThree)).toBe(1);

        });

        test("should remove items without adding if no additions are specified", async () => {

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const removeTwoTestComponentTwoOnly = new SimpleInventoryAction({
                removals: DefaultCombination.ofUnits([new DefaultUnit(testComponentTwo, 2)])
            });

            const result = await underTest.perform(removeTwoTestComponentTwoOnly);
            expect(result).not.toBeNull();
            expect(result.size).toBe(3);
            expect(result.amountFor(testComponentTwo)).toBe(1);
            expect(result.amountFor(testComponentFive)).toBe(2);

        });

        test("should add and remove items if both are specified", async () => {

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const removeTwoTestComponentTwoAndTestComponentFiveAndAddTwoTestComponentThree = new SimpleInventoryAction({
                removals: DefaultCombination.ofUnits([
                    new DefaultUnit(testComponentTwo, 2),
                    new DefaultUnit(testComponentFive, 2),
                ]),
                additions: DefaultCombination.ofUnits([
                    new DefaultUnit(testComponentThree, 2),
                ]),
            });

            const result = await underTest.perform(removeTwoTestComponentTwoAndTestComponentFiveAndAddTwoTestComponentThree);
            expect(result).not.toBeNull();
            expect(result.size).toBe(3);
            expect(result.amountFor(testComponentTwo)).toBe(1);
            expect(result.amountFor(testComponentThree)).toBe(2);

        });

        test("should rationalise complete overlapping additions and removals to no action", async () => {

            const stubActor = new StubActorFactory()
                .make({
                    ownedComponents: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentTwo, 3),
                        new DefaultUnit(testComponentFive, 2),
                    ])
                });
            const underTest = dnd5eInventoryFactory.make("dnd5e", stubActor, getAllTestComponents());
            const removeTwoTestComponentTFourAndAddTwoTestComponentFour = new SimpleInventoryAction({
                removals: DefaultCombination.ofUnits([new DefaultUnit(testComponentFour, 2)]),
                additions: DefaultCombination.ofUnits([new DefaultUnit(testComponentFour, 2)]),
            });

            const result = await underTest.perform(removeTwoTestComponentTFourAndAddTwoTestComponentFour);
            expect(result).not.toBeNull();
            expect(result.size).toBe(5);
            expect(result.amountFor(testComponentTwo)).toBe(3);
            expect(result.amountFor(testComponentFive)).toBe(2);

        });

    });

});

function getAllTestComponents() {
    return Array.from(allTestComponents.values());
}