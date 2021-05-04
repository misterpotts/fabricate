import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";
import {CompendiumImporter} from "../../src/scripts/v2/system/CompendiumImporter";
import {CompendiumProvider} from "../../src/scripts/v2/foundry/CompendiumProvider";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockCompendiumProvider: CompendiumProvider = <CompendiumProvider><unknown>{
    getCompendium: () => {}
};
const stubPerformCraftingCheckMethod = Sandbox.stub(mockCompendiumProvider, 'getCompendium');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create and configure', () => {

    test('Should create a Compendium Importer', () => {
        const underTest = new CompendiumImporter(mockCompendiumProvider);
        expect(underTest).not.toBeNull();
    });

});


describe('Import', () => {

    test('Should Import a complete System Specification across 3 separate Compendiums', () => {
        // todo
    });

});