import {expect, test, describe, beforeEach} from "@jest/globals";
import {DefaultSettingManager, FabricateSettingMigrator} from "../src/scripts/interface/settings/FabricateSettings";
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
    globalGameObject: () => {}
};
const stubGlobalGameObjectMethod = Sandbox.stub(stubGameProvider, "globalGameObject");

beforeEach(() => {
    Sandbox.reset();

    stubGlobalGameObjectMethod.returns(stubGameObject);
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

    test("Should map to new version when loading old version", async () => {
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
            settingsMigrators: new Map([["1", stubSettingMigrator], ["0", noOpSettingsMigrator]])
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
        const result: Record<string, CraftingSystemJson> = await underTest.read();
        const resultValue = result[testSystemId];
        expect(resultValue.details.name).toEqual(name);
        expect(resultValue.details.summary).toEqual(summary);
        expect(resultValue.details.description).toEqual(description);
        expect(resultValue.details.author).toEqual(author);
    });

    test("Should drop unversioned settings", async () => {
        const underTest = new DefaultSettingManager({
            gameProvider: stubGameProvider,
            targetVersion: "1",
            settingKey: craftingSystemsKey
        });
        const testSystemId = "abc123";
        const name = "Name";
        const summary = "Summary";
        const description = "Description";
        const author = "Author";
        const testSystem = {
            name: name,
            summary: summary,
            description: description,
            author: author
        };
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems.${testSystemId}`)
            .returns(testSystem)
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems`)
            .returns({
                value: {
                    [testSystemId]: testSystem
                }
            })
        await expect(() => underTest.read())
            .rejects
            .toThrow(`Unable to read the setting for the key "${craftingSystemsKey}". Caused by: Expected a non-null, non-empty setting version. `);
    });

});