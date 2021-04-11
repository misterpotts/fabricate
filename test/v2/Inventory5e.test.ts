import {afterAll, beforeAll, beforeEach, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";

import {Inventory5e} from "../../src/scripts/v2/Inventory5e";
import {PartDictionary} from "../../src/scripts/v2/PartDictionary";
import {Inventory} from "../../src/scripts/v2/Inventory";
import {Combination, Unit} from "../../src/scripts/v2/Combination";
import {CraftingComponent} from "../../src/scripts/v2/CraftingComponent";
import {EssenceDefinition} from "../../src/scripts/v2/EssenceDefinition";
import {FabricateCompendiumData} from "../../src/scripts/game/CompendiumData";

import Properties from "../../src/scripts/Properties";

import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

let mockInventoryContents: Item5e[] = [];
let mockPartDictionary: PartDictionary = <PartDictionary>{};

beforeAll(() => {
    const rawTestData = require('../resources/inventory-5e-actor-items-values.json');
    mockInventoryContents = rawTestData.map((item: any) => {
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
    const mockComponentFrom: any = Sandbox.stub();
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.flags.fabricate.identity', {partId: testComponentOne.partId, systemId: testComponentOne.systemId})).returns(testComponentOne);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.flags.fabricate.identity', {partId: testComponentTwo.partId, systemId: testComponentTwo.systemId})).returns(testComponentTwo);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.flags.fabricate.identity', {partId: testComponentThree.partId, systemId: testComponentThree.systemId})).returns(testComponentThree);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.flags.fabricate.identity', {partId: testComponentFour.partId, systemId: testComponentFour.systemId})).returns(testComponentFour);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.flags.fabricate.identity', {partId: testComponentFive.partId, systemId: testComponentFive.systemId})).returns(testComponentFive);
    mockPartDictionary.componentFrom = mockComponentFrom;
});

beforeEach(() => {
    jest.resetAllMocks();
});

afterAll(() => {
    Sandbox.restore();
});

test('Should create an Inventory5e and index an Actor5e',() => {

    const mockActor: Actor5e = <Actor5e><unknown>{
        items: {
            entries: () => mockInventoryContents
        }
    };

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withActor(mockActor)
        .withPartDictionary(mockPartDictionary)
        .build();

    expect(underTest).not.toBeNull();
    expect(underTest.ownedComponents.isEmpty()).toBe(true);

    underTest.prepare();

    expect(underTest.ownedComponents.isEmpty()).toBe(false);
    expect(underTest.containsIngredients(Combination.of(testComponentOne, 1))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentOne, 2))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentThree, 1))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentThree, 2))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentFive, 1))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentFive, 2))).toBe(false);
    expect(underTest.containsIngredients(Combination.of(testComponentFour, 9))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentFour, 10))).toBe(true);
    expect(underTest.containsIngredients(Combination.of(testComponentFour, 11))).toBe(false);
});

test('Should create an Inventory5e',() => {
    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit<CraftingComponent>(testComponentOne, 5),
        new Unit<CraftingComponent>(testComponentThree, 4),
        new Unit<CraftingComponent>(testComponentFive, 3)
    ]);

    const mockActorId: string = 'iyeHYRbSts0ij23V';
    const mockActor: Actor5e = <Actor5e><unknown>{
        id: mockActorId
    };

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withOwnedComponents(testCombination)
        .withActor(mockActor)
        .build();

    expect(underTest).not.toBeNull();
    expect(underTest.actor.id).toEqual(mockActorId);
    expect(underTest.ownedComponents.amountFor(testComponentOne)).toBe(5);
    expect(underTest.ownedComponents.amountFor(testComponentThree)).toBe(4);
    expect(underTest.ownedComponents.amountFor(testComponentFive)).toBe(3);
});

test('Should identify when Essences are and are not present in contained Components',() => {
    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([ // 5 Earth, 4 Water, 4 Air, 1 Fire
        new Unit<CraftingComponent>(testComponentOne, 1), // 2 Earth x 1
        new Unit<CraftingComponent>(testComponentThree, 2), // 2 Water, 2 Air x 2
        new Unit<CraftingComponent>(testComponentFive, 1) // 1 Fire, 3 Earth x 1
    ]);

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withOwnedComponents(testCombination)
        .build();

    expect(underTest.containsEssences(Combination.of(elementalFire, 1))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalFire, 2))).toBe(false);
    expect(underTest.containsEssences(Combination.of(elementalAir, 1))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalAir, 2))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalAir, 3))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalAir, 4))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalAir, 5))).toBe(false);
    expect(underTest.containsEssences(Combination.of(elementalWater, 1))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalWater, 2))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalWater, 3))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalWater, 4))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalWater, 5))).toBe(false);
    expect(underTest.containsEssences(Combination.of(elementalEarth, 1))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalEarth, 2))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalEarth, 3))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalEarth, 4))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalEarth, 5))).toBe(true);
    expect(underTest.containsEssences(Combination.of(elementalEarth, 6))).toBe(false);
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

test('Should select individual Components for essences',() => {

    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([ // 5 Earth, 4 Water, 4 Air, 1 Fire
        new Unit<CraftingComponent>(testComponentOne, 1), // 2 Earth x 1
        new Unit<CraftingComponent>(testComponentThree, 2), // 2 Water, 2 Air x 2
        new Unit<CraftingComponent>(testComponentFive, 1) // 1 Fire, 3 Earth x 1
    ]);

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withOwnedComponents(testCombination)
        .build();

    const selectForOneFire: Combination<CraftingComponent> = underTest.selectFor(Combination.of(elementalFire, 1));
    expect(selectForOneFire.isEmpty()).toBe(false);
    expect(selectForOneFire.size()).toBe(1);
    expect(selectForOneFire.amountFor(testComponentFive)).toBe(1);

    const selectForTwoWater: Combination<CraftingComponent> = underTest.selectFor(Combination.of(elementalWater, 2));
    expect(selectForTwoWater.isEmpty()).toBe(false);
    expect(selectForTwoWater.size()).toBe(1);
    expect(selectForTwoWater.amountFor(testComponentThree)).toBe(1);

});

test('Should select multiple Components for essences',() => {
    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([ // 5 Earth, 4 Water, 4 Air, 1 Fire
        new Unit<CraftingComponent>(testComponentOne, 1), // 2 Earth x 1
        new Unit<CraftingComponent>(testComponentThree, 2), // 2 Water, 2 Air x 2
        new Unit<CraftingComponent>(testComponentFive, 1) // 1 Fire, 3 Earth x 1
    ]);

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withOwnedComponents(testCombination)
        .build();

    const selectForFiveEarth: Combination<CraftingComponent> = underTest.selectFor(Combination.of(elementalEarth, 5));
    expect(selectForFiveEarth.isEmpty()).toBe(false);
    expect(selectForFiveEarth.size()).toBe(2);
    expect(selectForFiveEarth.amountFor(testComponentOne)).toBe(1);
    expect(selectForFiveEarth.amountFor(testComponentFive)).toBe(1);
});

test('Should select favourable outcomes reducing essence waste',() => {
    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([ // 5 Earth, 4 Water, 4 Air, 1 Fire
        new Unit<CraftingComponent>(testComponentOne, 1), // 2 Earth x 1
        new Unit<CraftingComponent>(testComponentTwo, 1), // 1 Fire
        new Unit<CraftingComponent>(testComponentThree, 2), // 2 Water, 2 Air x 2
        new Unit<CraftingComponent>(testComponentFour, 2), // 2 Air x 2
        new Unit<CraftingComponent>(testComponentFive, 1) // 1 Fire, 3 Earth x 1
    ]);

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withOwnedComponents(testCombination)
        .build();

    const selectForFourAir: Combination<CraftingComponent> = underTest.selectFor(Combination.of(elementalAir, 4));
    expect(selectForFourAir.isEmpty()).toBe(false);
    expect(selectForFourAir.size()).toBe(2);
    expect(selectForFourAir.amountFor(testComponentFour)).toBe(2);
});

test('Should select from arbitrarily large inventories',() => {
    const testCombination: Combination<CraftingComponent> = Combination.ofUnits([ // 5 Earth, 4 Water, 4 Air, 1 Fire
        new Unit<CraftingComponent>(testComponentOne, 1000), // 2 Earth x 1
        new Unit<CraftingComponent>(testComponentTwo, 1000), // 1 Fire
        new Unit<CraftingComponent>(testComponentThree, 2000), // 2 Water, 2 Air x 2
        new Unit<CraftingComponent>(testComponentFour, 2000), // 2 Air x 2
        new Unit<CraftingComponent>(testComponentFive, 1000) // 1 Fire, 3 Earth x 1
    ]);

    const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
        .withOwnedComponents(testCombination)
        .build();

    const selectForFourAir: Combination<CraftingComponent> = underTest.selectFor(Combination.of(elementalAir, 4));
    expect(selectForFourAir.isEmpty()).toBe(false);
    expect(selectForFourAir.size()).toBe(2);
    expect(selectForFourAir.amountFor(testComponentFour)).toBe(2);
});