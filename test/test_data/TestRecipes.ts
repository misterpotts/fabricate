import {DefaultRecipe, Recipe} from "../../src/scripts/crafting/recipe/Recipe";
import {DefaultCombination} from "../../src/scripts/common/Combination";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import {LoadedFabricateItemData, PendingFabricateItemData} from "../../src/scripts/foundry/DocumentManager";
import Properties from "../../src/scripts/Properties";
import {testCraftingSystemOne} from "./TestCrafingSystem";
import {DefaultUnit} from "../../src/scripts/common/Unit";
import {Requirement} from "../../src/scripts/crafting/recipe/Requirement";
import {Result} from "../../src/scripts/crafting/recipe/Result";
import {DefaultSerializableOption, DefaultSerializableOptions} from "../../src/scripts/common/Options";

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
const testRecipeOne: Recipe = new DefaultRecipe({
    id: "z2ixo2m312l",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe One", "Compendium.module.compendium-name.z2ixo2m312l"),
    requirementOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "z2ixo2m312l-requirement-1",
            name: "Option 1",
            value: new Requirement({
                ingredients: DefaultCombination.of(testComponentOne.toReference(), 1)
            })
        }),
        new DefaultSerializableOption({
            id: "z2ixo2m312l-requirement-2",
            name: "Option 2",
            value: new Requirement({
                ingredients: DefaultCombination.of(testComponentThree.toReference(), 2)
            })
        }),
    ]),
    resultOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "z2ixo2m312l-result-1",
            name: "Option 1",
            value: new Result({
                products: DefaultCombination.of(testComponentFive.toReference(), 1)
            })
        })
    ])
});

/**
* Essences: None
* Catalysts: 1
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeTwo: Recipe = new DefaultRecipe({
    id: "fzv66f90sd",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Two", "Compendium.module.compendium-name.fzv66f90sd"),
    requirementOptions: new DefaultSerializableOptions(
        [
            new DefaultSerializableOption({
                id: "fzv66f90sd-requirement-1",
                name: "Option 1",
                value: new Requirement({
                    ingredients: DefaultCombination.of(testComponentFour.toReference(), 1),
                    catalysts: DefaultCombination.of(testComponentFive.toReference(), 1)
                })
            })
        ]
    ),
    resultOptions: new DefaultSerializableOptions(
        [
            new DefaultSerializableOption({
                id: "fzv66f90sd-result-1",
                name: "Option 1",
                value: new Result({
                    products: DefaultCombination.of(testComponentTwo.toReference(), 2)
                })
            })
        ]
    )
})

/**
* Essences: 2 types, 4 total
* Catalysts: None
 *
* Ingredient Options: None
* Result Options: 1
* */
const testRecipeThree: Recipe = new DefaultRecipe({
    id: "5pux8ghlct",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Three", "Compendium.module.compendium-name.5pux8ghlct"),
    requirementOptions: new DefaultSerializableOptions(
        [
            new DefaultSerializableOption({
                id: "5pux8ghlct-requirement-1",
                name: "Option 1",
                value: new Requirement({
                    essences: DefaultCombination.ofUnits([
                        new DefaultUnit(elementalEarth.toReference(), 3),
                        new DefaultUnit(elementalFire.toReference(), 1)
                    ])
                })
            })
        ]
    ),
    resultOptions: new DefaultSerializableOptions(
        [
            new DefaultSerializableOption({
                id: "5pux8ghlct-result-1",
                name: "Option 1",
                value: new Result({
                    products: DefaultCombination.of(testComponentOne.toReference(), 3),
                })
            })
        ]
    )
});

/**
* Essences: 2 Types, 3 total
* Catalysts: 1
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeFour: Recipe = new DefaultRecipe({
    id: "3lieym2gjef",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Four", "Compendium.module.compendium-name.3lieym2gjef"),
    requirementOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "3lieym2gjef-requirement-1",
            name: "Option 1",
            value: new Requirement({
                ingredients: DefaultCombination.of(testComponentTwo.toReference(), 3),
                catalysts: DefaultCombination.of(testComponentThree.toReference(), 1),
                essences: DefaultCombination.ofUnits([
                    new DefaultUnit(elementalEarth.toReference(), 1),
                    new DefaultUnit(elementalWater.toReference(), 2)
                ])
            })
        })
    ]),
    resultOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "3lieym2gjef-result-1",
            name: "Option 1",
            value: new Result({
                products: DefaultCombination.of(testComponentFive.toReference(), 10)
            })
        })

    ])
});

/**
* Essences: 2 Types, 2 total
* Catalysts: 1
* Ingredient Options: 1 Catalyst only
* Result Options: 1
* */
const testRecipeFive: Recipe = new DefaultRecipe({
    id: "fequ5qvoqh",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Five", "Compendium.module.compendium-name.fequ5qvoqh"),
    requirementOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "fequ5qvoqh-requirement-1",
            name: "Option 1",
            value: new Requirement({
                catalysts: DefaultCombination.of(testComponentFour.toReference(), 1),
                essences: DefaultCombination.ofUnits([
                    new DefaultUnit(elementalFire.toReference(), 1),
                    new DefaultUnit(elementalWater.toReference(), 1)
                ])
            })
        }),
    ]),
    resultOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "fequ5qvoqh-result-1",
            name: "Option 1",
            value: new Result({
                products: DefaultCombination.of(testComponentFive.toReference(), 10)
            })
        }),
    ])
});

/**
* Essences: 2 Types, 4 total
* Catalysts: None
* Ingredient Options: 2
* Result Options: 1
* */
const testRecipeSix: Recipe = new DefaultRecipe({
    id: "bx8luu4cpd",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Six", "Compendium.module.compendium-name.bx8luu4cpd"),
    requirementOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "bx8luu4cpd-requirement-1",
            name: "Option 1",
            value: new Requirement({
                ingredients: DefaultCombination.ofUnits([
                    new DefaultUnit(testComponentOne.toReference(), 1),
                    new DefaultUnit(testComponentThree.toReference(), 2)
                ]),
                essences: DefaultCombination.ofUnits([
                    new DefaultUnit(elementalEarth.toReference(), 3),
                    new DefaultUnit(elementalWater.toReference(), 1)
                ]),
            }),
        }),
        new DefaultSerializableOption({
            id: "bx8luu4cpd-requirement-2",
            name: "Option 2",
            value: new Requirement({
                ingredients: DefaultCombination.of(testComponentTwo.toReference(), 1),
                essences: DefaultCombination.ofUnits([
                    new DefaultUnit(elementalEarth.toReference(), 3),
                    new DefaultUnit(elementalWater.toReference(), 1)
                ]),
            })
        }),
    ]),
    resultOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "bx8luu4cpd-result-1",
            name: "Option 1",
            value: new Result({
                products: DefaultCombination.of(testComponentThree.toReference(), 2)
            }),
        }),
        new DefaultSerializableOption({
            id: "bx8luu4cpd-result-2",
            name: "Option 2",
            value: new Result({
                products: DefaultCombination.of(testComponentFive.toReference(), 2)
            })
        }),
    ])
});

/**
* Essences: None
* Catalysts: None
* Ingredient Options: 1
* Result Options: 1
* */
const testRecipeSeven: Recipe = new DefaultRecipe({
    id: "8kimdf8z83",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: buildPendingItemData("Test Recipe Seven", "Compendium.module.compendium-name.8kimdf8z83"),
    requirementOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "8kimdf8z83-requirement-1",
            name: "Option 1",
            value: new Requirement({
                ingredients: DefaultCombination.of(testComponentFour.toReference(), 1)
            })
        }),
    ]),
    resultOptions: new DefaultSerializableOptions([
        new DefaultSerializableOption({
            id: "8kimdf8z83-result-1",
            name: "Option 1",
            value: new Result({
                products: DefaultCombination.of(testComponentTwo.toReference(), 2)
            })
        }),
    ])
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
        if (recipe.loaded) {
            recipe.itemData = buildPendingItemData(recipe.itemData.name, recipe.itemData.uuid);
        }
    });
}

export { resetAllTestRecipes }