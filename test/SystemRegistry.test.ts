import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";
import {DefaultSettingManager} from "../src/scripts/settings/FabricateSetting";
import {GameProvider} from "../src/scripts/foundry/GameProvider";
import {ComponentJson} from "../src/scripts/crafting/component/Component";
import {DefaultSystemRegistry} from "../src/scripts/registries/SystemRegistry";
import {CraftingSystem, CraftingSystemJson} from "../src/scripts/system/CraftingSystem";
import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {RecipeJson} from "../src/scripts/crafting/recipe/Recipe";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {FabricateItemData, LoadedFabricateItemData} from "../src/scripts/foundry/DocumentManager";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const stubGameObject = <Game><unknown>{
    settings: {
        get: () => {},
        set: () => {}
    }
}
const stubGetSettingsMethod = Sandbox.stub(stubGameObject.settings, "get");
const stubGameProvider: GameProvider = <GameProvider><unknown>{
    get: () => stubGameObject
}

beforeEach(() => {
    Sandbox.reset();
});

function randomIdentifier(): string {
    return (Math.random() + 1)
        .toString(36)
        .substring(2);
}

describe("integration test", () => {

    const systemOneId = randomIdentifier();
    const componentOneId = randomIdentifier();
    const componentOneItemUuid = randomIdentifier();
    const componentTwoItemUuid = randomIdentifier();
    const componentTwoId = randomIdentifier();
    const componentThreeItemUuid = randomIdentifier();
    const componentThreeId = randomIdentifier();
    const essenceOneId = randomIdentifier();
    const essenceTwoId = randomIdentifier();
    const essenceThreeId = randomIdentifier();
    const optionOneId = "Option One"
    const optionTwoId = "Option Two"

    const componentOne: ComponentJson = {
        itemUuid: componentOneItemUuid,
        essences: {
            [essenceOneId]: 2,
            [essenceTwoId]: 1,
        },
        salvageOptions: {
            [optionOneId]: {
                [componentTwoId]: 2
            }
        },
        disabled: false
    };
    const componentTwo: ComponentJson = {
        itemUuid: componentTwoItemUuid,
        essences: {
            [essenceThreeId]: 1
        },
        salvageOptions: {},
        disabled: false
    };
    const componentThree: ComponentJson = {
        itemUuid: componentThreeItemUuid,
        essences: {},
        salvageOptions: {
            [optionOneId]: {
                [componentOneId]: 2,
                [componentTwoId]: 1
            }
        },
        disabled: true
    };

    const recipeOneItemUuid = randomIdentifier();
    const recipeOneId = randomIdentifier();
    const recipeTwoItemUuid = randomIdentifier();
    const recipeTwoId = randomIdentifier();
    const recipeThreeItemUuid = randomIdentifier();
    const recipeThreeId = randomIdentifier();

    const recipeOne: RecipeJson = {
        itemUuid: recipeOneItemUuid,
        essences: {
            [essenceOneId]: 1,
            [essenceTwoId]: 2
        },
        requirementOptions: {},
        resultOptions: {
            [optionOneId]: {
                [componentOneId]: 1
            }
        },
        disabled: true
    };
    const recipeTwo: RecipeJson = {
        itemUuid: recipeTwoItemUuid,
        essences: {},
        requirementOptions: {
            [optionOneId]: {
                catalysts: {
                    [componentThreeId]: 1
                },
                ingredients: {
                    [componentOneId]: 1
                }
            }
        },
        resultOptions: {
            [optionOneId]: {
                [componentTwoId]: 1
            }
        },
        disabled: false
    };
    const recipeThree: RecipeJson = {
        itemUuid: recipeThreeItemUuid,
        essences: {},
        requirementOptions: {
            [optionOneId]: {
                ingredients: {
                    [componentOneId]: 1,
                    [componentTwoId]: 1
                },
                catalysts: {}
            },
            [optionTwoId]: {
                ingredients: {
                    [componentTwoId]: 2
                },
                catalysts: {}
            }
        },
        resultOptions: {
            [optionOneId]: {
                [componentThreeId]: 1
            }
        },
        disabled: false
    };

    const systemOne: CraftingSystemJson = {
        id: systemOneId,
        parts: {
            components: {
                [componentOneId]: componentOne,
                [componentTwoId]: componentTwo,
                [componentThreeId]: componentThree
            },
            recipes: {
                [recipeOneId]: recipeOne,
                [recipeTwoId]: recipeTwo,
                [recipeThreeId]: recipeThree
            },
            essences: {
                [essenceOneId]: {
                    name: "Essence Name",
                    iconCode: "fa-solid circle",
                    tooltip: "Tooltip text",
                    description: "Essence description",
                    activeEffectSourceItemUuid: componentOneItemUuid
                },
                [essenceTwoId]: {
                    name: "Essence Name",
                    iconCode: "fa-solid circle",
                    tooltip: "Tooltip text",
                    description: "Essence description",
                    activeEffectSourceItemUuid: componentTwoItemUuid
                },
                [essenceThreeId]: {
                    name: "Essence Name",
                    iconCode: "fa-solid circle",
                    tooltip: "Tooltip text",
                    description: "Essence description",
                    activeEffectSourceItemUuid: undefined
                }
            }
        },
        details: {
            name: "System 1",
            author: "Test User",
            description: "Crafting system 1",
            summary: "The first crafting system"
        },
        locked: true,
        enabled: true
    }

    const systemTwoId = randomIdentifier();
    const systemTwo: CraftingSystemJson = {
        id: systemTwoId,
        details: {
            name: "System 2",
            author: "Test User",
            description: "Crafting system 2",
            summary: "The second crafting system"
        },
        locked: false,
        enabled: true,
        parts: {
            recipes: {},
            components: {},
            essences: {}
        }
    }

    const storedSettingsValue = {
        version: "1",
        value: {
            [systemOneId]: systemOne,
            [systemTwoId]: systemTwo
        }
    };

    const itemData: Map<string, FabricateItemData> = new Map([
        [
            componentOneItemUuid,
            new LoadedFabricateItemData({
                name: "Component One", imageUrl: "path/to/img.webp", itemUuid: componentOneItemUuid, sourceDocument: componentOne
            })
        ],
        [
            componentTwoItemUuid,
            new LoadedFabricateItemData({
                name: "Component Two", imageUrl: "path/to/img.webp", itemUuid: componentTwoItemUuid, sourceDocument: componentTwo
            })
        ],
        [
            componentThreeItemUuid,
            new LoadedFabricateItemData({
                name: "Component Three", imageUrl: "path/to/img.webp", itemUuid: componentThreeItemUuid, sourceDocument: componentThree
            })
        ],
        [
            recipeOneItemUuid,
            new LoadedFabricateItemData({
                name: "Recipe One", imageUrl: "path/to/img.webp", itemUuid: recipeOneItemUuid, sourceDocument: recipeOne
            })
        ],
        [
            recipeTwoItemUuid,
            new LoadedFabricateItemData({
                name: "Recipe Two", imageUrl: "path/to/img.webp", itemUuid: recipeTwoItemUuid, sourceDocument: recipeTwo
            })
        ],
        [
            recipeThreeItemUuid,
            new LoadedFabricateItemData({
                name: "Recipe Three", imageUrl: "path/to/img.webp", itemUuid: recipeThreeItemUuid, sourceDocument: recipeThree
            })
        ],
    ]);

    test('Should read all settings values and build crafting system correctly', async () => {

        const fabricateSettingsManager = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
            gameProvider: stubGameProvider,
            targetVersion: "1",
            settingKey: "ANY_KEY"
        });
        stubGetSettingsMethod.returns(storedSettingsValue);

        const stubDocumentManager = new StubDocumentManager(itemData);
        const craftingSystemFactory = new CraftingSystemFactory({
            documentManager: stubDocumentManager
        });
        const underTest = new DefaultSystemRegistry({
            settingManager: fabricateSettingsManager,
            craftingSystemFactory,
            gameSystem: "dnd5e"
        });

        const result: Map<string, CraftingSystem> = await underTest.getAllCraftingSystems();

        expect(result).not.toBeUndefined();
        const craftingSystemOne = result.get(systemOneId);

        expect(craftingSystemOne).not.toBeUndefined();
        await craftingSystemOne.loadPartDictionary();

        const essences = craftingSystemOne.getEssences();
        expect(essences.length).toEqual(3);
        expect(craftingSystemOne.hasEssence(essenceOneId)).toEqual(true);
        expect(craftingSystemOne.hasEssence(essenceTwoId)).toEqual(true);
        expect(craftingSystemOne.hasEssence(essenceThreeId)).toEqual(true);

        const components = craftingSystemOne.getComponents();
        expect(components.length).toEqual(3);
        expect(craftingSystemOne.hasPart(componentOneId)).toEqual(true);
        expect(craftingSystemOne.hasPart(componentTwoId)).toEqual(true);
        expect(craftingSystemOne.hasPart(componentThreeId)).toEqual(true);

        const componentOneResult = craftingSystemOne.getComponentById(componentOneId);
        expect(componentOneResult.id).toEqual(componentOneId);
        expect(componentOneResult.name).toEqual(itemData.get(componentOneItemUuid).name);
        expect(componentOneResult.imageUrl).toEqual(itemData.get(componentOneItemUuid).imageUrl);
        expect(componentOneResult.salvageOptions.length).toEqual(1);
        expect(componentOneResult.salvageOptions[0].salvage.size).toEqual(2);
        expect(componentOneResult.essences.size).toEqual(3);
        expect(componentOneResult.essences.amountFor(essenceOneId)).toEqual(2);
        expect(componentOneResult.essences.amountFor(essenceTwoId)).toEqual(1);

        const recipes = craftingSystemOne.getRecipes();
        expect(recipes.length).toEqual(3);
        expect(craftingSystemOne.hasPart(recipeOneId)).toEqual(true);
        expect(craftingSystemOne.hasPart(recipeTwoId)).toEqual(true);
        expect(craftingSystemOne.hasPart(recipeThreeId)).toEqual(true);

        const recipeOneResult = await craftingSystemOne.getRecipeById(recipeOneId);
        expect(recipeOneResult.id).toEqual(recipeOneId);
        expect(recipeOneResult.name).toEqual(itemData.get(recipeOneItemUuid).name);
        expect(recipeOneResult.imageUrl).toEqual(itemData.get(recipeOneItemUuid).imageUrl);
        expect(recipeOneResult.essences.amountFor(essenceOneId)).toEqual(1);
        expect(recipeOneResult.essences.amountFor(essenceTwoId)).toEqual(2);
        expect(recipeOneResult.ingredientOptions.length).toEqual(0);
        expect(recipeOneResult.hasIngredients).toEqual(false);
        expect(recipeOneResult.resultOptions.length).toEqual(1);
        expect(recipeOneResult.hasResults).toEqual(true);

        const serialized = craftingSystemOne.toJson();
        expect(serialized).toEqual(storedSettingsValue.value[craftingSystemOne.id])

    });

});


