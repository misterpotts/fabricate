import {beforeEach, describe, expect, jest, test} from '@jest/globals';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {ALCHEMISTS_SUPPLIES_SYSTEM_DATA as AlchemistsSupplies} from "../src/scripts/system/bundled/AlchemistsSuppliesV16"
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
        recipes.flatMap(recipe => recipe.ingredientOptions.map(option => option.ingredients.combineWith(option.catalysts).members))
            .forEach(component => expect(components).toContain(component));
        recipes.flatMap(recipe => recipe.resultOptions.flatMap(option => option.results.members))
            .forEach(component => expect(components).toContain(component));
        recipes.map(recipe => recipe.essences)
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY())
            .members
            .forEach(essence => expect(essences).toContain(essence));

    });

});
