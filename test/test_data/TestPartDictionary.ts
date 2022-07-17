import {PartDictionary} from "../../src/scripts/system/PartDictionary";
import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {Recipe} from "../../src/scripts/crafting/Recipe";
import {
    testComponentFive,
    testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./TestCraftingComponents";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./TestRecipes";

const testPartDictionary: PartDictionary = new PartDictionary(
    new Map<string, CraftingComponent>([
        [testComponentOne.partId, testComponentOne],
        [testComponentTwo.partId, testComponentTwo],
        [testComponentThree.partId, testComponentThree],
        [testComponentFour.partId, testComponentFour],
        [testComponentFive.partId, testComponentFive]
    ]),
    new Map<string, Recipe>([
        [testRecipeOne.partId, testRecipeOne],
        [testRecipeTwo.partId, testRecipeTwo],
        [testRecipeThree.partId, testRecipeThree],
        [testRecipeFour.partId, testRecipeFour]
    ])
);

export {testPartDictionary}