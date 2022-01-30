import * as fs from 'fs';
import {expect} from 'chai';
import {Done} from "mocha";
import ErrnoException = NodeJS.ErrnoException;
import {CraftingSystemRegistry} from "../../src/scripts/registries/CraftingSystemRegistry";
import {CraftingSystemSpecification} from "../../src/scripts/core/CraftingSystemSpecification";
import {CraftingSystemFactory, FileReadingCraftingSystemFactory} from "../../src/scripts/core/CraftingSystemFactory";
import {CraftingSystem} from "../../src/scripts/core/CraftingSystem";
import {Recipe} from "../../src/scripts/core/Recipe";
import {CraftingComponent} from "../../src/scripts/core/CraftingComponent";

const factoriesByCompendiumPackKey: Map<string, CraftingSystemFactory> = new Map<string, CraftingSystemFactory>();

before((done: Done) => {
    const bundleDirectory = './src/packs/';
    fs.readdir(bundleDirectory, (err: ErrnoException, fileNames: string[]) => {
        if (err) {
            throw new Error(`Unable to read contents of directory ${bundleDirectory}. `);
        }
        const compendiumPackFilePaths: Map<string, string> = new Map(fileNames.map((fileName: string) => ['fabricate.' + fileName.substring(0, fileName.length - 3), bundleDirectory + fileName]));
        compendiumPackFilePaths.forEach( (filePath: string, compendiumKey: string) => {
            const systemSpecifications = CraftingSystemRegistry.systemSpecifications();
            const systemSpec: CraftingSystemSpecification = systemSpecifications.find((systemSpec: CraftingSystemSpecification) => systemSpec.compendiumPackKey === compendiumKey);
            const craftingSystemFactory: CraftingSystemFactory = new FileReadingCraftingSystemFactory(systemSpec, filePath);
            factoriesByCompendiumPackKey.set(compendiumKey, craftingSystemFactory);
        });
        done();
    });
});

describe('Bundles |', () => {

    describe('Validation |', () => {

        it('Should Build Test System from Compendium Data', async ()=> {

            const factory: CraftingSystemFactory = factoriesByCompendiumPackKey.get('fabricate.fabricate-test');
            const testSystem: CraftingSystem = await factory.make();
            expect(testSystem).to.exist;
            expect(testSystem.recipes.length).to.equal(1);
            expect(testSystem.components.length).to.equal(3);

        });

        it('Should Alchemist\'s Supplies v1.6 System from Compendium Data', async ()=> {

            const factory: CraftingSystemFactory = factoriesByCompendiumPackKey.get('fabricate.alchemists-supplies-v16');
            const testSystem: CraftingSystem = await factory.make();
            expect(testSystem).to.exist;
            const recipeNames = testSystem.recipes.map((recipe: Recipe) => recipe.name).join(', ');
            const expectedRecipeCount = 15;
            expect(testSystem.recipes.length, `Expected ${expectedRecipeCount} Recipes. Found ${testSystem.recipes.length}: ${recipeNames}`).to.equal(expectedRecipeCount);
            const componentNames = testSystem.components.map((component: CraftingComponent) => component.name).join(', ');
            const expectedComponentCount = 30;
            expect(testSystem.components.length, `Expected ${expectedComponentCount} Components. Found ${testSystem.components.length}: ${componentNames}`).to.equal(expectedComponentCount);
            expect(testSystem.components.length + testSystem.recipes.length).to.equal(45);

        });

    });

});