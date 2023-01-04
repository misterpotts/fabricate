import {beforeEach, describe, expect, jest, test} from '@jest/globals';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {SYSTEM_DATA as AlchemistsSupplies} from "../src/scripts/system_definitions/AlchemistsSuppliesV16"
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {Combination} from "../src/scripts/common/Combination";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('A Crafting System Factory', () => {

    test('should create a new Crafting System from a valid specification', async () => {

        const systemSpec = AlchemistsSupplies.definition;

        const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory({
            documentManager: StubDocumentManager.forPartDefinitions({
                craftingComponentsJson: Array.from(Object.values(systemSpec.parts.components)),
                recipesJson: Array.from(Object.values(systemSpec.parts.recipes))
            })
        });

        const result: CraftingSystem = await craftingSystemFactory.make(systemSpec);

        expect(result).not.toBeNull();
        await result.loadPartDictionary();

        expect(result.id).toEqual("alchemists-supplies-v1.6");
        expect(result.enabled).toEqual(true);

        const essences = await result.getEssences();
        const essenceIds = Object.keys(systemSpec.parts.essences);
        expect(essences.length).toEqual(essenceIds.length);
        expect(essences.map(essence => essence.id)).toEqual(expect.arrayContaining(essenceIds));

        const components = await result.getComponents();
        const componentIds = Object.keys(systemSpec.parts.components);
        expect(components.length).toEqual(componentIds.length);
        expect(components.map(component => component.id)).toEqual(expect.arrayContaining(componentIds));
        components.map(component => component.essences)
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY())
            .members
            .forEach(essence => expect(essences).toContain(essence));

        const recipes = await result.getRecipes();
        const recipeIds = Object.keys(systemSpec.parts.recipes);
        expect(recipes.length).toEqual(recipeIds.length);
        expect(recipes.map(recipe => recipe.id)).toEqual(expect.arrayContaining(recipeIds));
        recipes.map(recipe => recipe.getNamedComponents().combineWith(recipe.getSelectedResults()))
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY())
            .members
            .forEach(component => expect(components).toContain(component));

        recipes.map(recipe => recipe.essences)
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY())
            .members
            .forEach(essence => expect(essences).toContain(essence));

        // todo: enable when implemented with new logic
        // expect(craftingSystem.hasRecipeCraftingCheck).toEqual(true);
        // expect(craftingSystem.hasAlchemyCraftingCheck).toEqual(true);
        // expect(craftingSystem.supportsAlchemy).toEqual(true);
        // expect(craftingSystem.alchemyFormulae.size).toEqual(1);

        // const alchemicalBombPartId = "90z9nOwmGnP4aUUk";
        // expect(craftingSystem.alchemyFormulae.has(alchemicalBombPartId)).toEqual(true);

        //const alchemyFormula = craftingSystem.alchemyFormulae.get(alchemicalBombPartId);
        // const allEffects = alchemyFormula.getAllEffects();

        // const damageEffectCount = allEffects.filter(effect => effect instanceof Damage5e).length;
        // const descriptiveEffectCount = allEffects.filter(effect => effect instanceof DescriptiveEffect5e).length;
        // const savingThrowEffectCount = allEffects.filter(effect => effect instanceof SavingThrowModifier5e).length;
        // const diceMultiplierEffectCount = allEffects.filter(effect => effect instanceof DiceMultiplier5e).length;
        // const aoeExtensionEffectCount = allEffects.filter(effect => effect instanceof AoeExtension5e).length;
        // expect(allEffects.length).toEqual(8);
        // expect(damageEffectCount).toEqual(3);
        // expect(descriptiveEffectCount).toEqual(2);
        // expect(savingThrowEffectCount).toEqual(1);
        // expect(diceMultiplierEffectCount).toEqual(1);
        // expect(aoeExtensionEffectCount).toEqual(1);

    });

});
