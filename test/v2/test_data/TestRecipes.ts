import {Recipe} from "../../../src/scripts/v2/Recipe";
import {Combination, Unit} from "../../../src/scripts/v2/Combination";
import {CraftingComponent} from "../../../src/scripts/v2/CraftingComponent";
import {
    testComponentFive,
    testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./TestCraftingComponents";
import {EssenceDefinition} from "../../../src/scripts/v2/EssenceDefinition";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testRecipeOne: Recipe = Recipe.builder()
    .withName('Recipe: 1 x Test Component One + 2 x Test Component Three = 1 x Test Component Five')
    .withPartId('tdyV4AWuTMkXbepw')
    .withSystemId('fabricate.test-system')
    .withIngredients(Combination.ofUnits([
        new Unit<CraftingComponent>(testComponentOne, 1),
        new Unit<CraftingComponent>(testComponentThree, 2)
    ]))
    .withResults(Combination.of(testComponentFive, 1))
    .build();

const testRecipeTwo: Recipe = Recipe.builder()
    .withName('Recipe: 2 x Test Component four + 1 x Test Component Five (Catalyst) = 2 x Test Component Two')
    .withPartId('QBmv3SSCaae2xxzT')
    .withSystemId('fabricate.test-system')
    .withIngredients(Combination.of(testComponentFour, 1))
    .withCatalysts(Combination.of(testComponentFive, 1))
    .withResults(Combination.of(testComponentTwo, 2))
    .build();

const testRecipeThree: Recipe = Recipe.builder()
    .withName('Recipe: 3 x Elemental Earth + 1 x Elemental Fire = 3 Test Component One')
    .withPartId('eT4j7mNbZGHIUOtT')
    .withSystemId('fabricate.test-system')
    .withEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 3),
        new Unit<EssenceDefinition>(elementalFire, 1)
    ]))
    .withResults(Combination.of(testComponentOne, 3))
    .build();

const testRecipeFour: Recipe = Recipe.builder()
    .withName('Recipe: 1 x Elemental Earth + 2 x Elemental Water + 3 x Test Component Two + 1 x Test Component Three (Catalyst) = 10 Test Component Five')
    .withPartId('l46uaz805Fr9lZvU')
    .withSystemId('fabricate.test-system')
    .withEssences(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 1),
        new Unit<EssenceDefinition>(elementalWater, 2)
    ]))
    .withIngredients(Combination.of(testComponentTwo, 3))
    .withCatalysts(Combination.of(testComponentThree, 1))
    .withResults(Combination.of(testComponentFive, 10))
    .build();

export {testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour}