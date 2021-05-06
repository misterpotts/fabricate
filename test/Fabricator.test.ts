import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";

import {Inventory} from "../src/scripts/actor/Inventory";
import {Fabricator} from "../src/scripts/core/Fabricator";
import {AlchemicalCombiner} from "../src/scripts/crafting/alchemy/AlchemicalCombiner";
import {CraftingCheck} from "../src/scripts/crafting/CraftingCheck";
import {Recipe} from "../src/scripts/crafting/Recipe";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";
import {FabricationOutcome} from "../src/scripts/core/FabricationOutcome";
import {EssenceDefinition} from "../src/scripts/common/EssenceDefinition";
import {CraftingCheckResult} from "../src/scripts/crafting/CraftingCheckResult";
import {OutcomeType} from "../src/scripts/core/OutcomeType";
import {ActionType, FabricationAction} from "../src/scripts/core/FabricationAction";
import {AlchemyError} from "../src/scripts/error/AlchemyError";

import {elementalAir, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import { testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive} from "./test_data/TestCraftingComponents";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockActor: Actor<Actor.Data, Item<Item.Data>> = <Actor<Actor.Data, Item<Item.Data>>><unknown>{};

const mockInventory: Inventory<any, Actor<Actor.Data, Item<Item.Data>>> = <Inventory<any, Actor<Actor.Data, Item<Item.Data>>>><unknown>{
    actor: Sandbox.stub(),
    ownedComponents: Sandbox.stub(),
    containsIngredients: () => {},
    containsEssences: () => {},
    selectFor: () => {},
    excluding: () => {},
    perform: () => {}
};
const stubInventoryExcludingMethod = Sandbox.stub(mockInventory, 'excluding');
const stubInventoryContainsIngredientsMethod = Sandbox.stub(mockInventory, 'containsIngredients');
const stubInventorySelectForMethod = Sandbox.stub(mockInventory, 'selectFor');
const stubInventoryPerformMethod = Sandbox.stub(mockInventory, 'perform');
const stubInventoryContainsEssencesMethod = Sandbox.stub(mockInventory, 'containsEssences');

const mockAlchemicalCombiner: AlchemicalCombiner<any> = <AlchemicalCombiner<any>><unknown>{
    perform: () => {},
    baseComponent: testComponentFive
}
const stubAlchemicalCombinerPerformMethod = Sandbox.stub(mockAlchemicalCombiner, 'perform');

const mockCraftingCheck: CraftingCheck<any> = <CraftingCheck<any>><unknown>{
    perform: () => {}
};
const stubPerformCraftingCheckMethod = Sandbox.stub(mockCraftingCheck, 'perform');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
    stubInventoryExcludingMethod.returns(mockInventory);
});

describe('Create and configure', () => {

    test('Should create a Fabricator supporting checks and alchemy', () => {
        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .withCraftingCheck(mockCraftingCheck)
            .build();

        expect(underTest).not.toBeNull();
        expect(underTest.hasCraftingCheck).toBe(true);
        expect(underTest.supportsAlchemy).toBe(true);
    });

    test('Should create a Fabricator supporting checks only', () => {
        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withConsumeComponentsOnFailure(true)
            .withCraftingCheck(mockCraftingCheck)
            .build();

        expect(underTest).not.toBeNull();
        expect(underTest.hasCraftingCheck).toBe(true);
        expect(underTest.supportsAlchemy).toBe(false);
    });

    test('Should create a Fabricator supporting alchemy only', () => {
        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .build();

        expect(underTest).not.toBeNull();
        expect(underTest.hasCraftingCheck).toBe(false);
        expect(underTest.supportsAlchemy).toBe(true);
    });

    test('Should create a Fabricator supporting neither checks or alchemy', () => {
        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withConsumeComponentsOnFailure(true)
            .build();

        expect(underTest).not.toBeNull();
        expect(underTest.hasCraftingCheck).toBe(false);
        expect(underTest.supportsAlchemy).toBe(false);
    });

});

describe('Fabricate', () => {

    /* =================================================================================================================================================
     * ALL FABRICATION SCENARIOS
     * ================================================================================================================================================= */

    const testIngredientBasedRecipe: Recipe = Recipe.builder()
        .withName('Test Ingredient-Based Recipe')
        .withPartId('abc123')
        .withCompendiumId('fabricate.test-system')
        .withImageUrl('/img/img.png')
        .withIngredients(Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentThree, 1),
            new Unit<CraftingComponent>(testComponentFour, 2)
        ]))
        .withResults(Combination.of(testComponentTwo, 1))
        .build();

    const testIngredientBasedRecipeWithCatalyst: Recipe = Recipe.builder()
        .withName('Test Ingredient-Based Recipe with Catalyst')
        .withPartId('abc234')
        .withCompendiumId('fabricate.test-system')
        .withImageUrl('/img/img.png')
        .withIngredients(Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentThree, 1),
            new Unit<CraftingComponent>(testComponentFour, 2)
        ]))
        .withCatalysts(Combination.of(testComponentOne, 1))
        .withResults(Combination.of(testComponentTwo, 1))
        .build();

    const testEssenceBasedRecipe: Recipe = Recipe.builder()
        .withName('Test Essence-Based Recipe ')
        .withPartId('abc345')
        .withCompendiumId('fabricate.test-system')
        .withImageUrl('/img/img.png')
        .withEssences(Combination.ofUnits([
            new Unit<EssenceDefinition>(elementalWater, 2),
            new Unit<EssenceDefinition>(elementalFire, 2),
            new Unit<EssenceDefinition>(elementalAir, 1)
        ]))
        .withResults(Combination.of(testComponentFour, 1))
        .build();

    /* =================================================================================================================================================
     * ALL FABRICATION SCENARIOS
     * ================================================================================================================================================= */

    describe('Recipes', () => {

        /* =================================================================================================================================================
         * RECIPE CRAFTING SCENARIOS
         * ================================================================================================================================================= */

        describe('Success', () => {

            /* =================================================================================================================================================
             * RECIPE CRAFTING SUCCESS SCENARIOS
             * ================================================================================================================================================= */

            test('Should add and remove components through Inventory with no Crafting Check', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(true);
                stubInventoryContainsEssencesMethod.returns(true);
                stubInventorySelectForMethod.returns(Combination.EMPTY());

                const mockModifiedItems: Item<Item.Data>[] = [
                    <Item<Item.Data>><unknown>{id: '1'},
                    <Item<Item.Data>><unknown>{id: '2'},
                    <Item<Item.Data>><unknown>{id: '3'}
                ];
                stubInventoryPerformMethod.resolves(mockModifiedItems);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testIngredientBasedRecipe);

                Sandbox.assert.calledOnce(stubInventoryContainsIngredientsMethod);
                Sandbox.assert.calledWith(stubInventoryContainsIngredientsMethod, Sandbox.match((value: Combination<CraftingComponent>) => {
                    return value.size() === 3
                        && value.amountFor(testComponentThree) === 1
                        && value.amountFor(testComponentFour) === 2;
                }));

                Sandbox.assert.calledOnce(stubInventorySelectForMethod);
                Sandbox.assert.calledWith(stubInventorySelectForMethod, Sandbox.match((value: Combination<EssenceDefinition>) => value.isEmpty()));

                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const threeActions: boolean = value.length === 3;
                    const addOneTestComponentTwo: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.ADD
                        && action.unit.part.id === testComponentTwo.id
                        && action.unit.quantity === 1);
                    const removeTwoTestComponentFour: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentFour.id
                        && action.unit.quantity === 2);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    return threeActions && addOneTestComponentTwo && removeTwoTestComponentFour && removeOneTestComponentThree;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(3);
                expect(result.outcome).toEqual(OutcomeType.SUCCESS);
            });

            test('Should add and remove Ingredients (but not catalysts) through Inventory with successful Crafting Check', async () => {
                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(true);
                stubInventoryContainsEssencesMethod.returns(true);
                stubInventorySelectForMethod.returns(Combination.EMPTY());

                const mockCheckResult: CraftingCheckResult = new CraftingCheckResult(OutcomeType.SUCCESS, '1d20+1', 11, 10);
                stubPerformCraftingCheckMethod.returns(mockCheckResult);

                const mockModifiedItems: Item<Item.Data>[] = [
                    <Item<Item.Data>><unknown>{id: '1'},
                    <Item<Item.Data>><unknown>{id: '2'},
                    <Item<Item.Data>><unknown>{id: '3'}
                ];
                stubInventoryPerformMethod.resolves(mockModifiedItems);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testIngredientBasedRecipeWithCatalyst);

                Sandbox.assert.calledOnce(stubInventoryContainsIngredientsMethod);
                Sandbox.assert.calledWith(stubInventoryContainsIngredientsMethod, Sandbox.match((value: Combination<CraftingComponent>) => {
                    return value.size() === 4
                        && value.amountFor(testComponentOne) === 1
                        && value.amountFor(testComponentThree) === 1
                        && value.amountFor(testComponentFour) === 2;
                }));

                Sandbox.assert.calledOnce(stubInventorySelectForMethod);
                Sandbox.assert.calledWith(stubInventorySelectForMethod, Sandbox.match((value: Combination<EssenceDefinition>) => value.isEmpty()));

                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const threeActions: boolean = value.length === 3;
                    const addOneTestComponentTwo: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.ADD
                        && action.unit.part.id === testComponentTwo.id
                        && action.unit.quantity === 1);
                    const removeTwoTestComponentFour: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentFour.id
                        && action.unit.quantity === 2);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    return threeActions && addOneTestComponentTwo && removeTwoTestComponentFour && removeOneTestComponentThree;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(3);
                expect(result.checkResult).toEqual(mockCheckResult);
                expect(result.outcome).toEqual(OutcomeType.SUCCESS);
            });

            test('Should add and remove Ingredients through Inventory with successful Crafting Check for Recipe requiring Essences', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(true);
                stubInventoryContainsEssencesMethod.returns(true);
                stubInventorySelectForMethod.returns(Combination.ofUnits([
                    new Unit<CraftingComponent>(testComponentOne, 3),
                    new Unit<CraftingComponent>(testComponentThree, 1)
                ]));

                const mockModifiedItems: Item<Item.Data>[] = [
                    <Item<Item.Data>><unknown>{id: '1'},
                    <Item<Item.Data>><unknown>{id: '2'},
                    <Item<Item.Data>><unknown>{id: '3'}
                ];
                stubInventoryPerformMethod.resolves(mockModifiedItems);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testEssenceBasedRecipe);

                Sandbox.assert.notCalled(stubInventoryContainsIngredientsMethod);

                Sandbox.assert.calledOnce(stubInventorySelectForMethod);
                Sandbox.assert.calledWith(stubInventorySelectForMethod, Sandbox.match((value: Combination<EssenceDefinition>) => {
                    return value.size() === 5
                        && value.amountFor(elementalWater) === 2
                        && value.amountFor(elementalFire) === 2
                        && value.amountFor(elementalAir) === 1;
                }));

                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const threeActions: boolean = value.length === 3;
                    const addOneTestComponentFour: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.ADD
                        && action.unit.part.id === testComponentFour.id
                        && action.unit.quantity === 1);
                    const removeThreeTestComponentOne: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentOne.id
                        && action.unit.quantity === 3);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    return threeActions && addOneTestComponentFour && removeThreeTestComponentOne && removeOneTestComponentThree;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(3);
                expect(result.outcome).toEqual(OutcomeType.SUCCESS);
            });

        });

        /* =================================================================================================================================================
         * RECIPE CRAFTING FAILURE SCENARIOS
         * ================================================================================================================================================= */

        describe('Failure', () => {

            test('Should abort when Inventory does not contain components', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(false);
                stubInventoryContainsEssencesMethod.returns(true);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testIngredientBasedRecipe);

                Sandbox.assert.notCalled(stubInventoryExcludingMethod);
                Sandbox.assert.notCalled(stubInventorySelectForMethod);
                Sandbox.assert.notCalled(stubInventoryPerformMethod);

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(0);
                expect(result.outcome).toEqual(OutcomeType.NOT_ATTEMPTED);
                expect(result.message).toEqual(`You don't have all of the ingredients for ${testIngredientBasedRecipe.name}. `);

            });

            test('Should abort when Inventory does not contain essences across owned components', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(true);
                stubInventoryContainsEssencesMethod.returns(false);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testEssenceBasedRecipe);

                Sandbox.assert.notCalled(stubInventorySelectForMethod);
                Sandbox.assert.notCalled(stubInventoryPerformMethod);

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(0);
                expect(result.outcome).toEqual(OutcomeType.NOT_ATTEMPTED);
                expect(result.message).toEqual(`There aren't enough essences amongst components in your inventory to craft ${testEssenceBasedRecipe.name}. `);

            });

            test('Should remove, but not add components when set to consume components on failure', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(true);
                stubInventoryContainsEssencesMethod.returns(true);
                stubInventorySelectForMethod.returns(Combination.EMPTY());

                const mockCheckResult: CraftingCheckResult = new CraftingCheckResult(OutcomeType.FAILURE, '1d20+1', 13, 14);
                stubPerformCraftingCheckMethod.returns(mockCheckResult);

                const mockModifiedItems: Item<Item.Data>[] = [
                    <Item<Item.Data>><unknown>{id: '1'},
                    <Item<Item.Data>><unknown>{id: '2'}
                ];
                stubInventoryPerformMethod.resolves(mockModifiedItems);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testIngredientBasedRecipe);

                Sandbox.assert.calledOnce(stubInventoryContainsIngredientsMethod);
                Sandbox.assert.calledWith(stubInventoryContainsIngredientsMethod, Sandbox.match((value: Combination<CraftingComponent>) => {
                    return value.size() === 3
                        && value.amountFor(testComponentThree) === 1
                        && value.amountFor(testComponentFour) === 2;
                }));

                Sandbox.assert.calledOnce(stubInventorySelectForMethod);
                Sandbox.assert.calledWith(stubInventorySelectForMethod, Sandbox.match((value: Combination<EssenceDefinition>) => value.isEmpty()));

                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const twoActions: boolean = value.length === 2;
                    const removeTwoTestComponentFour: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentFour.id
                        && action.unit.quantity === 2);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    return twoActions && removeTwoTestComponentFour && removeOneTestComponentThree;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(2);
                expect(result.outcome).toEqual(OutcomeType.FAILURE);
                expect(result.message).toEqual('Your crafting attempt was unsuccessful! The ingredients were wasted. ');
            });

            test('Should not add or remove components when not set to consume components on failure', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(false)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                stubInventoryContainsIngredientsMethod.returns(true);
                stubInventoryContainsEssencesMethod.returns(true);
                stubInventorySelectForMethod.returns(Combination.EMPTY());

                const mockCheckResult: CraftingCheckResult = new CraftingCheckResult(OutcomeType.FAILURE, '1d20+1', 13, 14);
                stubPerformCraftingCheckMethod.returns(mockCheckResult);

                const result: FabricationOutcome = await underTest.followRecipe(mockActor, mockInventory, testIngredientBasedRecipe);

                Sandbox.assert.calledOnce(stubInventoryContainsIngredientsMethod);
                Sandbox.assert.calledWith(stubInventoryContainsIngredientsMethod, Sandbox.match((value: Combination<CraftingComponent>) => {
                    return value.size() === 3
                        && value.amountFor(testComponentThree) === 1
                        && value.amountFor(testComponentFour) === 2;
                }));

                Sandbox.assert.calledOnce(stubInventorySelectForMethod);
                Sandbox.assert.calledWith(stubInventorySelectForMethod, Sandbox.match((value: Combination<EssenceDefinition>) => value.isEmpty()));

                Sandbox.assert.notCalled(stubInventoryPerformMethod);

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(0);
                expect(result.outcome).toEqual(OutcomeType.FAILURE);
                expect(result.message).toEqual('Your crafting attempt was unsuccessful! No ingredients were consumed. ');

            });

        });

    });

    describe('Alchemy', () => {

        /* =================================================================================================================================================
         * ALCHEMY CRAFTING SCENARIOS
         * ================================================================================================================================================= */

        describe('Success', () => {

            /* =================================================================================================================================================
             * ALCHEMY CRAFTING SUCCESS SCENARIOS
             * ================================================================================================================================================= */

            test('Should add and remove components through Inventory', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(false)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                const mockCheckResult: CraftingCheckResult = new CraftingCheckResult(OutcomeType.SUCCESS, '1d20+1', 15, 14);
                stubPerformCraftingCheckMethod.returns(mockCheckResult);

                stubAlchemicalCombinerPerformMethod.resolves([new Unit<CraftingComponent>(testComponentTwo, 1), <Item.Data><unknown>{
                    data: {
                        specialProperty: 'specialValue'
                    }
                }])

                const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                    new Unit<CraftingComponent>(testComponentOne, 2),
                    new Unit<CraftingComponent>(testComponentThree, 1)
                ]);
                const result: FabricationOutcome = await underTest.performAlchemy(testComponentFive, testCombination, mockActor, mockInventory);

                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const threeActions: boolean = value.length === 3;
                    const removeTwoTestComponentOne: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentOne.id
                        && action.unit.quantity === 2);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    const addOneTestComponentTwoWithCustomData: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.ADD
                        && action.unit.part.id === testComponentTwo.id
                        && action.unit.quantity === 1
                        && action.itemData.data.specialProperty === 'specialValue');
                    return threeActions && removeTwoTestComponentOne && removeOneTestComponentThree && addOneTestComponentTwoWithCustomData;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(3);
                expect(result.outcome).toEqual(OutcomeType.SUCCESS);

            });

        })

        describe('Failure', () => {

            /* =================================================================================================================================================
             * ALCHEMY CRAFTING FAILURE SCENARIOS
             * ================================================================================================================================================= */

            test('Should fail when Alchemical Combiner finds too few essence matches', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                    new Unit<CraftingComponent>(testComponentOne, 2),
                    new Unit<CraftingComponent>(testComponentThree, 1)
                ]);

                const alchemyError = new AlchemyError(`Too few Alchemical Effects were produced by mixing the provided Components. A minimum of 1 was required, but only 0 were found. `, testCombination, true);
                stubAlchemicalCombinerPerformMethod.throws(() => {
                    return alchemyError;
                });

                const result: FabricationOutcome = await underTest.performAlchemy(testComponentFive, testCombination, mockActor, mockInventory);

                Sandbox.assert.notCalled(stubPerformCraftingCheckMethod);
                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const twoActions: boolean = value.length === 2;
                    const removeTwoTestComponentOne: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentOne.id
                        && action.unit.quantity === 2);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    return twoActions && removeTwoTestComponentOne && removeOneTestComponentThree;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(2);
                expect(result.outcome).toEqual(OutcomeType.FAILURE);
                expect(result.message).toEqual(alchemyError.message);
                expect(result.checkResult).toBeUndefined();

            });

            test('Should fail without removing components when set not to when Alchemical Combiner finds too few essence matches', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(false)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                    new Unit<CraftingComponent>(testComponentOne, 2),
                    new Unit<CraftingComponent>(testComponentThree, 1)
                ]);

                const alchemyError = new AlchemyError(`Too few Alchemical Effects were produced by mixing the provided Components. A minimum of 1 was required, but only 0 were found. `, testCombination, true);
                stubAlchemicalCombinerPerformMethod.throws(() => {
                    return alchemyError;
                });

                const result: FabricationOutcome = await underTest.performAlchemy(testComponentFive, testCombination, mockActor, mockInventory);

                Sandbox.assert.notCalled(stubPerformCraftingCheckMethod);
                Sandbox.assert.notCalled(stubInventoryPerformMethod);

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(0);
                expect(result.outcome).toEqual(OutcomeType.FAILURE);
                expect(result.message).toEqual(alchemyError.message);
                expect(result.checkResult).toBeUndefined();

            });

            test('Should fail and removing components when set to when Crafting Check Fails', async () => {

                const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
                    .withAlchemicalCombiner(mockAlchemicalCombiner)
                    .withConsumeComponentsOnFailure(true)
                    .withCraftingCheck(mockCraftingCheck)
                    .build();

                const mockCheckResult: CraftingCheckResult = new CraftingCheckResult(OutcomeType.FAILURE, '1d20+1', 13, 16);
                stubPerformCraftingCheckMethod.returns(mockCheckResult);

                const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                    new Unit<CraftingComponent>(testComponentOne, 2),
                    new Unit<CraftingComponent>(testComponentThree, 1)
                ]);

                const result: FabricationOutcome = await underTest.performAlchemy(testComponentFive, testCombination, mockActor, mockInventory);

                Sandbox.assert.calledOnce(stubPerformCraftingCheckMethod);
                Sandbox.assert.calledOnce(stubAlchemicalCombinerPerformMethod);
                Sandbox.assert.calledOnce(stubInventoryPerformMethod);
                Sandbox.assert.calledWith(stubInventoryPerformMethod, Sandbox.match((value: FabricationAction<any>[]) => {
                    const twoActions: boolean = value.length === 2;
                    const removeTwoTestComponentOne: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentOne.id
                        && action.unit.quantity === 2);
                    const removeOneTestComponentThree: boolean = !!value.find((action: FabricationAction<any>) => action.actionType === ActionType.REMOVE
                        && action.unit.part.id === testComponentThree.id
                        && action.unit.quantity === 1);
                    return twoActions && removeTwoTestComponentOne && removeOneTestComponentThree;
                }));

                expect(result).not.toBeNull();
                expect(result.actions.length).toBe(2);
                expect(result.outcome).toEqual(OutcomeType.FAILURE);
                expect(result.message).toEqual('Your alchemical combination failed! The ingredients were wasted. ');
                expect(result.checkResult).toEqual(mockCheckResult);

            });

        });

    });

});