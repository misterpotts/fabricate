import {Recipe} from "../../src/scripts/crafting/Recipe";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {Essence} from "../../src/scripts/common/Essence";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testCompendiumId: string = "fabricate.test-compendium";

const testRecipeOne: Recipe = new Recipe({
    gameItem: {
        name: "Recipe: 1 x Test Component One + 2 x Test Component Three = 1 x Test Component Five",
        partId: "tdyV4AWuTMkXbepw",
        systemId: "fabricate.test-system",
        compendiumId: testCompendiumId,
        imageUrl: "/img/1.jpg"
    },
    ingredients: Combination.ofUnits([
        new Unit<CraftingComponent>(testComponentOne, 1),
        new Unit<CraftingComponent>(testComponentThree, 2)
    ]),
    results: Combination.of(testComponentFive, 1)
});

const testRecipeTwo: Recipe = new Recipe({
    gameItem: {
        name: "Recipe: 2 x Test Component four + 1 x Test Component Five (Catalyst) = 2 x Test Component Two",
        partId: "QBmv3SSCaae2xxzT",
        systemId: "fabricate.test-system",
        compendiumId: testCompendiumId,
        imageUrl: "/img/2.jpg"
    },
    ingredients: Combination.of(testComponentFour, 1),
    catalysts: Combination.of(testComponentFive, 1),
    results: Combination.of(testComponentTwo, 2)
})

const testRecipeThree: Recipe = new Recipe({
    gameItem: {
        name: "Recipe: 3 x Elemental Earth + 1 x Elemental Fire = 3 Test Component One",
        partId: "eT4j7mNbZGHIUOtT",
        systemId: "fabricate.test-system",
        compendiumId: testCompendiumId,
        imageUrl: "/img/3.jpg"
    },
    essences: Combination.ofUnits([
        new Unit<Essence>(elementalEarth, 3),
        new Unit<Essence>(elementalFire, 1)
    ]),
    results: Combination.of(testComponentOne, 3)
});

const testRecipeFour: Recipe = new Recipe({
    gameItem: {
        name: "Recipe: 1 x Elemental Earth + 2 x Elemental Water + 3 x Test Component Two + 1 x Test Component Three (Catalyst) = 10 Test Component Five",
        partId: "l46uaz805Fr9lZvU",
        systemId: "fabricate.test-system",
        compendiumId: testCompendiumId,
        imageUrl: "/img/4.jpg"
    },
    essences: Combination.ofUnits([
        new Unit<Essence>(elementalEarth, 1),
        new Unit<Essence>(elementalWater, 2)
    ]),
    ingredients: Combination.of(testComponentTwo, 3),
    catalysts: Combination.of(testComponentThree, 1),
    results: Combination.of(testComponentFive, 10)
});

export { testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour }
