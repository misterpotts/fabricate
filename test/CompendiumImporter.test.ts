import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";
import {CompendiumImporter} from "../src/scripts/system/CompendiumImporter";
import {CompendiumProvider} from "../src/scripts/foundry/CompendiumProvider";
import {DND5ECraftingSystemSpecification} from "../src/scripts/system/specification/DND5ECraftingSystemSpecification";
import {GameSystem} from "../src/scripts/system/GameSystem";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {PartDictionary} from "../src/scripts/system/PartDictionary";
import {Recipe} from "../src/scripts/crafting/Recipe";
import {FabricateCompendiumData, FabricateItemType} from "../src/scripts/compendium/CompendiumData";
import {Combination} from "../src/scripts/common/Combination";
import {FabricateItem} from "../src/scripts/common/FabricateItem";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";
import {EssenceDefinition} from "../src/scripts/common/EssenceDefinition";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const stubCompendiumProvider: CompendiumProvider = <CompendiumProvider><unknown>{
    getCompendium: () => {}
};
const stubGetCompendiumMethod = Sandbox.stub(stubCompendiumProvider, 'getCompendium');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create and configure', () => {

    test('Should create a Compendium Importer', () => {
        const underTest = new CompendiumImporter(stubCompendiumProvider);
        expect(underTest).not.toBeNull();
    });

});

describe('Import', () => {

    test('Should Import a complete System Specification across 3 separate Compendiums', async () => {

        const stubCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeOne),
            recipeAsCompendiumItem(testRecipeTwo),
            componentAsCompendiumItem(testComponentFive)
        ]);
        const stubCompendiumTwo: Compendium = stubItemsCompendium('test.pack-2', [
            recipeAsCompendiumItem(testRecipeThree),
            componentAsCompendiumItem(testComponentFour),
            componentAsCompendiumItem(testComponentThree),
            componentAsCompendiumItem(testComponentTwo)
        ]);
        const stubCompendiumThree: Compendium = stubItemsCompendium('test.pack-3', [
            recipeAsCompendiumItem(testRecipeFour),
            componentAsCompendiumItem(testComponentOne)
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(stubCompendiumOne.collection)
            .withCompendiumPack(stubCompendiumTwo.collection)
            .withCompendiumPack(stubCompendiumThree.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalFire)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalEarth)
            .build();

        stubGetCompendiumMethod.withArgs(stubCompendiumOne.collection).returns(stubCompendiumOne);
        stubGetCompendiumMethod.withArgs(stubCompendiumTwo.collection).returns(stubCompendiumTwo);
        stubGetCompendiumMethod.withArgs(stubCompendiumThree.collection).returns(stubCompendiumThree);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        const result: PartDictionary = await underTest.import(testSpecification);

        expect(result).not.toBeNull();
        expect(result.size()).toEqual(9);
        expect(result.getRecipes().length).toEqual(4);
        expect(result.getComponents().length).toEqual(5);

        expect(result.getComponent(testComponentOne.partId, testComponentOne.systemId).compendiumId).toEqual(stubCompendiumThree.collection);
        expect(result.getComponent(testComponentTwo.partId, testComponentTwo.systemId).compendiumId).toEqual(stubCompendiumTwo.collection);
        expect(result.getComponent(testComponentThree.partId, testComponentThree.systemId).compendiumId).toEqual(stubCompendiumTwo.collection);
        expect(result.getComponent(testComponentFour.partId, testComponentFour.systemId).compendiumId).toEqual(stubCompendiumTwo.collection);
        expect(result.getComponent(testComponentFive.partId, testComponentFive.systemId).compendiumId).toEqual(stubCompendiumOne.collection);

        expect(result.getRecipe(testRecipeOne.partId, testRecipeOne.systemId).compendiumId).toEqual(stubCompendiumOne.collection);
        expect(result.getRecipe(testRecipeTwo.partId, testRecipeTwo.systemId).compendiumId).toEqual(stubCompendiumOne.collection);
        expect(result.getRecipe(testRecipeThree.partId, testRecipeThree.systemId).compendiumId).toEqual(stubCompendiumTwo.collection);
        expect(result.getRecipe(testRecipeFour.partId, testRecipeFour.systemId).compendiumId).toEqual(stubCompendiumThree.collection);

    });

    test('Should throw an Error when a Component includes essences that do not exist in the System Specification', async () => {

        const mockCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeOne),
            recipeAsCompendiumItem(testRecipeTwo),
            componentAsCompendiumItem(testComponentFive)
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalEarth)
            .build();

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        let error: Error;
        try {
            await underTest.import(testSpecification);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual('Unable to import COMPONENT with Fabricate Part ID \'74K6TAuSg2xzd209\' ' +
                'from Compendium Entry with ID \'74K6TAuSg2xzd209\' specified in Compendium with Pack Key \'test.pack-1\' ' +
                'into System \'fabricate.test-system\'. ' +
                'Caused by: Essence \'fire\' does not exist in the Crafting System Specification. ' +
                'The available Essences are \'water\', \'air\', \'earth\'');

    });

    test('Should throw an Error when a Recipe specifies essences that do not exist in the System Specification', async () => {

        const mockCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeOne),
            recipeAsCompendiumItem(testRecipeThree),
            componentAsCompendiumItem(testComponentFour)
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalFire)
            .build();

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        let error: Error;
        try {
            await underTest.import(testSpecification);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual('Unable to import RECIPE with Fabricate Part ID \'eT4j7mNbZGHIUOtT\' ' +
            'from Compendium Entry with ID \'eT4j7mNbZGHIUOtT\' specified in Compendium with Pack Key \'test.pack-1\' ' +
            'into System \'fabricate.test-system\'. ' +
            'Caused by: Essence \'earth\' does not exist in the Crafting System Specification. ' +
            'The available Essences are \'water\', \'air\', \'fire\'');

    });

    test('Should throw an Error when a Component references a salvage Component that does not exist', async () => {

        const invalidComponentId = 'notAValidId123';
        const invalidComponent = CraftingComponent.builder()
            .withName('Invalid Component')
            .withSystemId(testComponentFour.systemId)
            .withCompendiumId(testComponentFour.compendiumId)
            .withPartId(invalidComponentId)
            .build();
        const mockCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            componentAsCompendiumItem(testComponentFour.toBuilder()
                .withSalvage(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalFire)
            .withEssence(elementalEarth)
            .build();

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        let error: Error;
        try {
            await underTest.import(testSpecification);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual('Unable to resolve Component references for Item ' +
            '\'Ra2Z1ujre76weR0i:fabricate.test-system\'. Caused by: Crafting Component ' +
            '\'notAValidId123:fabricate.test-system\' does not exist. ');

    });

    test('Should throw an Error when a Recipe references an ingredient Component that does not exist', async () => {

        const invalidComponentId = 'notAValidId123';
        const invalidComponent = CraftingComponent.builder()
            .withName('Invalid Component')
            .withSystemId(testComponentFour.systemId)
            .withCompendiumId(testComponentFour.compendiumId)
            .withPartId(invalidComponentId)
            .build();
        const mockCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeThree.toBuilder()
                .withIngredients(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalFire)
            .withEssence(elementalEarth)
            .build();

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        let error: Error;
        try {
            await underTest.import(testSpecification);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual('Unable to resolve Component references for Item ' +
            '\'eT4j7mNbZGHIUOtT:fabricate.test-system\'. Caused by: Crafting Component ' +
            '\'notAValidId123:fabricate.test-system\' does not exist. ');

    });

    test('Should throw an Error when a Recipe references a catalyst Component that does not exist', async () => {

        const invalidComponentId = 'notAValidId123';
        const invalidComponent = CraftingComponent.builder()
            .withName('Invalid Component')
            .withSystemId(testComponentFour.systemId)
            .withCompendiumId(testComponentFour.compendiumId)
            .withPartId(invalidComponentId)
            .build();
        const mockCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeThree.toBuilder()
                .withCatalysts(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalFire)
            .withEssence(elementalEarth)
            .build();

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        let error: Error;
        try {
            await underTest.import(testSpecification);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual('Unable to resolve Component references for Item ' +
            '\'eT4j7mNbZGHIUOtT:fabricate.test-system\'. Caused by: Crafting Component ' +
            '\'notAValidId123:fabricate.test-system\' does not exist. ');

    });

    test('Should throw an Error when a Recipe references a result Component that does not exist', async () => {

        const invalidComponentId = 'notAValidId123';
        const invalidComponent = CraftingComponent.builder()
            .withName('Invalid Component')
            .withSystemId(testComponentFour.systemId)
            .withCompendiumId(testComponentFour.compendiumId)
            .withPartId(invalidComponentId)
            .build();
        const mockCompendiumOne: Compendium = stubItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeThree.toBuilder()
                .withResults(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: DND5ECraftingSystemSpecification = DND5ECraftingSystemSpecification.builder()
            .withName('Test System')
            .withId('fabricate.test-system')
            .withSummary('A test system for Compendium importing')
            .withDescription('This Test System does nothing except serve as a vehicle for importing compendiums')
            .withSupportedGameSystem(GameSystem.DND5E)
            .withCompendiumPack(mockCompendiumOne.collection)
            .withCraftingCheckEnabled(false)
            .withEssence(elementalWater)
            .withEssence(elementalAir)
            .withEssence(elementalFire)
            .withEssence(elementalEarth)
            .build();

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);

        const underTest = new CompendiumImporter(stubCompendiumProvider);

        let error: Error;
        try {
            await underTest.import(testSpecification);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual('Unable to resolve Component references for Item ' +
            '\'eT4j7mNbZGHIUOtT:fabricate.test-system\'. Caused by: Crafting Component ' +
            '\'notAValidId123:fabricate.test-system\' does not exist. ');

    });

});

function stubItemsCompendium(packKey: string, items: Item[]): Compendium {
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
        id: component.partId,
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
        id: recipe.partId,
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