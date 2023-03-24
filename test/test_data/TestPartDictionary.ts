import {PartDictionary, PartDictionaryFactory} from "../../src/scripts/system/PartDictionary";
import {ComponentJson} from "../../src/scripts/common/Component";
import {RecipeJson} from "../../src/scripts/common/Recipe";
import {
    testComponentFive,
    testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./TestCraftingComponents";
import {
    testRecipeFive,
    testRecipeFour,
    testRecipeOne, testRecipeSeven,
    testRecipeSix,
    testRecipeThree,
    testRecipeTwo
} from "./TestRecipes";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import {StubDocumentManager} from "../stubs/StubDocumentManager";

const components = {
    [testComponentOne.id]: testComponentOne,
    [testComponentTwo.id]: testComponentTwo,
    [testComponentThree.id]: testComponentThree,
    [testComponentFour.id]: testComponentFour,
    [testComponentFive.id]: testComponentFive
};
const componentsJson = Array.from(Object.values(components))
    .map(component => component.toJson())
    .reduce((left: Record<string, ComponentJson>, right) => {
        left[right.itemUuid] = right;
        return left;
    }, {});
const recipes = {
    [testRecipeOne.id]: testRecipeOne,
    [testRecipeTwo.id]: testRecipeTwo,
    [testRecipeThree.id]: testRecipeThree,
    [testRecipeFour.id]: testRecipeFour,
    [testRecipeFive.id]: testRecipeFive,
    [testRecipeSix.id]: testRecipeSix,
    [testRecipeSeven.id]: testRecipeSeven
};
const recipesJson = Array.from(Object.values(recipes))
    .map(recipe => recipe.toJson())
    .reduce((left: Record<string, RecipeJson>, right) => {
        left[right.itemUuid] = right;
        return left;
    }, {});
const essences = {
    [elementalEarth.id]: elementalEarth,
    [elementalFire.id]: elementalFire,
    [elementalWater.id]: elementalWater,
    [elementalAir.id]: elementalAir
};

const testPartDictionaryFactory = new PartDictionaryFactory({
    documentManager: StubDocumentManager.forParts({
        craftingComponents: Array.from(Object.values(components)),
        recipes: Array.from(Object.values(recipes))
    }),
});

const testPartDictionary: PartDictionary = testPartDictionaryFactory.make({
    essences,
    components: componentsJson,
    recipes: recipesJson
});

export {testPartDictionary}