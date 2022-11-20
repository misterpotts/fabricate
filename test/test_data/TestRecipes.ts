import {CombinationChoice, Recipe} from "../../src/scripts/crafting/Recipe";
import {StringIdentity, Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

/*
* Essences: None
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeOne: Recipe = new Recipe({
    id: "tdyV4AWuTMkXbepw",
    name: "Test Recipe One",
    ingredientOptions: CombinationChoice.between(
        Combination.of(new StringIdentity(testComponentOne.id), 1),
        Combination.of(new StringIdentity(testComponentThree.id), 2)
    ),
    resultOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentFive.id), 1))
});

/*
* Essences: None
* Catalysts: 1
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeTwo: Recipe = new Recipe({
    id: "QBmv3SSCaae2xxzT",
    name: "Test Recipe Two",
    ingredientOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentFour.id), 1)),
    catalysts: Combination.of(new StringIdentity(testComponentFive.id), 1),
    resultOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentTwo.id), 2))
})

/*
* Essences: 2 types, 4 total
* Catalysts: None
* Ingredient Options: None
* Result Options: 1
* */
const testRecipeThree: Recipe = new Recipe({
    id: "eT4j7mNbZGHIUOtT",
    name: "Test Recipe Three",
    essences: Combination.ofUnits([
        new Unit(new StringIdentity(elementalEarth.id), 3),
        new Unit(new StringIdentity(elementalFire.id), 1)
    ]),
    resultOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentOne.id), 3))
});

/*
* Essences: 2 Types, 3 total
* Catalysts: 1
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeFour: Recipe = new Recipe({
    id: "l46uaz805Fr9lZvU",
    name: "Test Recipe Four",
    essences: Combination.ofUnits([
        new Unit(new StringIdentity(elementalEarth.id), 1),
        new Unit(new StringIdentity(elementalWater.id), 2)
    ]),
    ingredientOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentTwo.id), 3)),
    catalysts: Combination.of(new StringIdentity(testComponentThree.id), 1),
    resultOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentFive.id), 10))
});

/*
* Essences: 2 Types, 2 total
* Catalysts: 1
* Ingredient Options: None
* Result Options: 1
* */
const testRecipeFive: Recipe = new Recipe({
    id: "jLAVDWQdUUYr56Eo",
    name: "Test Recipe Five",
    essences: Combination.ofUnits([
        new Unit(new StringIdentity(elementalFire.id), 1),
        new Unit(new StringIdentity(elementalWater.id), 1)
    ]),
    catalysts: Combination.of(new StringIdentity(testComponentFour.id), 1),
    resultOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentFive.id), 10))
});

/*
* Essences: 2 Types, 4 total
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeSix: Recipe = new Recipe({
    id: "jLAVDWQdUUYr56Eo",
    name: "Test Recipe Six",
    essences: Combination.ofUnits([
        new Unit(new StringIdentity(elementalEarth.id), 3),
        new Unit(new StringIdentity(elementalWater.id), 1)
    ]),
    ingredientOptions:
        CombinationChoice.between(
            Combination.ofUnits([
                new Unit(new StringIdentity(testComponentOne.id), 1),
                new Unit(new StringIdentity(testComponentThree.id), 2)
            ]),
            Combination.of(new StringIdentity(testComponentTwo.id), 1)
        ),
    resultOptions: CombinationChoice.between(
        Combination.of(new StringIdentity(testComponentThree.id), 2),
        Combination.of(new StringIdentity(testComponentFive.id), 2)
    )
});

/*
* Essences: None
* Catalysts: None
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeSeven: Recipe = new Recipe({
    id: "QBmv3SSCaae2xxzT",
    name: "Test Recipe Two",
    ingredientOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentFour.id), 1)),
    resultOptions: CombinationChoice.just(Combination.of(new StringIdentity(testComponentTwo.id), 2))
})


export { testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour, testRecipeFive, testRecipeSix, testRecipeSeven }
