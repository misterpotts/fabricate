import {expect, jest, test, beforeEach, describe} from "@jest/globals";
import * as Sinon from "sinon";
import {Inventory} from "../../src/scripts/v2/actor/Inventory";
import {Fabricator} from "../../src/scripts/v2/core/Fabricator";
import {AlchemicalCombiner} from "../../src/scripts/v2/crafting/alchemy/AlchemicalCombiner";
import {CraftingCheck} from "../../src/scripts/v2/crafting/CraftingCheck";
import {Recipe} from "../../src/scripts/v2/crafting/Recipe";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockActor: Actor<Actor.Data, Item<Item.Data>> = <Actor<Actor.Data, Item<Item.Data>>><unknown>{};

const mockInventory: Inventory<any, Actor<Actor.Data, Item<Item.Data>>> = <Inventory<any, Actor<Actor.Data, Item<Item.Data>>>><unknown>{
    actor: Sandbox.stub(),
    ownedComponents: Sandbox.stub(),
    containsIngredients: () => {},
    containsEssences: () => {},
    selectFor: () => {},
    excluding: () => {},
    perform: () => {},
    prepare: () => {}
};
// const stubContainsIngredientsMethod = Sandbox.stub(mockInventory, 'containsIngredients');
// const stubContainsEssencesMethod = Sandbox.stub(mockInventory, 'containsEssences');
// const stubSelectForMethod = Sandbox.stub(mockInventory, 'selectFor');
// const stubExcludingMethod = Sandbox.stub(mockInventory, 'excluding');
// const stubPerformMethod = Sandbox.stub(mockInventory, 'perform');
// const stubPrepareMethod = Sandbox.stub(mockInventory, 'prepare');

const mockAlchemicalCombiner: AlchemicalCombiner<any> = <AlchemicalCombiner<any>><unknown>{
    perform: () => {}
}
//const stubPerformAlchemyMethod = Sandbox.stub(mockAlchemicalCombiner, 'perform');

const mockCraftingCheck: CraftingCheck<any> = <CraftingCheck<any>><unknown>{
    perform: () => {}
};
//const stubPerformCraftingCheckMethod = Sandbox.stub(mockCraftingCheck, 'perform');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create', () => {

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

    test('Should', () => {

        const underTest: Fabricator<any, Actor<Actor.Data, Item<Item.Data>>> = Fabricator.builder()
            .withAlchemicalCombiner(mockAlchemicalCombiner)
            .withConsumeComponentsOnFailure(true)
            .withCraftingCheck(mockCraftingCheck)
            .build();

        const testRecipe: Recipe = Recipe.builder().build();

        underTest.followRecipe(mockActor, mockInventory, testRecipe);
    });

});