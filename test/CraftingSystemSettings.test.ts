import {expect, test, describe, beforeEach} from "@jest/globals";
import {FabricateSettingsManager} from "../src/scripts/interface/settings/FabricateSettings";
import * as Sinon from "sinon";
import {GameProvider} from "../src/scripts/foundry/GameProvider";

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

    test("Should load current version without mapping", async () => {
        const underTest = new FabricateSettingsManager({
            gameProvider: stubGameProvider
        });
        const testSystemId = "abc123";
        const name = "Name";
        const summary = "Summary";
        const description = "Description";
        const author = "Author";
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems.${testSystemId}`)
            .returns({
                type: "CraftingSystem",
                version: "2",
                value: {
                    details: {
                        name: name,
                        summary: summary,
                        description: description,
                        author: author
                    }
                }
            })
        const result = await underTest.loadCraftingSystem(testSystemId);
        expect(result.details.name).toEqual(name);
        expect(result.details.summary).toEqual(summary);
        expect(result.details.description).toEqual(description);
        expect(result.details.author).toEqual(author);
    });

    test("Should map to new version when loading old version", async () => {
        const underTest = new FabricateSettingsManager({
            gameProvider: stubGameProvider
        });
        const testSystemId = "abc123";
        const name = "Name";
        const summary = "Summary";
        const description = "Description";
        const author = "Author";
        stubGetSettingsMethod.withArgs("fabricate", `craftingSystems.${testSystemId}`)
            .returns({
                type: "CraftingSystem",
                version: "1",
                value: {
                    name: name,
                    summary: summary,
                    description: description,
                    author: author
                }
            })
        const result = await underTest.loadCraftingSystem(testSystemId);
        expect(result.details.name).toEqual(name);
        expect(result.details.summary).toEqual(summary);
        expect(result.details.description).toEqual(description);
        expect(result.details.author).toEqual(author);
    });

    test("Should drop unversioned settings", async () => {
        const underTest = new FabricateSettingsManager({
            gameProvider: stubGameProvider
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
                [testSystemId]: testSystem
            })
        await expect(() => underTest.loadCraftingSystem(testSystemId))
            .rejects
            .toThrow("Could not read crafting system settings for system ID \"" + testSystemId + "\". ");
    });

});