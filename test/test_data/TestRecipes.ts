import {CombinationChoice, Recipe} from "../../src/scripts/crafting/Recipe";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssences";

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
        Combination.of(testComponentOne, 1),
        Combination.of(testComponentThree, 2)
    ),
    resultOptions: CombinationChoice.just(Combination.of(testComponentFive, 1))
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
    ingredientOptions: CombinationChoice.just(Combination.of(testComponentFour, 1)),
    catalysts: Combination.of(testComponentFive, 1),
    resultOptions: CombinationChoice.just(Combination.of(testComponentTwo, 2))
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
        new Unit(elementalEarth, 3),
        new Unit(elementalFire, 1)
    ]),
    resultOptions: CombinationChoice.just(Combination.of(testComponentOne, 3))
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
        new Unit(elementalEarth, 1),
        new Unit(elementalWater, 2)
    ]),
    ingredientOptions: CombinationChoice.just(Combination.of(testComponentTwo, 3)),
    catalysts: Combination.of(testComponentThree, 1),
    resultOptions: CombinationChoice.just(Combination.of(testComponentFive, 10))
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
        new Unit(elementalFire, 1),
        new Unit(elementalWater, 1)
    ]),
    catalysts: Combination.of(testComponentFour, 1),
    resultOptions: CombinationChoice.just(Combination.of(testComponentFive, 10))
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
        new Unit(elementalEarth, 3),
        new Unit(elementalWater, 1)
    ]),
    ingredientOptions:
        CombinationChoice.between(
            Combination.ofUnits([
                new Unit(testComponentOne, 1),
                new Unit(testComponentThree, 2)
            ]),
            Combination.of(testComponentTwo, 1)
        ),
    resultOptions: CombinationChoice.between(
        Combination.of(testComponentThree, 2),
        Combination.of(testComponentFive, 2)
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
    ingredientOptions: CombinationChoice.just(Combination.of(testComponentFour, 1)),
    resultOptions: CombinationChoice.just(Combination.of(testComponentTwo, 2))
})


export { testRecipeOne, testRecipeTwo, testRecipeThree, testRecipeFour, testRecipeFive, testRecipeSix, testRecipeSeven }
