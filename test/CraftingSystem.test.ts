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
import {ChatDialog} from "../src/scripts/interface/ChatDialog";
import {testComponentFive, testComponentOne, testComponentThree} from "./test_data/TestCraftingComponents";
import {SuccessfulCraftingResult} from "../src/scripts/crafting/result/SuccessfulCraftingResult";
import {Combination} from "../src/scripts/common/Combination";
import {NoCraftingResult} from "../src/scripts/crafting/result/NoCraftingResult";
import {SuccessfulCraftingCheckResult} from "../src/scripts/crafting/check/SuccessfulCraftingCheckResult";
import {FailedCraftingCheckResult} from "../src/scripts/crafting/check/FailedCraftingCheckResult";
import {UnsuccessfulCraftingResult} from "../src/scripts/crafting/result/UnsuccessfulCraftingResult";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const essences: EssenceDefinition[] = [elementalAir, elementalEarth, elementalFire, elementalWater];

const stubPartDictionary: PartDictionary = <PartDictionary><unknown>{

};

const stubCraftingCheck: CraftingCheck<Actor> = <CraftingCheck<Actor>><unknown>{
    perform: () => {}
};
const stubPerformMethod = Sandbox.stub(stubCraftingCheck, 'perform');

const stubChatDialog: ChatDialog = <ChatDialog><unknown>{
    send: () => {}
};
// const stubSendMethod = Sandbox.stub(stubChatDialog, 'send');

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
            fabricator: stubFabricator,
            chatDialog: stubChatDialog
        });
        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toBe(true);
        expect(underTest.essences).toEqual(expect.arrayContaining(essences));
        expect(underTest.supports(GameSystem.DND5E)).toBe(true);
        expect(underTest.supportedGameSystems).toEqual(expect.arrayContaining([GameSystem.DND5E]));
    });

});

describe('Crafting ', () => {

    describe('without a Crafting Check', () => {

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            supportedGameSystems: [GameSystem.DND5E],
            essences: essences,
            partDictionary: stubPartDictionary,
            craftingCheck: new NoCraftingCheck(),
            fabricator: stubFabricator,
            chatDialog: stubChatDialog
        });

        test('should succeed for recipe with sufficient components',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeOne.namedComponents);

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeOne);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof SuccessfulCraftingResult).toEqual(true);
            expect(craftingResult.created.size()).toEqual(1);
            expect(craftingResult.created.amountFor(testComponentFive)).toEqual(1);
            expect(craftingResult.consumed.size()).toEqual(3);
            expect(craftingResult.consumed.amountFor(testComponentOne)).toEqual(1);
            expect(craftingResult.consumed.amountFor(testComponentThree)).toEqual(2);

        });

        test('should fail for recipe with insufficient components',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => Combination.of(testComponentOne, 1));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeOne);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof NoCraftingResult).toEqual(true);
            expect(craftingResult.created.size()).toEqual(0);
            expect(craftingResult.created.amountFor(testComponentFive)).toEqual(0);
            expect(craftingResult.consumed.size()).toEqual(0);
            expect(craftingResult.consumed.amountFor(testComponentOne)).toEqual(0);
            expect(craftingResult.consumed.amountFor(testComponentThree)).toEqual(0);

        });

    });

    describe('with a Crafting Check', () => {

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            supportedGameSystems: [GameSystem.DND5E],
            essences: essences,
            partDictionary: stubPartDictionary,
            craftingCheck: stubCraftingCheck,
            fabricator: stubFabricator,
            chatDialog: stubChatDialog
        });

        test('should succeed for recipe with sufficient components and successful check',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeOne.namedComponents);
            stubPerformMethod.returns(new SuccessfulCraftingCheckResult({result: 10, successThreshold: 10, expression: "1d20 + 5"}));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeOne);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof SuccessfulCraftingResult).toEqual(true);
            expect(craftingResult.created.size()).toEqual(1);
            expect(craftingResult.created.amountFor(testComponentFive)).toEqual(1);
            expect(craftingResult.consumed.size()).toEqual(3);
            expect(craftingResult.consumed.amountFor(testComponentOne)).toEqual(1);
            expect(craftingResult.consumed.amountFor(testComponentThree)).toEqual(2);

        });

        test('should fail for recipe with sufficient components and unsuccessful check',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeOne.namedComponents);
            stubPerformMethod.returns(new FailedCraftingCheckResult({result: 9, successThreshold: 11, expression: "1d20 + 5"}));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeOne);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof UnsuccessfulCraftingResult).toEqual(true);
            expect(craftingResult.created.size()).toEqual(0);
            expect(craftingResult.created.amountFor(testComponentFive)).toEqual(0);
            expect(craftingResult.consumed.size()).toEqual(3);
            expect(craftingResult.consumed.amountFor(testComponentOne)).toEqual(1);
            expect(craftingResult.consumed.amountFor(testComponentThree)).toEqual(2);

        });

    });

});
