import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {Fabricator} from "../src/scripts/core/Fabricator";
import {EssenceDefinition} from "../src/scripts/common/EssenceDefinition";
import {PartDictionary} from "../src/scripts/system/PartDictionary";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {GameSystem} from "../src/scripts/system/GameSystem";
import {Inventory} from "../src/scripts/actor/Inventory";
import {testRecipeOne} from "./test_data/TestRecipes";
import {NoCraftingCheck} from "../src/scripts/crafting/check/NoCraftingCheck";
import {ChatDialog} from "../src/scripts/interface/ChatDialog";
import {testComponentFive, testComponentOne, testComponentThree} from "./test_data/TestCraftingComponents";
import {SuccessfulCraftingResult} from "../src/scripts/crafting/result/SuccessfulCraftingResult";
import {Combination} from "../src/scripts/common/Combination";
import {NoCraftingResult} from "../src/scripts/crafting/result/NoCraftingResult";
import {UnsuccessfulCraftingResult} from "../src/scripts/crafting/result/UnsuccessfulCraftingResult";
import {CraftingCheck, DefaultCraftingCheck} from "../src/scripts/crafting/check/CraftingCheck";
import {DefaultThresholdCalculator} from "../src/scripts/crafting/check/ThresholdCalculator";
import {ThresholdType} from "../src/scripts/crafting/check/Threshold";
import {ContributionCounterFactory} from "../src/scripts/crafting/check/ContributionCounterFactory";
import {DiceRoller, RollResult} from "../src/scripts/foundry/DiceRoller";
import {RollTermProvider} from "../src/scripts/crafting/check/RollTermProvider";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const essences: EssenceDefinition[] = [elementalAir, elementalEarth, elementalFire, elementalWater];

const stubPartDictionary: PartDictionary = <PartDictionary><unknown>{

};

const stubChatDialog: ChatDialog = <ChatDialog><unknown>{
    send: () => {}
};
// const stubSendMethod = Sandbox.stub(stubChatDialog, 'send');

const stubDiceRoller: DiceRoller = <DiceRoller><unknown>{
    roll: () => {}
};
const stubRollMethod = Sandbox.stub(stubDiceRoller, 'roll');

const stubRollTermProvider: RollTermProvider<Actor> = <RollTermProvider<Actor>><unknown>{
    getFor: () => {}
};
const stubGetForMethod = Sandbox.stub(stubRollTermProvider, 'getFor');

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
            craftingCheck: new NoCraftingCheck(),
            fabricator: stubFabricator,
            chatDialog: stubChatDialog
        });
        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toEqual(true);
        expect(underTest.hasCraftingCheck).toEqual(true);
        expect(underTest.supportsAlchemy).toEqual(false);
        expect(underTest.essences).toEqual(expect.arrayContaining(essences));
        expect(underTest.supports(GameSystem.DND5E)).toEqual(true);
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

        test('should succeed for recipe with sufficient ingredients',async () => {

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

        test('should fail for recipe with insufficient ingredients',async () => {

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

        const contributionCounterFactory = new ContributionCounterFactory({
            ingredientContribution: 1,
            essenceContribution: 0
        });
        const contributionCounter = contributionCounterFactory.make();
        const thresholdCalculator = new DefaultThresholdCalculator({
            thresholdType: ThresholdType.MEET,
            baseValue: 8,
            contributionCounter: contributionCounter
        });
        const craftingCheck: CraftingCheck<Actor> = new DefaultCraftingCheck({
            diceRoller: stubDiceRoller,
            rollTermProvider: stubRollTermProvider,
            thresholdCalculator: thresholdCalculator
        });

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            supportedGameSystems: [GameSystem.DND5E],
            essences: essences,
            partDictionary: stubPartDictionary,
            craftingCheck: craftingCheck,
            fabricator: stubFabricator,
            chatDialog: stubChatDialog
        });

        test('should succeed for recipe with sufficient ingredients and successful check',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeOne.namedComponents);
            stubRollMethod.returns(new RollResult(11, "dummy dice expression"));
            stubGetForMethod.returns({
                faces: 20,
                number: 1,
                modifiers: [],
                options: {}
            });

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeOne);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof SuccessfulCraftingResult).toEqual(true);
            expect(craftingResult.created.size()).toEqual(1);
            expect(craftingResult.created.amountFor(testComponentFive)).toEqual(1);
            expect(craftingResult.consumed.size()).toEqual(3);
            expect(craftingResult.consumed.amountFor(testComponentOne)).toEqual(1);
            expect(craftingResult.consumed.amountFor(testComponentThree)).toEqual(2);

        });

        test('should fail for recipe with sufficient ingredients and unsuccessful check',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeOne.namedComponents);
            stubRollMethod.returns(new RollResult(10, "dummy dice expression"));
            stubGetForMethod.returns({
                faces: 20,
                number: 1,
                modifiers: [],
                options: {}
            });

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
