import {IngredientOption, Recipe, ResultOption} from "../../src/scripts/common/Recipe";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import {SelectableOptions} from "../../src/scripts/common/SelectableOptions";

/**
* Essences: None
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeOne: Recipe = new Recipe({
    id: "z2ixo2m312l",
    itemUuid: "Compendium.module.compendium-name.z2ixo2m312l",
    name: "Test Recipe One",
    ingredientOptions: new SelectableOptions({
        options: [
            new IngredientOption({
                name: "Option 1",
                ingredients: Combination.of(testComponentOne, 1)
            }),
            new IngredientOption({
                name: "Option 2",
                ingredients: Combination.of(testComponentThree, 2)
            }),
        ]
    }),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentFive, 1)
            })
        ]
    })
});

/**
* Essences: None
* Catalysts: 1
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeTwo: Recipe = new Recipe({
    id: "fzv66f90sd",
    itemUuid: "Compendium.module.compendium-name.fzv66f90sd",
    name: "Test Recipe Two",
    ingredientOptions: new SelectableOptions({
        options: [
            new IngredientOption({
                name: "Option 1",
                ingredients: Combination.of(testComponentFour, 1),
                catalysts: Combination.of(testComponentFive, 1)
            })
        ]
    }),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentTwo, 2)
            })
        ]
    })
})

/**
* Essences: 2 types, 4 total
* Catalysts: None
* Ingredient Options: None
* Result Options: 1
* */
const testRecipeThree: Recipe = new Recipe({
    id: "5pux8ghlct",
    itemUuid: "Compendium.module.compendium-name.5pux8ghlct",
    name: "Test Recipe Three",
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 3),
        new Unit(elementalFire, 1)
    ]),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentOne, 3)
            })
        ]
    })
});

/**
* Essences: 2 Types, 3 total
* Catalysts: 1
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeFour: Recipe = new Recipe({
    id: "3lieym2gjef",
    itemUuid: "Compendium.module.compendium-name.3lieym2gjef",
    name: "Test Recipe Four",
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 1),
        new Unit(elementalWater, 2)
    ]),
    ingredientOptions: new SelectableOptions({
        options: [
            new IngredientOption({
                name: "Option 1",
                ingredients: Combination.of(testComponentTwo, 3),
                catalysts: Combination.of(testComponentThree, 1)
            })
        ]
    }),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentFive, 10)
            })
        ]
    })
});

/**
* Essences: 2 Types, 2 total
* Catalysts: 1
* Ingredient Options: 1 Catalyst only
* Result Options: 1
* */
const testRecipeFive: Recipe = new Recipe({
    id: "fequ5qvoqh",
    itemUuid: "Compendium.module.compendium-name.fequ5qvoqh",
    name: "Test Recipe Five",
    essences: Combination.ofUnits([
        new Unit(elementalFire, 1),
        new Unit(elementalWater, 1)
    ]),
    ingredientOptions: new SelectableOptions({
        options: [
            new IngredientOption({
                name: "Option 1",
                catalysts: Combination.of(testComponentFour, 1)
            })
        ]
    }),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentFive, 10)
            })
        ]
    })
});

/**
* Essences: 2 Types, 4 total
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeSix: Recipe = new Recipe({
    id: "bx8luu4cpd",
    itemUuid: "Compendium.module.compendium-name.bx8luu4cpd",
    name: "Test Recipe Six",
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 3),
        new Unit(elementalWater, 1)
    ]),
    ingredientOptions: new SelectableOptions({
        options: [
            new IngredientOption({
                name: "Option 1",
                ingredients: Combination.ofUnits([
                    new Unit(testComponentOne, 1),
                    new Unit(testComponentThree, 2)
                ])
            }),
            new IngredientOption({
                name: "Option 2",
                ingredients: Combination.of(testComponentTwo, 1)
            })
        ]
    }),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentThree, 2)
            }),
            new ResultOption({
                name: "Option 2",
                results: Combination.of(testComponentFive, 2)
            })
        ]
    })
});

/**
* Essences: None
* Catalysts: None
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeSeven: Recipe = new Recipe({
    id: "8kimdf8z83",
    itemUuid: "Compendium.module.compendium-name.8kimdf8z83",
    name: "Test Recipe Seven",
    ingredientOptions: new SelectableOptions({
        options: [
            new IngredientOption({
                name: "Option 1",
                ingredients: Combination.of(testComponentFour, 1)
            })
        ]
    }),
    resultOptions: new SelectableOptions({
        options: [
            new ResultOption({
                name: "Option 1",
                results: Combination.of(testComponentTwo, 2)
            })
        ]
    })
})


export {
    testRecipeOne,
    testRecipeTwo,
    testRecipeThree,
    testRecipeFour,
    testRecipeFive,
    testRecipeSix,
    testRecipeSeven
}
