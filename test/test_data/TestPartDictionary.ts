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
import {Essence} from "../../src/scripts/common/Essence";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testPartDictionary: PartDictionary = new PartDictionary({
    components: new Map<string, CraftingComponent>([
        [testComponentOne.id, testComponentOne],
        [testComponentTwo.id, testComponentTwo],
        [testComponentThree.id, testComponentThree],
        [testComponentFour.id, testComponentFour],
        [testComponentFive.id, testComponentFive]
    ]),
    recipes: new Map<string, Recipe>([
        [testRecipeOne.id, testRecipeOne],
        [testRecipeTwo.id, testRecipeTwo],
        [testRecipeThree.id, testRecipeThree],
        [testRecipeFour.id, testRecipeFour]
    ]),
    essences: new Map<string, Essence>([
        [elementalEarth.id, elementalEarth],
        [elementalFire.id, elementalFire],
        [elementalWater.id, elementalWater],
        [elementalAir.id, elementalAir]
    ]),
});

export {testPartDictionary}