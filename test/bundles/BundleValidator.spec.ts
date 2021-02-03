import * as fs from 'fs';
import {expect} from 'chai';
import * as lineReader from 'line-reader';
import {FabricateFlags, FabricateItemType} from "../../src/scripts/core/FabricateFlags";
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
            fileContents.forEach((lines: string[]) => {
                lines.forEach((line: string) => {
                    const json = JSON.parse(line);
                    const flags: FabricateFlags = json.flags.fabricate;
                    expect(flags.type).to.be.oneOf([FabricateItemType.COMPONENT, FabricateItemType.RECIPE]);
                    switch (flags.type) {
                        case FabricateItemType.RECIPE:
                            const recipe: Recipe = Recipe.fromFlags(flags);
                            expect(recipe.isValid()).to.be.true;
                            break;
                        case FabricateItemType.COMPONENT:
                            const craftingComponent: CraftingComponent = CraftingComponent.fromFlags(flags);
                            expect(craftingComponent.isValid()).to.be.true;
                            break;
                        default:
                            throw new Error(`Unable to determine type of Compendium Entry {name: ${json.name}, id:${json._id}}`);
                    }
                });
            });
        });

    });

});

// @ts-ignore
function validateLine(line: string) {
    const json = JSON.parse(line);
    const flags: FabricateFlags = json.flags;
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