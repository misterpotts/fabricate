import {beforeEach, describe, expect, jest, test} from '@jest/globals';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
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
import {SYSTEM_DEFINITION as AlchemistsSupplies} from "../src/scripts/system_definitions/AlchemistsSuppliesV16"

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

        const systemSpec = AlchemistsSupplies;

        const stubDiceRoller: DiceRoller = <DiceRoller><unknown> {
            fromExpression: () => {}
        }

        const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory({
            rollProviderFactory: stubRollProviderFactory,
            diceRoller: stubDiceRoller
        });

        const craftingSystem: CraftingSystem = await craftingSystemFactory.make(systemSpec);

        expect(craftingSystem).not.toBeNull();
        expect(craftingSystem.id).toEqual("alchemists-supplies-v1.6");
        expect(craftingSystem.enabled).toEqual(true);
        expect(craftingSystem.essences.length).toEqual(6);
        expect(craftingSystem.essences.map(essence => essence.id))
            .toEqual(expect.arrayContaining(["water", "fire", "earth", "air", "negative-energy", "positive-energy"]));
        expect(craftingSystem.hasRecipeCraftingCheck).toEqual(true);
        expect(craftingSystem.hasAlchemyCraftingCheck).toEqual(true);
        //expect(craftingSystem.partDictionary.getComponents().length).toEqual(30); // todo: figure out a good way to test this in the new world where the bundled compendium isn't the only authority
        //expect(craftingSystem.partDictionary.getRecipes().length).toEqual(15);
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
