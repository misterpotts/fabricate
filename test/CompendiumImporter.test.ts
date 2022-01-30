import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";
import {CompendiumImporter} from "../src/scripts/system/CompendiumImporter";
import {CompendiumProvider} from "../src/scripts/foundry/CompendiumProvider";
import {CraftingSystemSpecification} from "../src/scripts/system/CraftingSystemSpecification";
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

        stubGetCompendiumMethod.withArgs(mockCompendiumOne.collection).returns(mockCompendiumOne);
        stubGetCompendiumMethod.withArgs(mockCompendiumTwo.collection).returns(mockCompendiumTwo);
        stubGetCompendiumMethod.withArgs(mockCompendiumThree.collection).returns(mockCompendiumThree);

        const underTest = new CompendiumImporter(mockCompendiumProvider);

        const result: PartDictionary = await underTest.import(testSpecification);

        expect(result).not.toBeNull();
        expect(result.size()).toEqual(9);
        expect(result.getRecipes().length).toEqual(4);
        expect(result.getComponents().length).toEqual(5);

        expect(result.getComponent(testComponentOne.partID extends Item, testComponentOne.systemId).compendiumId).toEqual(mockCompendiumThree.collection);
        expect(result.getComponent(testComponentTwo.partID extends Item, testComponentTwo.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getComponent(testComponentThree.partID extends Item, testComponentThree.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getComponent(testComponentFour.partID extends Item, testComponentFour.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getComponent(testComponentFive.partID extends Item, testComponentFive.systemId).compendiumId).toEqual(mockCompendiumOne.collection);

        expect(result.getRecipe(testRecipeOne.partID extends Item, testRecipeOne.systemId).compendiumId).toEqual(mockCompendiumOne.collection);
        expect(result.getRecipe(testRecipeTwo.partID extends Item, testRecipeTwo.systemId).compendiumId).toEqual(mockCompendiumOne.collection);
        expect(result.getRecipe(testRecipeThree.partID extends Item, testRecipeThree.systemId).compendiumId).toEqual(mockCompendiumTwo.collection);
        expect(result.getRecipe(testRecipeFour.partID extends Item, testRecipeFour.systemId).compendiumId).toEqual(mockCompendiumThree.collection);

    });

    test('Should throw an Error when a Component includes essences that do not exist in the System Specification', async () => {

        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeOne),
            recipeAsCompendiumItem(testRecipeTwo),
            componentAsCompendiumItem(testComponentFive)
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
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

        const underTest = new CompendiumImporter(mockCompendiumProvider);

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

        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeOne),
            recipeAsCompendiumItem(testRecipeThree),
            componentAsCompendiumItem(testComponentFour)
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
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

        const underTest = new CompendiumImporter(mockCompendiumProvider);

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
        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            componentAsCompendiumItem(testComponentFour.toBuilder()
                .withSalvage(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
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

        const underTest = new CompendiumImporter(mockCompendiumProvider);

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
        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeThree.toBuilder()
                .withIngredients(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
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

        const underTest = new CompendiumImporter(mockCompendiumProvider);

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
        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeThree.toBuilder()
                .withCatalysts(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
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

        const underTest = new CompendiumImporter(mockCompendiumProvider);

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
        const mockCompendiumOne: Compendium = mockItemsCompendium('test.pack-1', [
            recipeAsCompendiumItem(testRecipeThree.toBuilder()
                .withResults(Combination.of(invalidComponent, 1))
                .build())
        ]);

        const testSpecification: CraftingSystemSpecification = CraftingSystemSpecification.builder()
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

        const underTest = new CompendiumImporter(mockCompendiumProvider);

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
            partId: component.partID extends Item,
            systemId: component.systemId
        },
        component: {
            essences: essenceCombinationToObjectKeys(component.essences),
            salvage: combinationToObjectKeys(component.salvage)
        }
    };
    return {
        id: component.partID extends Item,
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
            partId: recipe.partID extends Item,
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
        id: recipe.partID extends Item,
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
