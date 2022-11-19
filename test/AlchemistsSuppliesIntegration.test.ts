import {beforeEach, describe, expect, jest, test} from '@jest/globals';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {SYSTEM_DEFINITION as AlchemistsSupplies} from "../src/scripts/system_definitions/AlchemistsSuppliesV16"
import {DocumentManager} from "../src/scripts/foundry/DocumentManager";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

class StubDocumentManager implements DocumentManager {

    getDocumentByUuid(_id: string): Promise<any> {
        return Promise.resolve({
            name: "Item name",
            img: "path/to/image/webp",
            uuid: "NOT_A_UUID"
        });
    }

    getDocumentsByUuid(ids: string[]): Promise<any[]> {
        return Promise.all(ids.map(id => this.getDocumentByUuid(id)));
    }

}

describe('A Crafting System Factory', () => {

    test('should create a new Crafting System from a valid specification', async () => {

        const systemSpec = AlchemistsSupplies;

        const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory({
            documentManager: new StubDocumentManager()
        });

        const craftingSystem: CraftingSystem = await craftingSystemFactory.make(systemSpec);

        expect(craftingSystem).not.toBeNull();
        await craftingSystem.loadPartDictionary();

        expect(craftingSystem.id).toEqual("alchemists-supplies-v1.6");
        expect(craftingSystem.enabled).toEqual(true);
        expect(craftingSystem.essences.length).toEqual(6);
        expect(craftingSystem.essences.map(essence => essence.id))
            .toEqual(expect.arrayContaining(["water", "fire", "earth", "air", "negative-energy", "positive-energy"]));
        const components = craftingSystem.partDictionary.getComponents();
        expect(components.length).toEqual(30);
        components.forEach(component => {
            const retrieved = craftingSystem.partDictionary.getComponent(component.id)
            expect(retrieved.id).toEqual(component.id);
            component.essences.members.forEach(essenceId => {
                expect(craftingSystem.partDictionary.hasEssence(essenceId.elementId)).toEqual(true);
            });
        })
        const recipes = craftingSystem.partDictionary.getRecipes();
        expect(recipes.length).toEqual(15);
        recipes.forEach(recipe => {
            const retrieved = craftingSystem.partDictionary.getRecipe(recipe.id)
            expect(retrieved.id).toEqual(recipe.id);
            recipe.essences.members.forEach(essenceId => {
                expect(craftingSystem.partDictionary.hasEssence(essenceId.elementId)).toEqual(true);
            });
            recipe.resultOptions.forEach(resultGroup => {
                resultGroup.members.members.forEach(componentId => {
                    expect(craftingSystem.partDictionary.hasComponent(componentId.elementId)).toEqual(true);
                });
            });
        })

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
