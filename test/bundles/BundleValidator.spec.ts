import * as fs from 'fs';
import {expect} from 'chai';
import * as lineReader from 'line-reader';
import {FabricateCompendiumData, FabricateItemType} from "../../src/scripts/game/CompendiumData";
import {Recipe} from "../../src/scripts/core/Recipe";
import {CraftingComponent} from "../../src/scripts/core/CraftingComponent";
import {Done} from "mocha";
import ErrnoException = NodeJS.ErrnoException;
import {CraftingResult} from "../../src/scripts/core/CraftingResult";
import {Ingredient} from "../../src/scripts/core/Ingredient";

const fileContents: Map<string, string[]> = new Map();

before((done: Done) => {
    const bundleDirectory = './src/packs/';
    fs.readdir(bundleDirectory, (err: ErrnoException, fileNames: string[]) => {
        if (err) {
            throw new Error(`Unable to read contents of directory ${bundleDirectory}. `);
        }
        fileNames.forEach((fileName: string) => {
            const path = bundleDirectory + fileName;
            const lines: string[] = [];
            lineReader.eachLine(path, (line: string, last: boolean) => {
                lines.push(line);
                if (last) {
                    fileContents.set(path, lines);
                    if (fileContents.size == fileNames.length) {
                        done();
                    }
                }
            });
        });
    });
});

describe('Bundles |', () => {

    describe('Validation |', () => {

        it('Should not contain invalid Fabricate flags', ()=> {
            expect(fileContents).to.exist;
            expect(fileContents.size).to.be.greaterThan(0);
            const componentsById: Map<string, CraftingComponent> = new Map();
            const recipesByLineNumber: Map<number, Recipe> = new Map();
            fileContents.forEach((lines: string[], fileName: string) => {
                console.log(`Validating ${fileName}. `);
                lines.forEach((line: string, index: number) => {
                    const lineNumber = index + 1;
                    const json = JSON.parse(line);
                    const flags: FabricateCompendiumData = json.flags.fabricate;
                    expect(flags, `Compendium entry on line ${lineNumber} has no Fabricate flags`).to.exist;
                    expect(flags.type).to.be.oneOf([FabricateItemType.COMPONENT, FabricateItemType.RECIPE], 'Did not recognize the Compendium Item type');
                    if (flags.type === FabricateItemType.RECIPE) {
                        const recipe: Recipe = Recipe.fromFlags(flags);
                        expect(recipe.isValid(), `Recipe on line ${lineNumber} has invalid data`).to.be.true;
                        expect(json._id).to.equal(flags.recipe.entryId, `Recipe entry ID on line ${lineNumber} does not match Item ID in Compendium`);
                        expect(json.name).to.equal(flags.recipe.name, `Recipe name on line ${lineNumber} does not match Item name in Compendium`);
                        recipesByLineNumber.set(lineNumber, recipe);
                    } else {
                        const craftingComponent: CraftingComponent = CraftingComponent.fromFlags(flags);
                        expect(craftingComponent.isValid(), `Component on line ${lineNumber} has invalid data`).to.be.true;
                        expect(json._id).to.equal(flags.component.compendiumEntry.entryId, `Component entry ID on line ${lineNumber} does not match Item ID in Compendium`);
                        expect(json.name).to.equal(flags.component.name, `Component name on line ${lineNumber} does not match Item name in Compendium`);
                        componentsById.set(craftingComponent.compendiumEntry.entryId, craftingComponent);
                    }
                });
                recipesByLineNumber.forEach((recipe: Recipe, lineNumber: number) => {
                    recipe.results.forEach((craftingResult: CraftingResult) => {
                        const entryId = craftingResult.item.compendiumEntry.entryId;
                        const craftingComponent = componentsById.get(entryId);
                        expect(craftingComponent, `Crafting Result ${craftingResult.item.name} in Recipe ${recipe.name} on line ${lineNumber} refers to a Crafting Element with ID ${entryId} that does not exist. `).to.exist;
                        expect(craftingComponent.name, `Crafting Result ${craftingResult.item.name} in Recipe ${recipe.name} on line ${lineNumber} does not match that of ${craftingComponent.name}`).to.equal(craftingResult.item.name);
                    });
                    recipe.ingredients.forEach((ingredient: Ingredient) => {
                        const entryId = ingredient.componentType.compendiumEntry.entryId;
                        const craftingComponent = componentsById.get(entryId);
                        expect(craftingComponent, `Crafting Component ${craftingComponent.name} in Recipe ${recipe.name} on line ${lineNumber} refers to a Crafting Element with ID ${entryId} that does not exist. `).to.exist;
                        expect(craftingComponent.name, `Crafting Component ${craftingComponent.name} in Recipe ${recipe.name} on line ${lineNumber} does not match that of ${craftingComponent.name}`).to.equal(craftingComponent.name);
                    });
                });
                console.log(`File ${fileName} is valid. `);
            });
        });

    });

});