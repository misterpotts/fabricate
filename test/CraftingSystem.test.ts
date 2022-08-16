import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {EssenceDefinition} from "../src/scripts/common/EssenceDefinition";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {GameSystem} from "../src/scripts/system/GameSystem";
import {Inventory} from "../src/scripts/actor/Inventory";
import {testRecipeOne} from "./test_data/TestRecipes";
import {testComponentFive, testComponentOne, testComponentThree} from "./test_data/TestCraftingComponents";
import {Combination} from "../src/scripts/common/Combination";
import {CraftingCheck, DefaultCraftingCheck, NoCraftingCheck} from "../src/scripts/crafting/check/CraftingCheck";
import {DefaultThresholdCalculator, ThresholdType} from "../src/scripts/crafting/check/Threshold";
import {DiceRoller, RollResult} from "../src/scripts/foundry/DiceRoller";
import {RollProvider} from "../src/scripts/crafting/check/RollProvider";
import {testPartDictionary} from "./test_data/TestPartDictionary";
import {CraftingAttemptFactory, WastageType} from "../src/scripts/crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../src/scripts/crafting/selection/DefaultComponentSelectionStrategy";
import {ContributionCounterFactory} from "../src/scripts/crafting/check/ContributionCounter";
import {
    NoCraftingResult,
    SuccessfulCraftingResult,
    UnsuccessfulCraftingResult
} from "../src/scripts/crafting/result/CraftingResult";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const essences: EssenceDefinition[] = [elementalAir, elementalEarth, elementalFire, elementalWater];

const stubDiceRoller: DiceRoller = <DiceRoller><unknown>{
    roll: () => {}
};
const stubRollMethod = Sandbox.stub(stubDiceRoller, 'evaluate');

const stubRollTermProvider: RollProvider<Actor> = <RollProvider<Actor>><unknown>{
    getFor: () => {}
};
const stubGetForMethod = Sandbox.stub(stubRollTermProvider, 'getFor');

const stubActor: Actor<Actor.Data, Item<Item.Data>> = <Actor<Actor.Data, Item<Item.Data>>><unknown>{};

const craftingAttemptFactory: CraftingAttemptFactory = new CraftingAttemptFactory({
    selectionStrategy: new DefaultComponentSelectionStrategy(),
    wastageType: WastageType.PUNITIVE
});

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
            gameSystem: GameSystem.DND5E,
            essences: essences,
            partDictionary: testPartDictionary,
            craftingCheck: new NoCraftingCheck(),
            craftingAttemptFactory: craftingAttemptFactory
        });
        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toEqual(true);
        expect(underTest.hasCraftingCheck).toEqual(true);
        expect(underTest.supportsAlchemy).toEqual(false);
        expect(underTest.essences).toEqual(expect.arrayContaining(essences));
        expect(underTest.supports(GameSystem.DND5E)).toEqual(true);
        expect(underTest.gameSystem).toEqual(GameSystem.DND5E);
    });

});

describe('Crafting ', () => {

    describe('without a Crafting Check', () => {

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            gameSystem: GameSystem.DND5E,
            essences: essences,
            partDictionary: testPartDictionary,
            craftingCheck: new NoCraftingCheck(),
            craftingAttemptFactory: craftingAttemptFactory
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
            rollProvider: stubRollTermProvider,
            thresholdCalculator: thresholdCalculator
        });

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            id: testSystemId,
            enabled: true,
            gameSystem: GameSystem.DND5E,
            essences: essences,
            partDictionary: testPartDictionary,
            craftingCheck: craftingCheck,
            craftingAttemptFactory: craftingAttemptFactory
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
