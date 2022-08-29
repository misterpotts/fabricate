import {beforeEach, describe, expect, jest, test} from '@jest/globals';
import * as fs from 'fs/promises';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystemDefinition} from "../src/scripts/registries/system_definitions/interface/CraftingSystemDefinition";
import {CompendiumImporter} from "../src/scripts/system/CompendiumImporter";
import {JsonCompendiumProvider} from "./stubs/JsonCompendiumProvider";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import {GameSystem} from "../src/scripts/system/GameSystem";
import * as Sinon from "sinon";
import {RollModifierProviderFactory} from "../src/scripts/crafting/check/GameSystemRollModifierProvider";
import {
    AoeExtension5e,
    Damage5e,
    DescriptiveEffect5e,
    DiceMultiplier5e,
    SavingThrowModifier5e
} from "../src/scripts/5e/AlchemicalEffect5E";
import {DiceRoller} from "../src/scripts/foundry/DiceRoller";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

const stubRollProviderFactory: RollModifierProviderFactory<Actor> = <RollModifierProviderFactory<Actor>><unknown>{
    make: () => {}
};

describe('A Crafting System Factory', () => {

    test('should create a new Crafting System from a valid specification', async () => {

        const rawSystemSpec = await fs.readFile('./src/resources/alchemists-supplies-v16-system-spec.json', {encoding: 'utf8'});
        expect(rawSystemSpec).not.toBeNull();
        const jsonSystemSpec = JSON.parse(rawSystemSpec);
        const systemSpec=  <CraftingSystemDefinition>jsonSystemSpec;

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
        const jsonCompendiumProvider = new JsonCompendiumProvider(new Map<string, {}[]>([["fabricate.alchemists-supplies-v16", jsonDocuments]]));
        const compendiumImporter = new CompendiumImporter(jsonCompendiumProvider);
        const partDictionary = await compendiumImporter.import(systemSpec.id, systemSpec.compendia, systemSpec.essences);

        const stubDiceRoller: DiceRoller = <DiceRoller><unknown> {
            fromExpression: () => {}
        }

        const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory({
            specification: systemSpec,
            partDictionary: partDictionary,
            rollProviderFactory: stubRollProviderFactory,
            diceRoller: stubDiceRoller
        });

        const craftingSystem: CraftingSystem = craftingSystemFactory.make();

        expect(craftingSystem).not.toBeNull();
        expect(craftingSystem.id).toEqual("alchemists-supplies-v1.6");
        expect(craftingSystem.enabled).toEqual(true);
        expect(craftingSystem.gameSystem).toEqual(GameSystem.DND5E);
        expect(craftingSystem.essences.length).toEqual(6);
        expect(craftingSystem.essences.map(essence => essence.slug))
            .toEqual(expect.arrayContaining(["water", "fire", "earth", "air", "negative-energy", "positive-energy"]));
        expect(craftingSystem.hasRecipeCraftingCheck).toEqual(true);
        expect(craftingSystem.hasAlchemyCraftingCheck).toEqual(true);
        expect(craftingSystem.components.length).toEqual(30);
        expect(craftingSystem.recipes.length).toEqual(15);
        expect(craftingSystem.supportsAlchemy).toEqual(true);
        expect(craftingSystem.alchemyFormulae.size).toEqual(1);

        const alchemicalBombPartId = "90z9nOwmGnP4aUUk";
        expect(craftingSystem.alchemyFormulae.has(alchemicalBombPartId)).toEqual(true);

        const alchemyFormula = craftingSystem.alchemyFormulae.get(alchemicalBombPartId);
        const allEffects = alchemyFormula.getAllEffects();

        const damageEffectCount = allEffects.filter(effect => effect instanceof Damage5e).length;
        const descriptiveEffectCount = allEffects.filter(effect => effect instanceof DescriptiveEffect5e).length;
        const savingThrowEffectCount = allEffects.filter(effect => effect instanceof SavingThrowModifier5e).length;
        const diceMultiplierEffectCount = allEffects.filter(effect => effect instanceof DiceMultiplier5e).length;
        const aoeExtensionEffectCount = allEffects.filter(effect => effect instanceof AoeExtension5e).length;
        expect(allEffects.length).toEqual(8);
        expect(damageEffectCount).toEqual(3);
        expect(descriptiveEffectCount).toEqual(2);
        expect(savingThrowEffectCount).toEqual(1);
        expect(diceMultiplierEffectCount).toEqual(1);
        expect(aoeExtensionEffectCount).toEqual(1);
    });

});
