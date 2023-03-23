import {RequirementOption, Recipe, ResultOption} from "../../src/scripts/common/Recipe";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import {SelectableOptions} from "../../src/scripts/common/SelectableOptions";
import {LoadedFabricateItemData} from "../../src/scripts/foundry/DocumentManager";
import Properties from "../../src/scripts/Properties";

/**
* Essences: None
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeOne: Recipe = new Recipe({
    id: "z2ixo2m312l",
    itemData: new LoadedFabricateItemData({
        name: "Test Recipe One",
        itemUuid: "Compendium.module.compendium-name.z2ixo2m312l",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
    ingredientOptions: new SelectableOptions({
        options: [
            new RequirementOption({
                name: "Option 1",
                ingredients: Combination.of(testComponentOne, 1)
            }),
            new RequirementOption({
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
    itemData: new LoadedFabricateItemData({
        name: "Test Recipe Two",
        itemUuid: "Compendium.module.compendium-name.fzv66f90sd",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
    ingredientOptions: new SelectableOptions({
        options: [
            new RequirementOption({
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
    itemData: new LoadedFabricateItemData({
        name: "Test Recipe Three",
        itemUuid: "Compendium.module.compendium-name.5pux8ghlct",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
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
    itemData: new LoadedFabricateItemData({
        name: "Test Recipe Four",
        itemUuid: "Compendium.module.compendium-name.3lieym2gjef",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 1),
        new Unit(elementalWater, 2)
    ]),
    ingredientOptions: new SelectableOptions({
        options: [
            new RequirementOption({
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
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.fequ5qvoqh",
        name: "Test Recipe Five",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
    essences: Combination.ofUnits([
        new Unit(elementalFire, 1),
        new Unit(elementalWater, 1)
    ]),
    ingredientOptions: new SelectableOptions({
        options: [
            new RequirementOption({
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
    itemData: new LoadedFabricateItemData({
        name: "Test Recipe Six",
        itemUuid: "Compendium.module.compendium-name.bx8luu4cpd",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 3),
        new Unit(elementalWater, 1)
    ]),
    ingredientOptions: new SelectableOptions({
        options: [
            new RequirementOption({
                name: "Option 1",
                ingredients: Combination.ofUnits([
                    new Unit(testComponentOne, 1),
                    new Unit(testComponentThree, 2)
                ])
            }),
            new RequirementOption({
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
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.8kimdf8z83",
        name: "Test Recipe Seven",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    }),
    ingredientOptions: new SelectableOptions({
        options: [
            new RequirementOption({
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
