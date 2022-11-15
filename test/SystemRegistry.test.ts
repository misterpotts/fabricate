import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";
import {DefaultSettingsManager} from "../src/scripts/interface/settings/FabricateSettings";
import {GameProvider} from "../src/scripts/foundry/GameProvider";
import Properties from "../src/scripts/Properties";
import {CombinableString, CraftingComponentJson} from "../src/scripts/common/CraftingComponent";
import {DefaultSystemRegistry} from "../src/scripts/registries/SystemRegistry";
import {CraftingSystem, CraftingSystemJson} from "../src/scripts/system/CraftingSystem";
import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {RecipeJson} from "../src/scripts/crafting/Recipe";
import {PartDictionaryFactory, PartLoader} from "../src/scripts/system/PartDictionary";
import {DocumentManager} from "../src/scripts/foundry/DocumentManager";

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

    const itemData: Map<string, RawItemData> = new Map([
        [componentOneItemUuid, {name: "Component One", img: "path/to/img.webp", uuid: componentOneItemUuid}],
        [componentTwoItemUuid, {name: "Component Two", img: "path/to/img.webp", uuid: componentTwoItemUuid}],
        [componentThreeItemUuid, {name: "Component Three", img: "path/to/img.webp", uuid: componentThreeItemUuid}],
        [recipeOneItemUuid, {name: "Recipe One", img: "path/to/img.webp", uuid: recipeOneItemUuid}],
        [recipeTwoItemUuid, {name: "Recipe Two", img: "path/to/img.webp", uuid: recipeTwoItemUuid}],
        [recipeThreeItemUuid, {name: "Recipe Three", img: "path/to/img.webp", uuid: recipeThreeItemUuid}],
    ]);

    test('Should read all settings values and build crafting system correctly', async () => {

        const fabricateSettingsManager = new DefaultSettingsManager({
            gameProvider: stubGameProvider,
            targetVersionsByRootSettingKey: new Map([[Properties.settings.craftingSystems.key, "1"]])
        });
        const stubDocumentManager = new StubDocumentManager(itemData);
        const craftingSystemFactory = new CraftingSystemFactory({
            partDictionaryFactory: new PartDictionaryFactory(new PartLoader(stubDocumentManager))
        });
        const underTest = new DefaultSystemRegistry({settingsManager: fabricateSettingsManager, craftingSystemFactory});

        stubGetSettingsMethod.returns(storedSettingsValue);

        const result: Map<string, CraftingSystem> = await underTest.getAllCraftingSystems();

        expect(result).not.toBeUndefined();
        const craftingSystemOne = result.get(systemOneId);

        expect(craftingSystemOne.partDictionary.getRecipes().length).toEqual(3);
        expect(craftingSystemOne.partDictionary.hasRecipe(recipeOneItemUuid)).toEqual(true);
        expect(craftingSystemOne.partDictionary.hasRecipe(recipeTwoItemUuid)).toEqual(true);
        expect(craftingSystemOne.partDictionary.hasRecipe(recipeThreeItemUuid)).toEqual(true);

        const recipeOneResult = craftingSystemOne.partDictionary.getRecipe(recipeOneItemUuid);
        expect(recipeOneResult.id).toEqual(recipeOneItemUuid);
        expect(recipeOneResult.name).toEqual(itemData.get(recipeOneItemUuid).name);
        expect(recipeOneResult.imageUrl).toEqual(itemData.get(recipeOneItemUuid).img);
        expect(recipeOneResult.essences.amountFor(new CombinableString(essenceOneId))).toEqual(1);
        expect(recipeOneResult.essences.amountFor(new CombinableString(essenceTwoId))).toEqual(2);
        expect(recipeOneResult.catalysts.size()).toEqual(0);
        expect(recipeOneResult.ingredientGroups.length).toEqual(0);
        expect(recipeOneResult.resultGroups.length).toEqual(1);
        expect(recipeOneResult.resultGroups[0].members.size()).toEqual(1);
        expect(recipeOneResult.resultGroups[0].members.has(new CombinableString(componentOneItemUuid))).toEqual(true);

        expect(craftingSystemOne.partDictionary.getComponents().length).toEqual(3);
        expect(craftingSystemOne.partDictionary.hasComponent(componentOneItemUuid)).toEqual(true);
        expect(craftingSystemOne.partDictionary.hasComponent(componentTwoItemUuid)).toEqual(true);
        expect(craftingSystemOne.partDictionary.hasComponent(componentThreeItemUuid)).toEqual(true);

        const componentOneResult = craftingSystemOne.partDictionary.getComponent(componentOneItemUuid);
        expect(componentOneResult.id).toEqual(componentOneItemUuid);
        expect(componentOneResult.name).toEqual(itemData.get(componentOneItemUuid).name);
        expect(componentOneResult.imageUrl).toEqual(itemData.get(componentOneItemUuid).img);
        expect(componentOneResult.salvage.size()).toEqual(2);
        expect(componentOneResult.salvage.amountFor(new CombinableString(componentTwoItemUuid))).toEqual(2);
        expect(componentOneResult.essences.size()).toEqual(3);
        expect(componentOneResult.essences.amountFor(new CombinableString(essenceOneId))).toEqual(2);
        expect(componentOneResult.essences.amountFor(new CombinableString(essenceTwoId))).toEqual(1);

        expect(craftingSystemOne.partDictionary.getEssences().length).toEqual(3);
        expect(craftingSystemOne.partDictionary.hasEssence(essenceOneId)).toEqual(true);
        expect(craftingSystemOne.partDictionary.hasEssence(essenceTwoId)).toEqual(true);
        expect(craftingSystemOne.partDictionary.hasEssence(essenceThreeId)).toEqual(true);

    });

});

interface RawItemData {
    img: string;
    name: string;
    uuid: string;
}

class StubDocumentManager implements DocumentManager {

    private readonly _itemsByUUid: Map<string, RawItemData>;

    constructor(itemsByUUid: Map<string, RawItemData>) {
        this._itemsByUUid = itemsByUUid;
    }

    getDocumentByUuid(id: string): Promise<any> {
        return Promise.resolve(this._itemsByUUid.get(id));
    }
    getDocumentsByUuid(ids: string[]): Promise<any[]> {
        return Promise.resolve(ids.map(id => this._itemsByUUid.get(id)));
    }

    public addItem(uuid: string, data: RawItemData): void {
        this._itemsByUUid.set(uuid, data);
    }

}


