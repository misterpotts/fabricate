import {test, describe, beforeEach} from "@jest/globals";
import {DefaultRecipeApi} from "../src/scripts/api/RecipeApi"
import {StubCraftingSystemApi} from "./stubs/api/StubCraftingSystemApi";
import {StubEssenceApi} from "./stubs/api/StubEssenceApi";
import {StubComponentApi} from "./stubs/api/StubComponentApi";
import * as Sinon from "sinon";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {DefaultSettingManager} from "../src/scripts/api/SettingManager";
import {CraftingSystemData} from "../src/scripts/api/CraftingSystemApi";
import Properties from "../src/scripts/Properties";
import {CraftingSystemSettingValidator} from "../src/scripts/api/CraftingSystemSettingValidator";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    Sandbox.reset();
});

const clientSettings: ClientSettings = <ClientSettings><unknown>{
    storage: {
        get: () => {}
    },
    get: () => {},
    set: () => {}
};
const stubClientSettingsGet = Sandbox.stub(clientSettings, "get");
const stubClientSettingsSet = Sandbox.stub(clientSettings, "set");
stubClientSettingsSet.returnsArg(0);

describe("Create", () => {

    test("should create a new recipe", () => {

        const craftingSystemApi = new StubCraftingSystemApi();
        const componentApi = new StubComponentApi();
        const essenceApi = new StubEssenceApi();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const documentManager = new StubDocumentManager();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "recipes",
            settingValidator: new RecipeSettingValidator(),
            localizationService,
            notificationService
        });
        const underTest = new DefaultRecipeApi({
            craftingSystemApi,
            essenceApi,
            componentApi,
            localizationService,
            notificationService,
            settingManager
            documentManager
        });

    });

    test("should save a recipe when the crafting system exists", () => {

    });

    test("should not save a recipe when the crafting system doesn't exist", () => {

    });

    test("should not save a recipe when id is not unique", () => {

    });

    test("should not save a recipe when the recipe is invalid", () => {

    });

});

describe("Access", () => {



});

describe("Edit", () => {



});

describe("Delete", () => {



});