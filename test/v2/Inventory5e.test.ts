import {afterAll, beforeAll, beforeEach, describe, expect, it, jest} from "@jest/globals";
import * as Sinon from "sinon";

import {Inventory5e} from "../../src/scripts/v2/Inventory5e";
import {PartDictionary} from "../../src/scripts/v2/PartDictionary";
import {Inventory} from "../../src/scripts/v2/Inventory";
import {Combination, Unit} from "../../src/scripts/v2/Combination";
import {CraftingComponent} from "../../src/scripts/v2/CraftingComponent";
import {EssenceDefinition} from "../../src/scripts/v2/EssenceDefinition";
import {ActionType, FabricationAction} from "../../src/scripts/v2/FabricationAction";

import Properties from "../../src/scripts/Properties";

import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {GameUtils} from "../../src/scripts/v2/foundry/GameUtils";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

let mockInventoryContents: Item5e[] = [];
let mockPartDictionary: PartDictionary = <PartDictionary><unknown>{
    componentFrom: () => {}
};

beforeAll(() => {
    const rawTestData = require('../resources/inventory-5e-actor-items-values.json');
    mockInventoryContents = rawTestData.map((itemData: any) => {
        const item = {
            getFlag: Sandbox.stub(),
            _data: itemData,
            data: itemData,
            options: {},
            apps: {},
            effects: new Map(),
            labels: {}
        };
        if (itemData.data.flags.fabricate) {
            const flags = itemData.data.flags.fabricate;
            item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.identity).returns(flags.identity);
            item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.partId).returns(flags.identity.partId);
            item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.systemId).returns(flags.identity.systemId);
            item.getFlag.withArgs(Properties.module.name, Properties.flagKeys.item.fabricateItemType).returns(flags.type);
        }
        return item;
    });

    const mockComponentFrom = Sandbox.stub(mockPartDictionary, 'componentFrom');
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.data.flags.fabricate.identity', {partId: testComponentOne.partId, systemId: testComponentOne.systemId})).returns(testComponentOne);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.data.flags.fabricate.identity', {partId: testComponentTwo.partId, systemId: testComponentTwo.systemId})).returns(testComponentTwo);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.data.flags.fabricate.identity', {partId: testComponentThree.partId, systemId: testComponentThree.systemId})).returns(testComponentThree);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.data.flags.fabricate.identity', {partId: testComponentFour.partId, systemId: testComponentFour.systemId})).returns(testComponentFour);
    mockComponentFrom.withArgs(Sinon.match.hasNested('data.data.flags.fabricate.identity', {partId: testComponentFive.partId, systemId: testComponentFive.systemId})).returns(testComponentFive);
});

const mockCompendium: Compendium = <Compendium><unknown>{
    getEntity: () => {}
};

const mockGame: Game = <Game><unknown>{
    packs: {
        get: () => {}
    }
};

const stubGetEntity = Sandbox.stub(mockCompendium, 'getEntity');
stubGetEntity.withArgs(testComponentOne.partId).resolves(<Entity>{});
stubGetEntity.withArgs(testComponentTwo.partId).resolves(<Entity>{});
stubGetEntity.withArgs(testComponentThree.partId).resolves(<Entity>{});
stubGetEntity.withArgs(testComponentFour.partId).resolves(<Entity>{});
stubGetEntity.withArgs(testComponentFive.partId).resolves(<Entity>{});

Sandbox.stub(mockGame.packs, 'get').withArgs('fabricate.test-system').returns(mockCompendium);

const mockActorId: string = 'iyeHYRbSts0ij23V';
const mockActor: Actor5e = <Actor5e><unknown>{
    id: mockActorId,
    items: {
        entries: () => mockInventoryContents
    },
    createEmbeddedEntity: () => {},
    updateEmbeddedEntity: () => {},
    deleteEmbeddedEntity: () => {}
};

const mockCreateEmbeddedEntity = Sandbox.stub(mockActor, 'createEmbeddedEntity');
const mockUpdateEmbeddedEntity = Sandbox.stub(mockActor, 'updateEmbeddedEntity');
const mockDeleteEmbeddedEntity = Sandbox.stub(mockActor, 'deleteEmbeddedEntity');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.resetHistory();
    mockCreateEmbeddedEntity.reset()
    mockUpdateEmbeddedEntity.reset()
    mockDeleteEmbeddedEntity.reset()
});

afterAll(() => {
    Sandbox.restore();
});

describe('Create and index', () => {

    it('Should create an Inventory5e with owned components',() => {
        const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 5),
            new Unit<CraftingComponent>(testComponentThree, 4),
            new Unit<CraftingComponent>(testComponentFive, 3)
        ]);

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

    it('Should create an Inventory5e and index an Actor5e',() => {

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
        expect(underTest.containsIngredients(Combination.of(testComponentOne, 3))).toBe(false);

        expect(underTest.containsIngredients(Combination.of(testComponentThree, 1))).toBe(true);
        expect(underTest.containsIngredients(Combination.of(testComponentThree, 2))).toBe(true);
        expect(underTest.containsIngredients(Combination.of(testComponentThree, 3))).toBe(false);

        expect(underTest.containsIngredients(Combination.of(testComponentFive, 1))).toBe(true);
        expect(underTest.containsIngredients(Combination.of(testComponentFive, 2))).toBe(false);

        expect(underTest.containsIngredients(Combination.of(testComponentFour, 9))).toBe(true);
        expect(underTest.containsIngredients(Combination.of(testComponentFour, 10))).toBe(true);
        expect(underTest.containsIngredients(Combination.of(testComponentFour, 11))).toBe(false);
    });

});

describe('Essence identification in Components', () => {

    it('Should identify when Essences are and are not present in contained Components',() => {
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

});

describe('Component Selection for Essences', () => {

    it('Should select individual Components for essences',() => {

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

    it('Should select multiple Components for essences',() => {
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

    it('Should select favourable outcomes reducing essence waste',() => {
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

    it('Should select from arbitrarily large inventories',() => {
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

});

describe('Take Actions', () => {

    it('Should perform deletes where owned Item quantity is equal to removal quantity', async () => {

        const mockGameUtils: GameUtils = <GameUtils><unknown>{
            duplicate: jest.fn().mockImplementation((source) => {
                return JSON.parse(JSON.stringify(source));
            }),
            merge: jest.fn().mockImplementation((target, source) => {
                return {...<object>target, ...<object>source};
            }),
        };

        mockUpdateEmbeddedEntity.resolves([]);
        // @ts-ignore
        mockCreateEmbeddedEntity.resolves([]);
        // @ts-ignore
        mockDeleteEmbeddedEntity.resolves([{}, {}]);

        const underTest: Inventory<Item5e.Data.Data, Actor5e> = Inventory5e.builder()
            .withActor(mockActor)
            .withPartDictionary(mockPartDictionary)
            .withGame(mockGame)
            .withGameUtils(mockGameUtils)
            .build();

        const removeTwoOfTestComponentOne: FabricationAction<Item.Data> = FabricationAction.builder<Item5e.Data>()
            .withComponent(new Unit<CraftingComponent>(testComponentOne, 2))
            .withActionType(ActionType.REMOVE)
            .build();

        const result: Item<Item.Data<Item5e.Data.Data>>[] = await underTest.perform([removeTwoOfTestComponentOne]);

        expect(result).not.toBeNull();
        Sandbox.assert.notCalled(mockCreateEmbeddedEntity);
        Sandbox.assert.notCalled(mockUpdateEmbeddedEntity);
        Sandbox.assert.calledOnce(mockDeleteEmbeddedEntity);
        // @ts-ignore
        Sandbox.assert.calledWith(mockDeleteEmbeddedEntity, 'OwnedItem', Sandbox.match.array.contains(['z9y2U9ZfVEBN0rW6', '4cPRZO3bm9E3ngA9']));
    });

});