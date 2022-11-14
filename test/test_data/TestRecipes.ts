import {ComponentGroup, Recipe, RecipeId} from "../../src/scripts/crafting/Recipe";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testRecipeOne: Recipe = new Recipe({
    id: new RecipeId("tdyV4AWuTMkXbepw"),
    name: "Test Recipe One",
    ingredientGroups: [
        new ComponentGroup(Combination.of(testComponentOne.id, 1)),
        new ComponentGroup(Combination.of(testComponentThree.id, 2))
    ],
    resultGroups: [new ComponentGroup(Combination.of(testComponentFive.id, 1))]
});

const testRecipeTwo: Recipe = new Recipe({
    id: new RecipeId("QBmv3SSCaae2xxzT"),
    name: "Test Recipe Two",
    ingredientGroups: [new ComponentGroup(Combination.of(testComponentFour.id, 1))],
    catalysts: Combination.of(testComponentFive.id, 1),
    resultGroups: [new ComponentGroup(Combination.of(testComponentTwo.id, 2))]
})

const testRecipeThree: Recipe = new Recipe({
    id: new RecipeId("eT4j7mNbZGHIUOtT"),
    name: "Test Recipe Three",
    essences: Combination.ofUnits([
        new Unit(elementalEarth.id, 3),
        new Unit(elementalFire.id, 1)
    ]),
    resultGroups: [new ComponentGroup(Combination.of(testComponentOne.id, 3))]
});

const testRecipeFour: Recipe = new Recipe({
    id: new RecipeId("l46uaz805Fr9lZvU"),
    name: "Test Recipe Four",
    essences: Combination.ofUnits([
        new Unit(elementalEarth.id, 1),
        new Unit(elementalWater.id, 2)
    ]),
    ingredientGroups: [new ComponentGroup(Combination.of(testComponentTwo.id, 3))],
    catalysts: Combination.of(testComponentThree.id, 1),
    resultGroups: [new ComponentGroup(Combination.of(testComponentFive.id, 10))]
});

const testRecipeFive: Recipe = new Recipe({
    id: new RecipeId("jLAVDWQdUUYr56Eo"),
    name: "Test Recipe Five",
    essences: Combination.ofUnits([
        new Unit(elementalFire.id, 1),
        new Unit(elementalWater.id, 1)
    ]),
    catalysts: Combination.of(testComponentFour.id, 1),
    resultGroups: [new ComponentGroup(Combination.of(testComponentFive.id, 10))]
});

const testRecipeSix: Recipe = new Recipe({
    id: new RecipeId("jLAVDWQdUUYr56Eo"),
    name: "Test Recipe Six",
    essences: Combination.ofUnits([
        new Unit(elementalEarth.id, 3),
        new Unit(elementalWater.id, 1)
    ]),
    ingredientGroups: [
        new ComponentGroup(Combination.ofUnits([
            new Unit(testComponentOne.id, 1),
            new Unit(testComponentThree.id, 2)
        ])),
        new ComponentGroup(Combination.of(testComponentTwo.id, 1))
    ],
    resultGroups: [new ComponentGroup(Combination.of(testComponentThree.id, 2))]
});


export { testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour, testRecipeFive, testRecipeSix }
