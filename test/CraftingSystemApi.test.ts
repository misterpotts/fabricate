import {beforeEach, describe, expect, test} from "@jest/globals";
import {CraftingSystemData, DefaultCraftingSystemApi} from "../src/scripts/api/CraftingSystemApi";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import {DefaultSettingManager} from "../src/scripts/api/SettingManager";
import Properties from "../src/scripts/Properties";
import {CraftingSystemSettingValidator} from "../src/scripts/api/CraftingSystemSettingValidator";
import * as Sinon from "sinon";
import {ALCHEMISTS_SUPPLIES_SYSTEM_DATA} from "../src/scripts/system/bundled/AlchemistsSuppliesV16";
import {UserDefinedCraftingSystem} from "../src/scripts/system/CraftingSystem";
import {CraftingSystemDetails} from "../src/scripts/system/CraftingSystemDetails";

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


    test("should create a new crafting system with details", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        stubClientSettingsGet.returns({systemsById: {}});

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const expectedName = "Expected name";
        const expectedSummary = "Expected summary";
        const expectedDescription = "Expected description";
        const expectedAuthor = "Expected author";

        const result = await underTest.create({
            name: expectedName,
            summary: expectedSummary,
            description: expectedDescription,
            author: expectedAuthor
        });

        expect(result).not.toBeUndefined();
        expect(typeof result.id).toEqual("string");
        expect(result.details.name).toEqual(expectedName);
        expect(result.details.summary).toEqual(expectedSummary);
        expect(result.details.description).toEqual(expectedDescription);
        expect(result.details.author).toEqual(expectedAuthor);

    });

    test("should fail to create a new crafting system without details", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        stubClientSettingsGet.returns({systemsById: {}});

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        await expect(underTest.create())
            .rejects
            .toThrowError();

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("error");
    });

    test("should fail to create a new crafting system with the same ID as an embedded system", async () => {

        const identityFactory = new StubIdentityFactory(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.id);
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        stubClientSettingsGet.returns({systemsById: {}});

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: ALCHEMISTS_SUPPLIES_SYSTEM_DATA.gameSystem
        });
        const expectedName = "Expected name";
        const expectedSummary = "Expected summary";
        const expectedDescription = "Expected description";
        const expectedAuthor = "Expected author";

        await expect(underTest.create({
            name: expectedName,
            summary: expectedSummary,
            description: expectedDescription,
            author: expectedAuthor
        }))
            .rejects
            .toThrowError();

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("error");
    });

});

describe("Read", () => {

    test("should return crafting system if exists", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        const craftingSystemId = identityFactory.make();
        const expectedName = "Crafting system name";
        const expectedSummary = "Crafting system summary";
        const expectedDescription = "Crafting system description";
        const expectedAuthor = "Crafting system author";
        const expectedLocked = false;
        const expectedEnabled = true;
        stubClientSettingsGet.returns({
            systemsById: {
                [craftingSystemId]: {
                    details: {
                        name: expectedName,
                        summary: expectedSummary,
                        description: expectedDescription,
                        author: expectedAuthor
                    },
                    locked: expectedLocked,
                    enabled: expectedEnabled
                }
            }
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const result = await underTest.getById(craftingSystemId);

        expect(result).not.toBeUndefined();
        expect(result.id).toEqual(craftingSystemId);
        expect(result.details.name).toEqual(expectedName);
        expect(result.details.summary).toEqual(expectedSummary);
        expect(result.details.description).toEqual(expectedDescription);
        expect(result.details.author).toEqual(expectedAuthor);
        expect(result.isLocked).toEqual(expectedLocked);
        expect(result.isEnabled).toEqual(expectedEnabled);

    });

    test("should return user defined and embedded crafting systems", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        const expectedUserDefinedSystemOne = new UserDefinedCraftingSystem({
            id: identityFactory.make(),
            enabled: true,
            craftingSystemDetails: new CraftingSystemDetails({
                name: "User defined name one",
                summary: "User defined summary one",
                description: "User defined description one",
                author: "User defined author one"
            })
        });
        const expectedUserDefinedSystemTwo = new UserDefinedCraftingSystem({
            id: identityFactory.make(),
            enabled: true,
            craftingSystemDetails: new CraftingSystemDetails({
                name: "User defined name two",
                summary: "User defined summary two",
                description: "User defined description two",
                author: "User defined author two"
            })
        });
        stubClientSettingsGet.returns({
            systemsById: {
                [expectedUserDefinedSystemOne.id]: {
                    details: {
                        name: expectedUserDefinedSystemOne.details.name,
                        summary: expectedUserDefinedSystemOne.details.summary,
                        description: expectedUserDefinedSystemOne.details.description,
                        author: expectedUserDefinedSystemOne.details.author
                    },
                    locked: expectedUserDefinedSystemOne.isLocked,
                    enabled: expectedUserDefinedSystemOne.isEnabled
                },
                [expectedUserDefinedSystemTwo.id]: {
                    details: {
                        name: expectedUserDefinedSystemTwo.details.name,
                        summary: expectedUserDefinedSystemTwo.details.summary,
                        description: expectedUserDefinedSystemTwo.details.description,
                        author: expectedUserDefinedSystemTwo.details.author
                    },
                    locked: expectedUserDefinedSystemTwo.isLocked,
                    enabled: expectedUserDefinedSystemTwo.isEnabled
                }
            }
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: ALCHEMISTS_SUPPLIES_SYSTEM_DATA.gameSystem
        });

        const result = await underTest.getAll();

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(3);
        expect(result.has(expectedUserDefinedSystemOne.id)).toEqual(true);
        expect(result.has(expectedUserDefinedSystemTwo.id)).toEqual(true);
        expect(result.has(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.id)).toEqual(true);

    });

    test("should return embedded crafting system if exists", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        stubClientSettingsGet.returns({
            systemsById: {}
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: ALCHEMISTS_SUPPLIES_SYSTEM_DATA.gameSystem
        });

        const result = await underTest.getById(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.id);

        expect(result).not.toBeUndefined();
        expect(result.id).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.id);
        expect(result.details.name).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.definition.details.name);
        expect(result.details.summary).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.definition.details.summary);
        expect(result.details.description).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.definition.details.description);
        expect(result.details.author).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.definition.details.author);
        expect(result.isEnabled).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.definition.enabled);
        expect(result.isLocked).toEqual(true);

    });

    test("should return undefined if system does not exist", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        stubClientSettingsGet.returns({
            systemsById: {}
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const result = await underTest.getById(identityFactory.make());

        expect(result).toBeUndefined();

    });

});

describe("Update", () => {

    test("should update system if exists and changes valid", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        const craftingSystemId = identityFactory.make();
        stubClientSettingsGet.returns({
            systemsById: {
                [craftingSystemId]: {
                    details: {
                        name: "Crafting system name",
                        summary: "Crafting system summary",
                        description: "Crafting system description",
                        author: "Crafting system author"
                    },
                    locked: false,
                    enabled: true
                }
            }
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const craftingSystemToModify = await underTest.getById(craftingSystemId);

        craftingSystemToModify.isEnabled = false;
        const expectedName = "New name";
        const expectedSummary = "New summary";
        const expectedDescription = "New description";
        const expectedAuthor = "New author";
        craftingSystemToModify.details.name = expectedName;
        craftingSystemToModify.details.summary = expectedSummary;
        craftingSystemToModify.details.description = expectedDescription;
        craftingSystemToModify.details.author = expectedAuthor;

        const result = await underTest.save(craftingSystemToModify);

        expect(result.id).toEqual(craftingSystemId);
        expect(result.isLocked).toEqual(craftingSystemToModify.isLocked);
        expect(result.isEnabled).toEqual(craftingSystemToModify.isEnabled);
        expect(result.details.name).toEqual(expectedName);
        expect(result.details.summary).toEqual(expectedSummary);
        expect(result.details.description).toEqual(expectedDescription);
        expect(result.details.author).toEqual(expectedAuthor);

    });

    test("should reject update if system changes are not valid", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        const craftingSystemId = identityFactory.make();
        stubClientSettingsGet.returns({
            systemsById: {
                [craftingSystemId]: {
                    details: {
                        name: "Crafting system name",
                        summary: "Crafting system summary",
                        description: "Crafting system description",
                        author: "Crafting system author"
                    },
                    locked: false,
                    enabled: true
                }
            }
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const craftingSystemToModify = await underTest.getById(craftingSystemId);

        craftingSystemToModify.isEnabled = false;
        craftingSystemToModify.details.name = "";
        craftingSystemToModify.details.summary = "";
        craftingSystemToModify.details.description = "";
        craftingSystemToModify.details.author = "";

       await expect(underTest.save(craftingSystemToModify))
           .rejects
           .toThrowError();

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("error");

    });

});

describe("Delete", () => {

    test("should delete system if exists", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        const craftingSystemId = identityFactory.make();
        const expectedName = "Crafting system name";
        const expectedSummary = "Crafting system summary";
        const expectedDescription = "Crafting system description";
        const expectedAuthor = "Crafting system author";
        const expectedLocked = false;
        const expectedEnabled = true;
        stubClientSettingsGet.returns({
            systemsById: {
                [craftingSystemId]: {
                    details: {
                        name: expectedName,
                        summary: expectedSummary,
                        description: expectedDescription,
                        author: expectedAuthor
                    },
                    locked: expectedLocked,
                    enabled: expectedEnabled
                }
            }
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const result = await underTest.deleteById(craftingSystemId);

        expect(result).not.toBeUndefined();
        expect(result.id).toEqual(craftingSystemId);
        expect(result.details.name).toEqual(expectedName);
        expect(result.details.summary).toEqual(expectedSummary);
        expect(result.details.description).toEqual(expectedDescription);
        expect(result.details.author).toEqual(expectedAuthor);
        expect(result.isLocked).toEqual(expectedLocked);
        expect(result.isEnabled).toEqual(expectedEnabled);

    });

    test("should return undefined if system does not exist", async () => {

        const identityFactory = new StubIdentityFactory();
        const localizationService = new StubLocalizationService();
        const notificationService = new StubNotificationService();
        const settingManager = new DefaultSettingManager<CraftingSystemData>({
            clientSettings,
            moduleId: Properties.module.id,
            settingKey: "craftingSystems",
            settingValidator: new CraftingSystemSettingValidator(),
            localizationService,
            notificationService
        });

        stubClientSettingsGet.returns({
            systemsById: {}
        });

        const underTest = new DefaultCraftingSystemApi({
            identityFactory,
            settingManager,
            localizationService,
            notificationService,
            gameSystem: "DnD5e"
        });

        const result = await underTest.deleteById(identityFactory.make());

        expect(result).toBeUndefined();

    });

});