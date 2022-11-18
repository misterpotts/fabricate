import {ComponentGroup, Recipe} from "../../src/scripts/crafting/Recipe";
import {CombinableString, Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testRecipeOne: Recipe = new Recipe({
    id: "tdyV4AWuTMkXbepw",
    name: "Test Recipe One",
    ingredientGroups: [
        new ComponentGroup(Combination.of(new CombinableString(testComponentOne.id), 1)),
        new ComponentGroup(Combination.of(new CombinableString(testComponentThree.id), 2))
    ],
    resultGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentFive.id), 1))]
});

const testRecipeTwo: Recipe = new Recipe({
    id: "QBmv3SSCaae2xxzT",
    name: "Test Recipe Two",
    ingredientGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentFour.id), 1))],
    catalysts: Combination.of(new CombinableString(testComponentFive.id), 1),
    resultGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentTwo.id), 2))]
})

const testRecipeThree: Recipe = new Recipe({
    id: "eT4j7mNbZGHIUOtT",
    name: "Test Recipe Three",
    essences: Combination.ofUnits([
        new Unit(new CombinableString(elementalEarth.id), 3),
        new Unit(new CombinableString(elementalFire.id), 1)
    ]),
    resultGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentOne.id), 3))]
});

const testRecipeFour: Recipe = new Recipe({
    id: "l46uaz805Fr9lZvU",
    name: "Test Recipe Four",
    essences: Combination.ofUnits([
        new Unit(new CombinableString(elementalEarth.id), 1),
        new Unit(new CombinableString(elementalWater.id), 2)
    ]),
    ingredientGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentTwo.id), 3))],
    catalysts: Combination.of(new CombinableString(testComponentThree.id), 1),
    resultGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentFive.id), 10))]
});

const testRecipeFive: Recipe = new Recipe({
    id: "jLAVDWQdUUYr56Eo",
    name: "Test Recipe Five",
    essences: Combination.ofUnits([
        new Unit(new CombinableString(elementalFire.id), 1),
        new Unit(new CombinableString(elementalWater.id), 1)
    ]),
    catalysts: Combination.of(new CombinableString(testComponentFour.id), 1),
    resultGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentFive.id), 10))]
});

const testRecipeSix: Recipe = new Recipe({
    id: "jLAVDWQdUUYr56Eo",
    name: "Test Recipe Six",
    essences: Combination.ofUnits([
        new Unit(new CombinableString(elementalEarth.id), 3),
        new Unit(new CombinableString(elementalWater.id), 1)
    ]),
    ingredientGroups: [
        new ComponentGroup(Combination.ofUnits([
            new Unit(new CombinableString(testComponentOne.id), 1),
            new Unit(new CombinableString(testComponentThree.id), 2)
        ])),
        new ComponentGroup(Combination.of(new CombinableString(testComponentTwo.id), 1))
    ],
    resultGroups: [new ComponentGroup(Combination.of(new CombinableString(testComponentThree.id), 2))]
});


export { testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour, testRecipeFive, testRecipeSix }
