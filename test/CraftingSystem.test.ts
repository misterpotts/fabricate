import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {Fabricator} from "../src/scripts/core/Fabricator";
import {EssenceDefinition} from "../src/scripts/common/EssenceDefinition";
import {PartDictionary} from "../src/scripts/system/PartDictionary";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {GameSystem} from "../src/scripts/system/GameSystem";
import {CraftingCheck} from "../src/scripts/crafting/check/CraftingCheck";
import {Inventory} from "../src/scripts/actor/Inventory";
import {testRecipeOne} from "./test_data/TestRecipes";
import {NoCraftingCheck} from "../src/scripts/crafting/check/NoCraftingCheck";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const essences: EssenceDefinition[] = [elementalAir, elementalEarth, elementalFire, elementalWater];

const stubPartDictionary: PartDictionary = <PartDictionary><unknown>{

};

const stubCraftingCheck: CraftingCheck<Actor> = <CraftingCheck<Actor>><unknown>{
    perform: () => {}
};

//const stubPerformMethod = Sandbox.stub(stubCraftingCheck, 'perform');

//todo: Deleteme
const stubFabricator: Fabricator<any, any> = <Fabricator<any, any>><unknown>{

};

const stubActor: Actor<Actor.Data, Item<Item.Data>> = <Actor<Actor.Data, Item<Item.Data>>><unknown>{};

const stubInventory: Inventory<any, Actor<Actor.Data, Item<Item.Data>>> = <Inventory<any, Actor<Actor.Data, Item<Item.Data>>>><unknown>{
    actor: {},
    ownedComponents: {},
    removeAll: () => {},
    addAll: () => {},
    accept: () => {},
    index: () => {}
};
//const stubAcceptMethod = Sandbox.stub(stubInventory, 'accept');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create and configure', () => {

    test('Should create a new Crafting System',() => {
        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            supportedGameSystems: [GameSystem.DND5E],
            essences: essences,
            partDictionary: stubPartDictionary,
            craftingCheck: stubCraftingCheck,
            fabricator: stubFabricator
        });
        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toBe(true);
        expect(underTest.essences).toEqual(expect.arrayContaining(essences));
        expect(underTest.supports(GameSystem.DND5E)).toBe(true);
        expect(underTest.supportedGameSystems).toEqual(expect.arrayContaining([GameSystem.DND5E]));
    });

});

describe('Crafting', () => {

    test('Should craft successfully from recipe',async () => {
        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            supportedGameSystems: [GameSystem.DND5E],
            essences: essences,
            partDictionary: stubPartDictionary,
            craftingCheck: new NoCraftingCheck(),
            fabricator: stubFabricator
        });

        Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeOne.namedComponents);

        const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeOne);
        expect(craftingResult).not.toBeNull();

    });

});
