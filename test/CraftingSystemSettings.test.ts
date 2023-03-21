import {expect, test, describe, beforeEach} from "@jest/globals";
import {
    DefaultSettingManager,
    FabricateSetting,
    FabricateSettingMigrator,
    SettingState
} from "../src/scripts/settings/FabricateSetting";
import * as Sinon from "sinon";
import {GameProvider} from "../src/scripts/foundry/GameProvider";
import {CraftingSystemJson} from "../src/scripts/system/CraftingSystem";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const stubGameObject: Game = <Game><unknown>{
    settings: {
        set: () => {},
        get: () => {}
    }
};
const stubGetSettingsMethod = Sandbox.stub(stubGameObject.settings, "get");
const stubSetSettingsMethod = Sandbox.stub(stubGameObject.settings, "set");

const stubGameProvider: GameProvider = <GameProvider><unknown>{
    get: () => {}
};
const stubGetGameMethod = Sandbox.stub(stubGameProvider, "get");

beforeEach(() => {
    Sandbox.reset();

    stubGetGameMethod.returns(stubGameObject);
    stubSetSettingsMethod.resolves();
});

describe("Settings Manager", () => {

    const targetVersion = "2";
    const craftingSystemsKey = "craftingSystems";

    test("Should load current version without mapping", async () => {
        const underTest = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
            gameProvider: stubGameProvider,
            targetVersion: targetVersion,
            settingKey: craftingSystemsKey
        });
        const testSystemId = "abc123";
        const name = "Name";
        const summary = "Summary";
        const description = "Description";
        const author = "Author";
        stubGetSettingsMethod.withArgs("fabricate", craftingSystemsKey)
            .returns({
                version: targetVersion,
                value: {
                    [testSystemId]: <CraftingSystemJson>{
                        id: testSystemId,
                        details: {
                            name: name,
                            summary: summary,
                            description: description,
                            author: author
                        },
                        parts: {
                            essences: {},
                            recipes: {},
                            components: {}
                        },
                        enabled: true,
                        locked: false
                    }
                }
            })
        const result: Record<string, CraftingSystemJson> = await underTest.read();
        const resultValue = result[testSystemId];
        expect(resultValue.details.name).toEqual(name);
        expect(resultValue.details.summary).toEqual(summary);
        expect(resultValue.details.description).toEqual(description);
        expect(resultValue.details.author).toEqual(author);
    });

    interface OldVersion {
        id: string,
        name: string,
        description: string;
        author: string;
        summary: string;
        essences: {},
        recipes: {},
        components: {}
        config: {
            enabled: boolean;
            locked: boolean;
        };
    }

    test("Should migrate to new version", async () => {
        const stubSettingMigrator: FabricateSettingMigrator<Record<string, OldVersion>, Record<string, CraftingSystemJson>> = {
            fromVersion: "1",
            toVersion: "2",
            perform: from => {
                const mappedEntries = Object.values(from)
                    .map(oldVersion => {
                        const mapped = <CraftingSystemJson>{
                            id: oldVersion.id,
                            details: {
                                name: oldVersion.name,
                                description: oldVersion.description,
                                author: oldVersion.author,
                                summary: oldVersion.summary
                            },
                            parts: {
                                components: oldVersion.components,
                                recipes: oldVersion.recipes,
                                essences: oldVersion.essences
                            },
                            enabled: oldVersion.config.enabled,
                            locked: oldVersion.config.locked
                        }
                        return [mapped.id, mapped];
                    });
                return Object.fromEntries(mappedEntries);
            }
        };
        const noOpSettingsMigrator: FabricateSettingMigrator<any, any> = {
            fromVersion: "0",
            toVersion: "1",
            perform: (input) => input
        }
        const underTest = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
            gameProvider: stubGameProvider,
            targetVersion: targetVersion,
            settingKey: craftingSystemsKey,
            settingsMigrators: [stubSettingMigrator, noOpSettingsMigrator]
        });
        const testSystemId = "abc123";
        const name = "Name";
        const summary = "Summary";
        const description = "Description";
        const author = "Author";
        stubGetSettingsMethod.withArgs("fabricate", craftingSystemsKey)
            .returns({
                version: "0",
                value: {
                    [testSystemId]: <OldVersion>{
                        id: testSystemId,
                        name: name,
                        summary: summary,
                        description: description,
                        author: author,
                        essences: {},
                        recipes: {},
                        components: {},
                        config: {
                            enabled: true,
                            locked: false
                        }
                    }
                }
            })

        const checkResult = underTest.check();
        expect(checkResult.validationCheck.isValid).toEqual(true);
        expect(checkResult.state).toEqual(SettingState.OUTDATED);
        expect(checkResult.migrationCheck.requiresMigration).toEqual(true);
        expect(checkResult.migrationCheck.currentVersion).toEqual("0");
        expect(checkResult.migrationCheck.targetVersion).toEqual("2");

        const migrationResult = await underTest.migrate();
        expect(migrationResult.isSuccessful).toEqual(true);
        expect(migrationResult.steps).toEqual(2);
        expect(migrationResult.initialVersion).toEqual("0");
        expect(migrationResult.finalVersion).toEqual("2");

        const savedSetting = stubSetSettingsMethod.getCall(0).args[2] as FabricateSetting<Record<string, CraftingSystemJson>>;

        expect(savedSetting).not.toBeNull();
        expect(savedSetting.version).toEqual("2");
        const resultValue = savedSetting.value;
        expect(resultValue[testSystemId]).not.toBeNull();
        const migratedValue = resultValue[testSystemId];
        expect(migratedValue.details.name).toEqual(name);
        expect(migratedValue.details.summary).toEqual(summary);
        expect(migratedValue.details.description).toEqual(description);
        expect(migratedValue.details.author).toEqual(author);
    });

    test("Should throw error when setting is null", async () => {
        const underTest = new DefaultSettingManager({
            gameProvider: stubGameProvider,
            targetVersion: "1",
            settingKey: craftingSystemsKey
        });
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems`)
            .returns(null);
        await expect(() => underTest.read()).toThrow("Unable to read setting value for key craftingSystems. ");
    });

    test("Should throw error when settings version is null", async () => {
        const underTest = new DefaultSettingManager({
            gameProvider: stubGameProvider,
            targetVersion: "1",
            settingKey: craftingSystemsKey
        });
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems`)
            .returns({
                version: null,
                value: {}
            });
        await expect(() => underTest.read()).toThrow("Unable to read setting value for key craftingSystems. ");
    });

    test("Should throw error when setting value is null", async () => {
        const underTest = new DefaultSettingManager({
            gameProvider: stubGameProvider,
            targetVersion: "1",
            settingKey: craftingSystemsKey
        });
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems`)
            .returns({
                version: "1",
                value: null
            });
        await expect(() => underTest.read()).toThrow("Unable to read setting value for key craftingSystems. ");
    });

});