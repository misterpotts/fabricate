import {expect, jest, test} from "@jest/globals";
import {BaseCraftingInventory, Inventory} from "../../src/scripts/v2/Inventory";
import {Combination, Unit} from "../../src/scripts/v2/Combination";
import {CraftingComponent} from "../../src/scripts/v2/CraftingComponent";
import {EssenceDefinition} from "../../src/scripts/v2/EssenceDefinition";
// @ts-ignore
import {testComponentFive, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
// @ts-ignore
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";

beforeEach(() => {
    jest.resetAllMocks();
});

test('Should create a Base Crafting Inventory',() => {
   const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
       new Unit<CraftingComponent>(testComponentOne, 5),
       new Unit<CraftingComponent>(testComponentThree, 4),
       new Unit<CraftingComponent>(testComponentFive, 3)
   ]);

   const mockActorId: string = 'iyeHYRbSts0ij23V';
   const mockActor: Actor = <Actor><unknown>{
       id: mockActorId
   };

   const underTest: Inventory<Item, Actor> = BaseCraftingInventory.builder<Item, Actor>()
       .withOwnedComponents(testCombination)
       .withActor(mockActor)
       .build();

   expect(underTest).not.toBeNull();
   expect(underTest.actor.id).toEqual(mockActorId);
   expect(underTest.ownedComponents.amountFor(testComponentOne)).toBe(5);
   expect(underTest.ownedComponents.amountFor(testComponentTwo)).toBe(4);
   expect(underTest.ownedComponents.amountFor(testComponentThree)).toBe(3);
});

test('Should identify when Essences are and are not present in contained Components',() => {
    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([ // 5 Earth, 4 Water, 4 Air, 1 Fire
        new Unit<CraftingComponent>(testComponentOne, 1), // 2 Earth x 1
        new Unit<CraftingComponent>(testComponentThree, 2), // 2 Water, 2 Air x 2
        new Unit<CraftingComponent>(testComponentFive, 1) // 1 Fire, 3 Earth x 1
    ]);

    const underTest: Inventory<Item, Actor> = BaseCraftingInventory.builder<Item, Actor>()
        .withOwnedComponents(testCombination)
        .build();

    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 2)]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 1)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 2)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 3)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 4)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 5)]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 1)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 2)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 3)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 4)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 5)]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 1)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 2)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 3)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 4)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 5)]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 6)]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 5),
        new Unit<EssenceDefinition>(elementalWater, 4),
        new Unit<EssenceDefinition>(elementalAir, 4),
        new Unit<EssenceDefinition>(elementalFire, 1),
    ]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 2),
        new Unit<EssenceDefinition>(elementalWater, 3),
        new Unit<EssenceDefinition>(elementalAir, 1),
    ]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalFire, 1)
    ]))).toBe(true);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 6),
        new Unit<EssenceDefinition>(elementalWater, 4),
        new Unit<EssenceDefinition>(elementalAir, 4),
        new Unit<EssenceDefinition>(elementalFire, 1),
    ]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 5),
        new Unit<EssenceDefinition>(elementalWater, 5),
        new Unit<EssenceDefinition>(elementalAir, 4),
        new Unit<EssenceDefinition>(elementalFire, 1),
    ]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 5),
        new Unit<EssenceDefinition>(elementalWater, 4),
        new Unit<EssenceDefinition>(elementalAir, 5),
        new Unit<EssenceDefinition>(elementalFire, 1),
    ]))).toBe(false);
    expect(underTest.containsEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 5),
        new Unit<EssenceDefinition>(elementalWater, 4),
        new Unit<EssenceDefinition>(elementalAir, 4),
        new Unit<EssenceDefinition>(elementalFire, 2),
    ]))).toBe(false);
});