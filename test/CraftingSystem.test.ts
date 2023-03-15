import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {Inventory} from "../src/scripts/actor/Inventory";
import {testRecipeTwo} from "./test_data/TestRecipes";
import {
    testComponentFive, testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingCheck, DefaultCraftingCheck} from "../src/scripts/crafting/check/CraftingCheck";
import {DefaultThresholdCalculator, ThresholdType} from "../src/scripts/crafting/check/Threshold";
import {DiceRoller, RollResult} from "../src/scripts/foundry/DiceRoller";
import {GameSystemRollModifierProvider} from "../src/scripts/crafting/check/GameSystemRollModifierProvider";
import {testPartDictionary} from "./test_data/TestPartDictionary";
import {RecipeCraftingPrepFactory} from "../src/scripts/crafting/attempt/RecipeCraftingPrepFactory";
import {ContributionCounterFactory} from "../src/scripts/crafting/check/ContributionCounter";
import {
    NoCraftingResult,
    DefaultCraftingResult
} from "../src/scripts/crafting/result/CraftingResult";
import {ComponentConsumptionCalculatorFactory, WastageType} from "../src/scripts/common/ComponentConsumptionCalculator";
import {DefaultAlchemyAttemptFactory} from "../src/scripts/crafting/alchemy/AlchemyAttemptFactory";
import {AlchemicalCombiner5e} from "../src/scripts/5e/AlchemicalEffect5E";
import {CraftingSystemDetails} from "../src/scripts/system/CraftingSystemDetails";
import {DefaultComponentSelectionStrategy} from "../src/scripts/crafting/selection/ComponentSelectionStrategy";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const stubDiceRoller: DiceRoller = <DiceRoller><unknown>{
    roll: () => {},
    evaluate: () => {},
    createUnmodifiedRoll: () => {}
};
const stubEvaluateMethod = Sandbox.stub(stubDiceRoller, 'evaluate');

const stubRollTermProvider: GameSystemRollModifierProvider<Actor> = <GameSystemRollModifierProvider<Actor>><unknown>{
    getForActor: () => {}
};

const stubActor: Actor = <Actor><unknown>{};

const craftingAttemptFactory: RecipeCraftingPrepFactory = new RecipeCraftingPrepFactory({
    selectionStrategy: new DefaultComponentSelectionStrategy()
});

const stubInventory: Inventory = <Inventory><unknown>{
    acceptCraftingResult: () => {},
    ownedComponents: {}
};

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create and configure', () => {

    test('Should create a new Crafting System with no checks and alchemy disabled',() => {

        const testSystemId = `fabricate-test-system`;

        const underTest = new CraftingSystem({
            details: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            enabled: true,
            locked: false,
            partDictionary: testPartDictionary,
            craftingAttemptFactory: craftingAttemptFactory
        });

        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toEqual(true);
        expect(underTest.hasAlchemyCraftingCheck).toEqual(false);
        expect(underTest.hasRecipeCraftingCheck).toEqual(false);
        expect(underTest.supportsAlchemy).toEqual(false);

    });

    test('Should create a new Crafting System with checks and support for alchemy',() => {

        const testSystemId = `fabricate-test-system`;

        const defaultCraftingCheck = new DefaultCraftingCheck({
            diceRoller: stubDiceRoller,
            gameSystemRollModifierProvider: stubRollTermProvider,
            thresholdCalculator: new DefaultThresholdCalculator({
                thresholdType: ThresholdType.MEET,
                baseValue: 8,
                contributionCounter: new ContributionCounterFactory({
                    ingredientContribution: 0,
                    essenceContribution: 2
                }).make()
            })
        });
        const underTest = new CraftingSystem({
            details: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            enabled: true,
            locked: false,
            partDictionary: testPartDictionary,
            craftingAttemptFactory: craftingAttemptFactory,
            alchemyAttemptFactory: new DefaultAlchemyAttemptFactory({
                alchemyFormulae: [],
                constraints: {
                    components: {
                        min: 1,
                        max: 10
                    },
                    effects: {
                        min: 1,
                        max: 10
                    }
                },
                alchemicalCombiner: new AlchemicalCombiner5e(),
                componentConsumptionCalculator: new ComponentConsumptionCalculatorFactory().make(WastageType.PUNITIVE)
            }),
            craftingChecks: {
                recipe: defaultCraftingCheck,
                alchemy: defaultCraftingCheck
            }
        });

        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toEqual(true);
        expect(underTest.hasAlchemyCraftingCheck).toEqual(true);
        expect(underTest.hasRecipeCraftingCheck).toEqual(true);
        expect(underTest.supportsAlchemy).toEqual(true);

    });

});

describe.skip('Crafting ', () => {

    describe('without a Crafting Check', () => {

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            details: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            enabled: true,
            locked: false,
            partDictionary: testPartDictionary,
            craftingAttemptFactory: craftingAttemptFactory
        });

        test('should succeed for recipe with sufficient ingredients',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeTwo.ingredientOptions[0].ingredients.combineWith(testRecipeTwo.ingredientOptions[0].catalysts));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeTwo);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof DefaultCraftingResult).toEqual(true);
            expect(craftingResult.created.size).toEqual(2);
            expect(craftingResult.created.amountFor(testComponentTwo.id)).toEqual(2);
            expect(craftingResult.consumed.size).toEqual(1);
            expect(craftingResult.consumed.amountFor(testComponentFour.id)).toEqual(1);

        });

        test('should fail for recipe with insufficient ingredients',async () => {

            Sinon.stub(stubInventory, 'ownedComponents')
                .get(() => Combination.ofUnits([
                    new Unit(testComponentOne, 1),
                    new Unit(testComponentThree, 2)
                ]));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeTwo);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof NoCraftingResult).toEqual(true);
            expect(craftingResult.created.size).toEqual(0);
            expect(craftingResult.created.amountFor(testComponentFive.id)).toEqual(0);
            expect(craftingResult.consumed.size).toEqual(0);
            expect(craftingResult.consumed.amountFor(testComponentOne.id)).toEqual(0);
            expect(craftingResult.consumed.amountFor(testComponentThree.id)).toEqual(0);

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
            gameSystemRollModifierProvider: stubRollTermProvider,
            thresholdCalculator: thresholdCalculator
        });

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            details: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            enabled: true,
            locked: false,
            partDictionary: testPartDictionary,
            craftingChecks: {
                recipe: craftingCheck
            },
            craftingAttemptFactory: craftingAttemptFactory
        });

        test('should succeed for recipe with sufficient ingredients and successful check',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeTwo.getSelectedIngredients().ingredients.combineWith(testRecipeTwo.getSelectedIngredients().catalysts));
            stubEvaluateMethod.returns(new RollResult(11, "dummy dice expression"));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeTwo);

            expect(craftingResult).not.toBeNull();
            expect(craftingResult instanceof DefaultCraftingResult).toEqual(true);

        });

        test('should fail for recipe with sufficient ingredients and unsuccessful check',async () => {

            Sinon.stub(stubInventory, 'ownedComponents').get(() => testRecipeTwo.getSelectedIngredients().ingredients.combineWith(testRecipeTwo.getSelectedIngredients().catalysts));
            stubEvaluateMethod.returns(new RollResult(8, "dummy dice expression"));

            const craftingResult = await underTest.craft(stubActor, stubInventory, testRecipeTwo);

            expect(craftingResult).not.toBeNull();

        });

    });

});
