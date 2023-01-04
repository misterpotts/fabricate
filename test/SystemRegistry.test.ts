import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";
import {DefaultSettingManager} from "../src/scripts/interface/settings/FabricateSettings";
import {GameProvider} from "../src/scripts/foundry/GameProvider";
import {CraftingComponentJson} from "../src/scripts/common/CraftingComponent";
import {DefaultSystemRegistry, ErrorDecisionType} from "../src/scripts/registries/SystemRegistry";
import {CraftingSystem, CraftingSystemJson} from "../src/scripts/system/CraftingSystem";
import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {RecipeJson} from "../src/scripts/crafting/Recipe";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {FabricateItemData} from "../src/scripts/foundry/DocumentManager";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const stubGameObject = <Game><unknown>{
    settings: {
        get: () => {},
        set: () => {}
    }
}
const stubGetSettingsMethod = Sandbox.stub(stubGameObject.settings, "get");
const stubGameProvider: GameProvider = <GameProvider><unknown>{
    globalGameObject: () => stubGameObject
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
    const componentOneItemUuid = randomIdentifier();
    const componentTwoItemUuid = randomIdentifier();
    const componentThreeItemUuid = randomIdentifier();
    const essenceOneId = randomIdentifier();
    const essenceTwoId = randomIdentifier();
    const essenceThreeId = randomIdentifier();

    const componentOne: CraftingComponentJson = {
        itemUuid: componentOneItemUuid,
        essences: {
            [essenceOneId]: 2,
            [essenceTwoId]: 1,
        },
        salvage: {
            [componentTwoItemUuid]: 2
        }
    };
    const componentTwo: CraftingComponentJson = {
        itemUuid: componentTwoItemUuid,
        essences: {
            [essenceThreeId]: 1
        },
        salvage: {}
    };
    const componentThree: CraftingComponentJson = {
        itemUuid: componentThreeItemUuid,
        essences: {},
        salvage: {
            [componentOneItemUuid]: 2,
            [componentTwoItemUuid]: 1,
        }
    };

    const recipeOneItemUuid = randomIdentifier();
    const recipeTwoItemUuid = randomIdentifier();
    const recipeThreeItemUuid = randomIdentifier();

    const recipeOne: RecipeJson = {
        itemUuid: recipeOneItemUuid,
        catalysts: {},
        essences: {
            [essenceOneId]: 1,
            [essenceTwoId]: 2
        },
        ingredientGroups: [],
        resultGroups: [{
            [componentOneItemUuid]: 1
        }]
    };
    const recipeTwo: RecipeJson = {
        itemUuid: recipeTwoItemUuid,
        catalysts: {
            [componentThreeItemUuid]: 1
        },
        essences: {},
        ingredientGroups: [{
            [componentOneItemUuid]: 1
        }],
        resultGroups: [{
            [componentTwoItemUuid]: 1
        }]
    };
    const recipeThree: RecipeJson = {
        itemUuid: recipeThreeItemUuid,
        catalysts: {},
        essences: {},
        ingredientGroups: [
            {
                [componentOneItemUuid]: 1,
                [componentTwoItemUuid]: 1
            },
            {
                [componentTwoItemUuid]: 2
            }
        ],
        resultGroups: [{
            [componentThreeItemUuid]: 1
        }]
    };

    const systemOne: CraftingSystemJson = {
        id: systemOneId,
        parts: {
            components: {
                [componentOneItemUuid]: componentOne,
                [componentTwoItemUuid]: componentTwo,
                [componentThreeItemUuid]: componentThree
            },
            recipes: {
                [recipeOneItemUuid]: recipeOne,
                [recipeTwoItemUuid]: recipeTwo,
                [recipeThreeItemUuid]: recipeThree
            },
            essences: {
                [essenceOneId]: {
                    id: essenceOneId,
                    name: "Essence Name",
                    iconCode: "fa-solid circle",
                    tooltip: "Tooltip text",
                    description: "Essence description"
                },
                [essenceTwoId]: {
                    id: essenceTwoId,
                    name: "Essence Name",
                    iconCode: "fa-solid circle",
                    tooltip: "Tooltip text",
                    description: "Essence description"
                },
                [essenceThreeId]: {
                    id: essenceThreeId,
                    name: "Essence Name",
                    iconCode: "fa-solid circle",
                    tooltip: "Tooltip text",
                    description: "Essence description"
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
        [componentOneItemUuid, {name: "Component One", imageUrl: "path/to/img.webp", uuid: componentOneItemUuid, source: componentOne}],
        [componentTwoItemUuid, {name: "Component Two", imageUrl: "path/to/img.webp", uuid: componentTwoItemUuid, source: componentTwo}],
        [componentThreeItemUuid, {name: "Component Three", imageUrl: "path/to/img.webp", uuid: componentThreeItemUuid, source: componentThree}],
        [recipeOneItemUuid, {name: "Recipe One", imageUrl: "path/to/img.webp", uuid: recipeOneItemUuid, source: recipeOne}],
        [recipeTwoItemUuid, {name: "Recipe Two", imageUrl: "path/to/img.webp", uuid: recipeTwoItemUuid, source: recipeTwo}],
        [recipeThreeItemUuid, {name: "Recipe Three", imageUrl: "path/to/img.webp", uuid: recipeThreeItemUuid, source: recipeThree}],
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
            gameSystem: "dnd5e",
            errorDecisionProvider: () => Promise.resolve(ErrorDecisionType.RETAIN)
        });

        const result: Map<string, CraftingSystem> = await underTest.getAllCraftingSystems();

        expect(result).not.toBeUndefined();
        const craftingSystemOne = result.get(systemOneId);

        expect(craftingSystemOne).not.toBeUndefined();
        await craftingSystemOne.loadPartDictionary();

        const essences = await craftingSystemOne.getEssences();
        expect(essences.length).toEqual(3);
        expect(craftingSystemOne.hasEssence(essenceOneId)).toEqual(true);
        expect(craftingSystemOne.hasEssence(essenceTwoId)).toEqual(true);
        expect(craftingSystemOne.hasEssence(essenceThreeId)).toEqual(true);

        const components = await craftingSystemOne.getComponents();
        expect(components.length).toEqual(3);
        expect(craftingSystemOne.hasPart(componentOneItemUuid)).toEqual(true);
        expect(craftingSystemOne.hasPart(componentTwoItemUuid)).toEqual(true);
        expect(craftingSystemOne.hasPart(componentThreeItemUuid)).toEqual(true);

        const componentOneResult = await craftingSystemOne.getComponentById(componentOneItemUuid);
        expect(componentOneResult.id).toEqual(componentOneItemUuid);
        expect(componentOneResult.name).toEqual(itemData.get(componentOneItemUuid).name);
        expect(componentOneResult.imageUrl).toEqual(itemData.get(componentOneItemUuid).imageUrl);
        expect(componentOneResult.salvage.size).toEqual(2);
        expect(componentOneResult.salvage.amountFor(componentTwoItemUuid)).toEqual(2);
        expect(componentOneResult.essences.size).toEqual(3);
        expect(componentOneResult.essences.amountFor(essenceOneId)).toEqual(2);
        expect(componentOneResult.essences.amountFor(essenceTwoId)).toEqual(1);

        const recipes = await craftingSystemOne.getRecipes();
        expect(recipes.length).toEqual(3);
        expect(craftingSystemOne.hasPart(recipeOneItemUuid)).toEqual(true);
        expect(craftingSystemOne.hasPart(recipeTwoItemUuid)).toEqual(true);
        expect(craftingSystemOne.hasPart(recipeThreeItemUuid)).toEqual(true);

        const recipeOneResult = await craftingSystemOne.getRecipeById(recipeOneItemUuid);
        expect(recipeOneResult.id).toEqual(recipeOneItemUuid);
        expect(recipeOneResult.name).toEqual(itemData.get(recipeOneItemUuid).name);
        expect(recipeOneResult.imageUrl).toEqual(itemData.get(recipeOneItemUuid).imageUrl);
        expect(recipeOneResult.essences.amountFor(essenceOneId)).toEqual(1);
        expect(recipeOneResult.essences.amountFor(essenceTwoId)).toEqual(2);
        expect(recipeOneResult.catalysts.size).toEqual(0);
        expect(recipeOneResult.ingredientOptions.size).toEqual(0);
        expect(recipeOneResult.resultOptions.size).toEqual(1);

    });

});


