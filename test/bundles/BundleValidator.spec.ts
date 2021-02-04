import * as fs from 'fs';
import {expect} from 'chai';
import * as lineReader from 'line-reader';
import {FabricateCompendiumData, FabricateItemType} from "../../src/scripts/core/CompendiumData";
import ErrnoException = NodeJS.ErrnoException;
import {Recipe} from "../../src/scripts/core/Recipe";
import {CraftingComponent} from "../../src/scripts/core/CraftingComponent";
import {Done} from "mocha";

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
            fileContents.forEach((lines: string[], fileName: string) => {
                console.log(`Validating file: ${fileName}. `);
                lines.forEach((line: string, index: number) => {
                    const lineNumber = index + 1;
                    const json = JSON.parse(line);
                    const flags: FabricateCompendiumData = json.flags.fabricate;
                    expect(flags, `Compendium entry on line ${lineNumber} has no Fabricate flags`).to.exist;
                    expect(flags.type).to.be.oneOf([FabricateItemType.COMPONENT, FabricateItemType.RECIPE], 'Did not recognize the Compendium Item type');
                    switch (flags.type) {
                        case FabricateItemType.RECIPE:
                            const recipe: Recipe = Recipe.fromFlags(flags);
                            expect(recipe.isValid(), `Recipe on line ${lineNumber} has invalid data`).to.be.true;
                            expect(json._id).to.equal(flags.recipe.entryId, `Recipe entry ID on line ${lineNumber} does not match Item ID in Compendium`);
                            expect(json.name).to.equal(flags.recipe.name, `Recipe name on line ${lineNumber} does not match Item name in Compendium`);
                            break;
                        case FabricateItemType.COMPONENT:
                            const craftingComponent: CraftingComponent = CraftingComponent.fromFlags(flags);
                            expect(craftingComponent.isValid(), `Component on line ${lineNumber} has invalid data`).to.be.true;
                            expect(json._id).to.equal(flags.component.compendiumEntry.entryId, `Component entry ID on line ${lineNumber} does not match Item ID in Compendium`);
                            expect(json.name).to.equal(flags.component.name, `Component name on line ${lineNumber} does not match Item name in Compendium`);
                            break;
                        default:
                            throw new Error(`Unable to determine type of Compendium Entry {name: ${json.name}, id:${json._id}}`);
                    }
                });
                console.log(`File ${fileName} is valid. `);
            });
        });

    });

});

// @ts-ignore
function validateLine(line: string) {
    const json = JSON.parse(line);
    const flags: FabricateCompendiumData = json.flags;
    expect(flags.type).to.be.oneOf([FabricateItemType.COMPONENT, FabricateItemType.RECIPE]);
    switch (flags.type) {
        case FabricateItemType.RECIPE:
            const recipe: Recipe = Recipe.fromFlags(flags);
            expect(recipe.isValid()).to.be.true;
            console.log(`Recipe ${recipe.name} is valid!`);
            break;
        case FabricateItemType.COMPONENT:
            const craftingComponent: CraftingComponent = CraftingComponent.fromFlags(flags);
            expect(craftingComponent.isValid()).to.be.true;
            console.log(`Component ${craftingComponent.name} is valid!`);
            break;
        default:
            throw new Error(`Unable to determine type of Compendium Entry {name: ${json.name}, id:${json._id}}`);
    }
}