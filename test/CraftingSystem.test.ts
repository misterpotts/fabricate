import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {Fabricator} from "../src/scripts/core/Fabricator";
import {EssenceDefinition} from "../src/scripts/common/EssenceDefinition";
import {PartDictionary} from "../src/scripts/system/PartDictionary";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {GameSystem} from "../src/scripts/system/GameSystem";
import {CraftingCheck} from "../src/scripts/crafting/CraftingCheck";
import {Inventory} from "../src/scripts/actor/Inventory";
import {Recipe} from "../src/scripts/crafting/Recipe";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const essences: EssenceDefinition[] = [elementalAir, elementalEarth, elementalFire, elementalWater];

const stubFabricator: Fabricator<{}, Actor> = <Fabricator<{}, Actor>><unknown>{
    followRecipe: () => {},
    performAlchemy: () => {}
};
//const stubFollowRecipeMethod = Sandbox.stub(stubFabricator, 'followRecipe');
//const stubPerformAlchemyMethod = Sandbox.stub(stubFabricator, 'performAlchemy');

const stubPartDictionary: PartDictionary = <PartDictionary><unknown>{

};

const stubCraftingCheck: CraftingCheck<Actor> = <CraftingCheck<Actor>><unknown>{

};

const stubActor: Actor<Actor.Data, Item<Item.Data>> = <Actor<Actor.Data, Item<Item.Data>>><unknown>{};

const stubInventory: Inventory<any, Actor<Actor.Data, Item<Item.Data>>> = <Inventory<any, Actor<Actor.Data, Item<Item.Data>>>><unknown>{
    actor: Sandbox.stub(),
    ownedComponents: Sandbox.stub(),
    containsIngredients: () => {},
    containsEssences: () => {},
    selectFor: () => {},
    excluding: () => {},
    perform: () => {}
};
//const stubInventoryExcludingMethod = Sandbox.stub(stubInventory, 'excluding');
//const stubInventoryContainsIngredientsMethod = Sandbox.stub(stubInventory, 'containsIngredients');
//const stubInventorySelectForMethod = Sandbox.stub(stubInventory, 'selectFor');
//const stubInventoryPerformMethod = Sandbox.stub(stubInventory, 'perform');
//const stubInventoryContainsEssencesMethod = Sandbox.stub(stubInventory, 'containsEssences');

const stubRecipe: Recipe = <Recipe><unknown>{};

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
            craftingCheck: stubCraftingCheck,
            fabricator: stubFabricator
        });

        const fabricationOutcome = await underTest.craft(stubActor, stubInventory, stubRecipe);
        expect(fabricationOutcome).not.toBeNull();

    });

});
