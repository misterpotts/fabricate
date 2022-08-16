import { describe, expect, test, jest } from '@jest/globals';
import * as Sinon from "sinon";
import * as fs from 'fs/promises';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystemSpecification} from "../src/scripts/system/specification/CraftingSystemSpecification";
import {CompendiumImporter} from "../src/scripts/system/CompendiumImporter";
import {JsonCompendiumProvider} from "./stubs/JsonCompendiumProvider";
import {PartDictionary} from "../src/scripts/system/PartDictionary";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('A Crafting System Factory', () => {

    test('should create a new Crafting System from a valid specification', async () => {
        const rawSystemSpec = await fs.readFile('./src/resources/alchemists-supplies-v16-system-spec.json', {encoding: 'utf8'});
        expect(rawSystemSpec).not.toBeNull();
        const jsonSystemSpec = JSON.parse(rawSystemSpec);
        const systemSpec: CraftingSystemSpecification = <CraftingSystemSpecification> jsonSystemSpec;

        const rawCompendiumData = await fs.readFile('./src/packs/alchemists-supplies-v16.db', {encoding: 'utf8'});
        const jsonDocuments: {}[] = rawCompendiumData.split("\n")
            .map(line => JSON.parse(line));
        const jsonCompendiumProvider: JsonCompendiumProvider = new JsonCompendiumProvider(new Map<string, {}[]>([["fabricate.alchemists-supplies-v16", jsonDocuments]]));
        const compendiumImporter: CompendiumImporter = new CompendiumImporter(jsonCompendiumProvider);
        const partDictionary: PartDictionary = await compendiumImporter.import(systemSpec.id, systemSpec.compendia, systemSpec.essences);

        const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory(systemSpec, partDictionary);
        const craftingSystem: CraftingSystem = craftingSystemFactory.make();

        expect(craftingSystem).not.toBeNull();
    });

});
