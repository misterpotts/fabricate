import { describe, expect, test } from '@jest/globals';
import * as fs from 'fs/promises';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystemSpec} from "../src/scripts/system/specification/CraftingSystemSpec";
import {CompendiumImporter} from "../src/scripts/system/CompendiumImporter";
import {JsonCompendiumProvider} from "./stubs/JsonCompendiumProvider";
import {PartDictionary} from "../src/scripts/system/PartDictionary";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import {GameSystem} from "../src/scripts/system/GameSystem";

describe('A Crafting System Factory', async () => {

    const rawSystemSpec = await fs.readFile('./src/resources/alchemists-supplies-v16-system-spec.json', {encoding: 'utf8'});
    expect(rawSystemSpec).not.toBeNull();
    const jsonSystemSpec = JSON.parse(rawSystemSpec);
    const systemSpec: CraftingSystemSpec = <CraftingSystemSpec>jsonSystemSpec;

    const rawCompendiumData = await fs.readFile('./src/packs/alchemists-supplies-v16.db', {encoding: 'utf8'});
    const jsonDocuments: {}[] = rawCompendiumData.split("\n")
        .map((line, index) => {
            try {
                return JSON.parse(line);
            } catch (e) {
                const error: Error = e as Error;
                console.log(`Error parsing compendium entry on line ${index + 1}. Caused by: ${error.message} `);
                expect(error).toBeNull();
            }
        });
    const jsonCompendiumProvider: JsonCompendiumProvider = new JsonCompendiumProvider(new Map<string, {}[]>([["fabricate.alchemists-supplies-v16", jsonDocuments]]));
    const compendiumImporter: CompendiumImporter = new CompendiumImporter(jsonCompendiumProvider);
    const partDictionary: PartDictionary = await compendiumImporter.import(systemSpec.id, systemSpec.compendia, systemSpec.essences);

    test('should create a new Crafting System from a valid specification', async () => {

        const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory(systemSpec, partDictionary);
        const craftingSystem: CraftingSystem = craftingSystemFactory.make();

        expect(craftingSystem).not.toBeNull();
        expect(craftingSystem.id).toEqual("alchemists-supplies-v1.6");
        expect(craftingSystem.enabled).toEqual(true);
        expect(craftingSystem.gameSystem).toEqual(GameSystem.DND5E);
        expect(craftingSystem.essences.length).toEqual(6);
        expect(craftingSystem.essences.map(essence => essence.slug))
            .toEqual(expect.arrayContaining(["water", "fire", "earth", "air", "negative-energy", "positive-energy"]));
        expect(craftingSystem.hasCraftingCheck).toEqual(true);
        expect(craftingSystem.components.length).toEqual(30);
        expect(craftingSystem.recipes.length).toEqual(15);
        expect(craftingSystem.supportsAlchemy).toEqual(true);
    });

});
