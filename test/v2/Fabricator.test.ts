import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";
import {Inventory} from "../../src/scripts/v2/actor/Inventory";
import {Fabricator} from "../../src/scripts/v2/core/Fabricator";
import {AlchemicalCombiner} from "../../src/scripts/v2/crafting/alchemy/AlchemicalCombiner";
import {CraftingCheck} from "../../src/scripts/v2/crafting/CraftingCheck";
import {Recipe} from "../../src/scripts/v2/crafting/Recipe";
import {Combination, Unit} from "../../src/scripts/v2/common/Combination";
import {
    testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {CraftingComponent} from "../../src/scripts/v2/common/CraftingComponent";
import {FabricationOutcome} from "../../src/scripts/v2/core/FabricationOutcome";
import {EssenceDefinition} from "../../src/scripts/v2/common/EssenceDefinition";
import {CraftingCheckResult} from "../../src/scripts/v2/crafting/CraftingCheckResult";
import {OutcomeType} from "../../src/scripts/v2/core/OutcomeType";
import {ActionType, FabricationAction} from "../../src/scripts/v2/core/FabricationAction";
import {elementalAir, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";

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
// const stubInventoryContainsEssencesMethod = Sandbox.stub(mockInventory, 'containsEssences');

const mockAlchemicalCombiner: AlchemicalCombiner<any> = <AlchemicalCombiner<any>><unknown>{
    perform: () => {}
}
//const stubPerformAlchemyMethod = Sandbox.stub(mockAlchemicalCombiner, 'perform');

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

describe('Fabricate Recipes', () => {

    const testIngredientBasedRecipe: Recipe = Recipe.builder()
        .withName('Test Ingredient-Based Recipe')
        .withPartId('abc123')
        .withSystemId('fabricate.test-system')
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
        .withSystemId('fabricate.test-system')
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
        .withSystemId('fabricate.test-system')
        .withImageUrl('/img/img.png')
        .withEssences(Combination.ofUnits([
            new Unit<EssenceDefinition>(elementalWater, 2),
            new Unit<EssenceDefinition>(elementalFire, 2),
            new Unit<EssenceDefinition>(elementalAir, 1)
        ]))
        .withResults(Combination.of(testComponentFour, 1))
        .build();

    test('Should fail on unsuccessful check and consume components if configured to', async () => {

        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .withCraftingCheck(mockCraftingCheck)
            .build();

        stubInventoryContainsIngredientsMethod.returns(true);
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

    test('Should fail on unsuccessful check and not consume components if not configured to', async () => {

        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(false)
            .withCraftingCheck(mockCraftingCheck)
            .build();

        stubInventoryContainsIngredientsMethod.returns(true);
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

    test('Should delegate correct removal and addition actions to Inventory on recipe crafting with no check', async () => {

        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .build();

        stubInventoryContainsIngredientsMethod.returns(true);
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

    test('Should delegate correct removal and addition actions to Inventory for successful check on recipe crafting with catalyst', async () => {

        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .withCraftingCheck(mockCraftingCheck)
            .build();

        stubInventoryContainsIngredientsMethod.returns(true);
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

    test('Should delegate correct removal and addition actions to Inventory for successful check on recipe crafting for essences', async () => {

        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .build();

        stubInventoryContainsIngredientsMethod.returns(true);
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