import {ComponentGroup, Recipe} from "../../src/scripts/crafting/Recipe";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {Essence} from "../../src/scripts/common/Essence";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testRecipeOne: Recipe = new Recipe({
    id: "tdyV4AWuTMkXbepw",
    ingredientGroups: [
        new ComponentGroup(Combination.of(testComponentOne, 1)),
        new ComponentGroup(Combination.of(testComponentThree, 2))
    ],
    resultGroups: [new ComponentGroup(Combination.of(testComponentFive, 1))]
});

const testRecipeTwo: Recipe = new Recipe({
    id: "QBmv3SSCaae2xxzT",
    ingredientGroups: [new ComponentGroup(Combination.of(testComponentFour, 1))],
    catalysts: Combination.of(testComponentFive, 1),
    resultGroups: [new ComponentGroup(Combination.of(testComponentTwo, 2))]
})

const testRecipeThree: Recipe = new Recipe({
    id: "eT4j7mNbZGHIUOtT",
    essences: Combination.ofUnits([
        new Unit<Essence>(elementalEarth, 3),
        new Unit<Essence>(elementalFire, 1)
    ]),
    resultGroups: [new ComponentGroup(Combination.of(testComponentOne, 3))]
});

const testRecipeFour: Recipe = new Recipe({
    id: "l46uaz805Fr9lZvU",
    essences: Combination.ofUnits([
        new Unit<Essence>(elementalEarth, 1),
        new Unit<Essence>(elementalWater, 2)
    ]),
    ingredientGroups: [new ComponentGroup(Combination.of(testComponentTwo, 3))],
    catalysts: Combination.of(testComponentThree, 1),
    resultGroups: [new ComponentGroup(Combination.of(testComponentFive, 10))]
});

export { testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour }
