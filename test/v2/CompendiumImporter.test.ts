import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";
import {CompendiumImporter} from "../../src/scripts/v2/system/CompendiumImporter";
import {CompendiumProvider} from "../../src/scripts/v2/foundry/CompendiumProvider";
import {CraftingSystemSpecification} from "../../src/scripts/v2/system/CraftingSystemSpecification";
import {GameSystem} from "../../src/scripts/v2/system/GameSystem";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {PartDictionary} from "../../src/scripts/v2/system/PartDictionary";
import {Recipe} from "../../src/scripts/v2/crafting/Recipe";
import {FabricateCompendiumData, FabricateItemType} from "../../src/scripts/v2/compendium/CompendiumData";
import {Combination} from "../../src/scripts/v2/common/Combination";
import {FabricateItem} from "../../src/scripts/v2/common/FabricateItem";
import {CraftingComponent} from "../../src/scripts/v2/common/CraftingComponent";
import {EssenceDefinition} from "../../src/scripts/v2/common/EssenceDefinition";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockCompendiumProvider: CompendiumProvider = <CompendiumProvider><unknown>{
    getCompendium: () => {}
};
const stubGetCompendiumMethod = Sandbox.stub(mockCompendiumProvider, 'getCompendium');

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

    test('Should Import a complete System Specification across 3 separate Compendiums', async () => {

        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeOne),
            recipeAsCompendiumItem(testRecipeTwo),
            componentAsCompendiumItem(testComponentFive)
        ]);
        const mockCompendiumTwo: Compendium = mockItemsCompendium('test.pack-2', [
            recipeAsCompendiumItem(testRecipeThree),
            componentAsCompendiumItem(testComponentFour),
            componentAsCompendiumItem(testComponentThree),
            componentAsCompendiumItem(testComponentTwo)
        ]);
        const mockCompendiumThree: Compendium = mockItemsCompendium('test.pack-3', [
            recipeAsCompendiumItem(testRecipeFour),
            componentAsCompendiumItem(testComponentOne)
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCompendiumPack(mockCompendiumTwo.collection)
            .withCompendiumPack(mockCompendiumThree.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalFire)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalEarth)
            .build();

        const underTest = new CompendiumImporter(mockCompendiumProvider);

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);
        stubGetCompendiumMethod.withArgs(mockCompendiumTwo.collection).returns(mockCompendiumTwo);
        stubGetCompendiumMethod.withArgs(mockCompendiumThree.collection).returns(mockCompendiumThree);

        const result: PartDictionary = await underTest.import(testSpecification);

        expect(result).not.toBeNull();
        expect(result.size()).toEqual(9);
        expect(result.getRecipes().length).toEqual(4);
        expect(result.getComponents().length).toEqual(5);

        expect(result.getComponent(testComponentOne.partId, testComponentOne.systemId).compendiumId).toEqual(mockCompendiumThree.collection);
        expect(result.getComponent(testComponentTwo.partId, testComponentTwo.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getComponent(testComponentThree.partId, testComponentThree.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getComponent(testComponentFour.partId, testComponentFour.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getComponent(testComponentFive.partId, testComponentFive.systemId).compendiumId).toEqual(mockCompendiumOne.collection);

        expect(result.getRecipe(testRecipeOne.partId, testRecipeOne.systemId).compendiumId).toEqual(mockCompendiumOne.collection);
        expect(result.getRecipe(testRecipeTwo.partId, testRecipeTwo.systemId).compendiumId).toEqual(mockCompendiumOne.collection);
        expect(result.getRecipe(testRecipeThree.partId, testRecipeThree.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getRecipe(testRecipeFour.partId, testRecipeFour.systemId).compendiumId).toEqual(mockCompendiumThree.collection);


    });

});

function mockItemsCompendium(packKey: string, items: Item[]): Compendium {
    const mockCompendium: Compendium = <Compendium><unknown>{
        collection: packKey,
        entity: 'Item',
        getContent: () => {}
    };
    const stubGetContentMethod = Sandbox.stub(mockCompendium, 'getContent');
    stubGetContentMethod.resolves(items);
    return mockCompendium;
}

function componentAsCompendiumItem(component: CraftingComponent): Item {
    const fabricateCompendiumData: FabricateCompendiumData = {
        type:FabricateItemType.COMPONENT,
        identity:{
            partId: component.partId,
            systemId: component.systemId
        },
        component: {
            essences: essenceCombinationToObjectKeys(component.essences),
            salvage: combinationToObjectKeys(component.salvage)
        }
    };
    return {
        // @ts-ignore
        data: {
            name: component.name,
            img: component.imageUrl,
            data: {},
            flags: {
                fabricate: fabricateCompendiumData
            }
        }
    }
}

function recipeAsCompendiumItem(recipe: Recipe): Item {
    const fabricateCompendiumData: FabricateCompendiumData = {
        type:FabricateItemType.RECIPE,
        identity:{
            partId: recipe.partId,
            systemId: recipe.systemId
        },
        recipe: {
            essences: essenceCombinationToObjectKeys(recipe.essences),
            results: combinationToObjectKeys(recipe.results),
            ingredients: combinationToObjectKeys(recipe.ingredients),
            catalysts: combinationToObjectKeys(recipe.catalysts)
        }
    };
    return {
        // @ts-ignore
        data: {
            name: recipe.name,
            img: recipe.imageUrl,
            data: {},
            flags: {
                fabricate: fabricateCompendiumData
            }
        }
    }
}

function combinationToObjectKeys(combination: Combination<FabricateItem>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const unit of combination.units) {
        result[unit.part.partId] = unit.quantity;
    }
    return result;
}

function essenceCombinationToObjectKeys(combination: Combination<EssenceDefinition>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const unit of combination.units) {
        result[unit.part.slug] = unit.quantity;
    }
    return result;
}