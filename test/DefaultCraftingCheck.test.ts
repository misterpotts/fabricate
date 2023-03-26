import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";

import {DiceRoller, RollResult} from "../src/scripts/foundry/DiceRoller";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {DefaultCraftingCheck} from "../src/scripts/crafting/check/CraftingCheck";
import {DefaultThresholdCalculator, ThresholdType} from "../src/scripts/crafting/check/Threshold";
import {ContributionCounterFactory} from "../src/scripts/crafting/check/ContributionCounter";
import {GameSystemRollModifierProvider} from "../src/scripts/crafting/check/GameSystemRollModifierProvider";
import {Component} from "../src/scripts/crafting/component/Component";
import {testComponentFour, testComponentTwo} from "./test_data/TestCraftingComponents";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const stubDiceRoller: DiceRoller = <DiceRoller><unknown>{
    evaluate: () => {},
    createUnmodifiedRoll: () => {}
};
const stubEvaluateMethod = Sandbox.stub(stubDiceRoller, "evaluate");

const stubRollModifierProvider: GameSystemRollModifierProvider<any> = <GameSystemRollModifierProvider<any>><unknown>{
    getForActor: () => {}
};

const stubActor: Actor = <Actor><unknown>{}

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe("Create", () => {

    test("Should create a Crafting Check 5e",() => {

        const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
            thresholdCalculator: new DefaultThresholdCalculator({
                thresholdType: ThresholdType.MEET,
                contributionCounter: new ContributionCounterFactory({
                    essenceContribution: 0,
                    ingredientContribution: 0
                }).make(),
                baseValue: 10
            }),
            gameSystemRollModifierProvider: stubRollModifierProvider,
            diceRoller: stubDiceRoller
        });

        expect(underTest).not.toBeNull();

    });

});

describe("Perform", () => {
    
    describe("should fail with", () => {

        test("empty combination and roll does not meet threshold", () => {

            const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
                thresholdCalculator: new DefaultThresholdCalculator({
                    thresholdType: ThresholdType.MEET,
                    contributionCounter: new ContributionCounterFactory({
                        essenceContribution: 0,
                        ingredientContribution: 0
                    }).make(),
                    baseValue: 10
                }),
                gameSystemRollModifierProvider: stubRollModifierProvider,
                diceRoller: stubDiceRoller
            });

            stubEvaluateMethod.returns(new RollResult(9, "1d20"));

            const result = underTest.perform(stubActor, Combination.EMPTY());

            expect(result.result).toEqual(9);
            expect(result.expression).toEqual("1d20");
            expect(result.successThreshold).toEqual(10);
            expect(result.isSuccessful).toEqual(false);

        });

        test("empty combination and roll does not exceed threshold", () => {

            const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
                thresholdCalculator: new DefaultThresholdCalculator({
                    thresholdType: ThresholdType.EXCEED,
                    contributionCounter: new ContributionCounterFactory({
                        essenceContribution: 0,
                        ingredientContribution: 0
                    }).make(),
                    baseValue: 10
                }),
                gameSystemRollModifierProvider: stubRollModifierProvider,
                diceRoller: stubDiceRoller
            });

            stubEvaluateMethod.returns(new RollResult(10, "1d20"));

            const result = underTest.perform(stubActor, Combination.EMPTY());

            expect(result.result).toEqual(10);
            expect(result.expression).toEqual("1d20");
            expect(result.successThreshold).toEqual(11);
            expect(result.isSuccessful).toEqual(false);

        });

    });

    describe("should succeed with", () => {

        test("empty combination and roll meets threshold", () => {

            const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
                thresholdCalculator: new DefaultThresholdCalculator({
                    thresholdType: ThresholdType.MEET,
                    contributionCounter: new ContributionCounterFactory({
                        essenceContribution: 0,
                        ingredientContribution: 0
                    }).make(),
                    baseValue: 10
                }),
                gameSystemRollModifierProvider: stubRollModifierProvider,
                diceRoller: stubDiceRoller
            });

            stubEvaluateMethod.returns(new RollResult(10, "1d20"));

            const result = underTest.perform(stubActor, Combination.EMPTY());

            expect(result.result).toEqual(10);
            expect(result.expression).toEqual("1d20");
            expect(result.successThreshold).toEqual(10);
            expect(result.isSuccessful).toEqual(true);

        });

        test("empty combination and roll exceeds threshold", () => {

            const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
                thresholdCalculator: new DefaultThresholdCalculator({
                    thresholdType: ThresholdType.EXCEED,
                    contributionCounter: new ContributionCounterFactory({
                        essenceContribution: 0,
                        ingredientContribution: 0
                    }).make(),
                    baseValue: 10
                }),
                gameSystemRollModifierProvider: stubRollModifierProvider,
                diceRoller: stubDiceRoller
            });

            stubEvaluateMethod.returns(new RollResult(11, "1d20"));

            const result = underTest.perform(stubActor, Combination.EMPTY());

            expect(result.result).toEqual(11);
            expect(result.expression).toEqual("1d20");
            expect(result.successThreshold).toEqual(11);
            expect(result.isSuccessful).toEqual(true);

        });

    });

    describe("should calculate threshold with", () => {

        test("ingredients add 2 and essences add 1 to be 7 greater than the base threshold when meeting", () => {

            const baseValue = 10;
            const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
                thresholdCalculator: new DefaultThresholdCalculator({
                    thresholdType: ThresholdType.MEET,
                    contributionCounter: new ContributionCounterFactory({
                        essenceContribution: 1,
                        ingredientContribution: 2
                    }).make(),
                    baseValue: baseValue
                }),
                gameSystemRollModifierProvider: stubRollModifierProvider,
                diceRoller: stubDiceRoller
            });

            stubEvaluateMethod.returns(new RollResult(11, "1d20"));

            const ingredients = Combination.ofUnits([
                new Unit<Component>(testComponentFour, 1),
                new Unit<Component>(testComponentTwo, 1)
            ])

            const result = underTest.perform(stubActor, ingredients);

            expect(result.result).toEqual(11);
            expect(result.expression).toEqual("1d20");
            expect(result.successThreshold).toEqual(baseValue + 8);
            expect(result.isSuccessful).toEqual(false);

        });

        test("ingredients add 2 and essences add 1 to be 8 greater than the base threshold when exceeding", () => {

            const baseValue = 10;
            const underTest: DefaultCraftingCheck<any> = new DefaultCraftingCheck<any>({
                thresholdCalculator: new DefaultThresholdCalculator({
                    thresholdType: ThresholdType.EXCEED,
                    contributionCounter: new ContributionCounterFactory({
                        essenceContribution: 1,
                        ingredientContribution: 2
                    }).make(),
                    baseValue: baseValue
                }),
                gameSystemRollModifierProvider: stubRollModifierProvider,
                diceRoller: stubDiceRoller
            });

            stubEvaluateMethod.returns(new RollResult(11, "1d20"));

            const ingredients = Combination.ofUnits([
                new Unit<Component>(testComponentFour, 1),
                new Unit<Component>(testComponentTwo, 1)
            ])

            const result = underTest.perform(stubActor, ingredients);

            expect(result.result).toEqual(11);
            expect(result.expression).toEqual("1d20");
            expect(result.successThreshold).toEqual(baseValue + 9);
            expect(result.isSuccessful).toEqual(false);

        });

    });

});

