import {RequirementOption, Recipe, ResultOption} from "../../src/scripts/crafting/recipe/Recipe";
import {Combination} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import {SelectableOptions} from "../../src/scripts/crafting/recipe/SelectableOptions";
import {LoadedFabricateItemData, PendingFabricateItemData} from "../../src/scripts/foundry/DocumentManager";
import Properties from "../../src/scripts/Properties";
import {testCraftingSystemOne} from "./TestCrafingSystem";
import {Unit} from "../../src/scripts/common/Unit";

function buildPendingItemData(name: string, itemUuid: string) {
    const loadedFabricateItemData = new LoadedFabricateItemData({
        name,
        itemUuid,
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: {}
    });
    return new PendingFabricateItemData(itemUuid, () => Promise.resolve(loadedFabricateItemData));
}

/**
* Essences: None
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeOne: Recipe = new Recipe({
    id: "z2ixo2m312l",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe One", "Compendium.module.compendium-name.z2ixo2m312l"),
    requirementOptions: new SelectableOptions({
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
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Two", "Compendium.module.compendium-name.fzv66f90sd"),
    requirementOptions: new SelectableOptions({
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
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Three", "Compendium.module.compendium-name.5pux8ghlct"),
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
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Four", "Compendium.module.compendium-name.3lieym2gjef"),
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 1),
        new Unit(elementalWater, 2)
    ]),
    requirementOptions: new SelectableOptions({
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
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Five", "Compendium.module.compendium-name.fequ5qvoqh"),
    essences: Combination.ofUnits([
        new Unit(elementalFire, 1),
        new Unit(elementalWater, 1)
    ]),
    requirementOptions: new SelectableOptions({
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
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Six", "Compendium.module.compendium-name.bx8luu4cpd"),
    essences: Combination.ofUnits([
        new Unit(elementalEarth, 3),
        new Unit(elementalWater, 1)
    ]),
    requirementOptions: new SelectableOptions({
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
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Seven", "Compendium.module.compendium-name.8kimdf8z83"),
    requirementOptions: new SelectableOptions({
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

const allTestRecipes = new Map([
    [testRecipeOne.id, testRecipeOne],
    [testRecipeTwo.id, testRecipeTwo],
    [testRecipeThree.id, testRecipeThree],
    [testRecipeFour.id, testRecipeFour],
    [testRecipeFive.id, testRecipeFive],
    [testRecipeSix.id, testRecipeSix],
    [testRecipeSeven.id, testRecipeSeven]
]);

export {
    allTestRecipes,
    testRecipeOne,
    testRecipeTwo,
    testRecipeThree,
    testRecipeFour,
    testRecipeFive,
    testRecipeSix,
    testRecipeSeven
}

function resetAllTestRecipes() {
    allTestRecipes.forEach(recipe => {
        if (recipe.isLoaded) {
            recipe.itemData = buildPendingItemData(recipe.itemData.name, recipe.itemData.uuid);
        }
    });
}

export { resetAllTestRecipes }