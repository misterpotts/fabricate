import * as fs from 'fs'

import {CraftingSystem} from "./CraftingSystem";
import {CraftingSystemSpecification} from "./CraftingSystemSpecification";
import {CraftingComponent} from "./CraftingComponent";
import {Recipe} from "./Recipe";
import {Ingredient} from "./Ingredient";
import {CraftingResult} from "./CraftingResult";
import {FabricateCompendiumData, FabricateItemType} from "../game/CompendiumData";
import Properties from "../Properties";
import {FabricateItem} from "./FabricateItem";

interface CraftingSystemFactory {
    systemSpecification: CraftingSystemSpecification;
    make(): Promise<CraftingSystem>;
}

interface BasicSystemData {
    recipes: Recipe[];
    components: CraftingComponent[];
}

abstract class AbstractCraftingSystemFactory implements CraftingSystemFactory {
    private readonly _systemSpecification: CraftingSystemSpecification;

    constructor(systemSpecification: CraftingSystemSpecification) {
        this._systemSpecification = systemSpecification;
    }

    get systemSpecification(): CraftingSystemSpecification {
        return this._systemSpecification;
    }

    async make(): Promise<CraftingSystem> {
        const basicSystemData = await this.prepare();
        const componentErrors: string[] = [];
        basicSystemData.components.forEach((craftingComponent: CraftingComponent) => {
            if (!craftingComponent.isValid()) {
                componentErrors.push(`Crafting Component ${craftingComponent.compendiumEntry} is invalid. `);
            }
        });
        if (componentErrors.length > 0) {
            throw new Error(`Unable to build Crafting System ${this.systemSpecification.name}. There were one or more issues with reading Crafting Components: ${componentErrors}. `);
        }
        const componentDictionary: Map<string, CraftingComponent> = new Map(basicSystemData.components.map((component: CraftingComponent) => [component.partId, component]));
        const recipeErrors: string[] = [];
        const populatedRecipes: Recipe[] = basicSystemData.recipes.map((recipe: Recipe) => {
            const populatedIngredients: Ingredient[] = recipe.ingredients.map((ingredient: Ingredient) => {
                const craftingComponent = componentDictionary.get(ingredient.partId);
                if (!craftingComponent) {
                    throw new Error(`Recipe ${recipe.name} with ID ${recipe.partId} specified an Ingredient that was not found in the Crafting System: ${ingredient.compendiumEntry}.`);
                }
                return Ingredient.builder()
                    .withComponent(craftingComponent)
                    .withQuantity(ingredient.quantity)
                    .isConsumed(ingredient.consumed)
                    .build();
            });
            const populatedCraftingResults = recipe.results.map((result: CraftingResult) => {
                const craftingComponent = componentDictionary.get(result.partId);
                if (!craftingComponent) {
                    throw new Error(`Recipe ${recipe.name} with ID ${recipe.partId} specified a Result that was not found in the Crafting System: ${result.compendiumEntry}.`);
                }
                return CraftingResult.builder()
                    .withAction(result.action)
                    .withComponent(craftingComponent)
                    .withQuantity(result.quantity)
                    .withCustomData(result.customData)
                    .build();
            });
            return Recipe.builder()
                .withName(recipe.name)
                .withPartId(recipe.partId)
                .withEssences(recipe.essences)
                .withSystemId(recipe.systemId)
                .withIngredients(populatedIngredients)
                .withResults(populatedCraftingResults)
                .build();
        });
        populatedRecipes.forEach((recipe: Recipe) => {
            if (!recipe.isValid()) {
                recipeErrors.push(`Recipe ${recipe.compendiumEntry} is invalid. `);
            }
        });
        if (recipeErrors.length > 0) {
            throw new Error(`Unable to build Crafting System ${this.systemSpecification.name}. There were one or more issues with reading populating Recipes: ${recipeErrors}. `);
        }
        return CraftingSystem.builder()
            .withRecipes(populatedRecipes)
            .withName(this.systemSpecification.name)
            .withComponentDictionary(componentDictionary)
            .withEnableHint(this.systemSpecification.enableHint)
            .withFabricator(this.systemSpecification.fabricator)
            .withDescription(this.systemSpecification.description)
            .withCompendiumPackKey(this.systemSpecification.compendiumPackKey)
            .withSupportedGameSystems(this.systemSpecification.supportedGameSystems)
            .build();
    }

    abstract prepare(): Promise<BasicSystemData>;

}

class CompendiumImportingCraftingSystemFactory extends AbstractCraftingSystemFactory {

    async prepare(): Promise<BasicSystemData> {
        let systemPack: Compendium = game.packs.get(this.systemSpecification.compendiumPackKey);
        let content = await this.loadCompendiumContent(systemPack, 10);
        const systemData: BasicSystemData = {
            recipes: [],
            components: []
        };
        content.forEach((item: any) => {
            let itemConfig: FabricateCompendiumData = item.data.flags.fabricate;
            switch (itemConfig.type) {
                case FabricateItemType.COMPONENT:
                    systemData.components.push(CraftingComponent.fromFlags(itemConfig, item.name, item.img));
                    break;
                case FabricateItemType.RECIPE:
                    systemData.recipes.push(Recipe.fromFlags(itemConfig, item.name, item.img));
                    break;
                default:
                    throw new Error(`${Properties.module.label} | Unable to load item ${item.id}. Could not determine Fabricate Entity Type. `);
            }
        });
        return systemData;
    }

    /**
     * Fallback awaiter for loading compendium content, as this was observed to be unreliable during development after the
     * game 'ready' Hook was fired
     *
     * @param compendium The Compendium from which to reliably load the Content
     * @param maxAttempts The maximum number of times to attempt loading Compendium Content
     * */
    private async loadCompendiumContent(compendium: Compendium, maxAttempts: number): Promise<Entity[]> {
        let content: Entity[] = await compendium.getContent();
        let attempts: number = 0;
        while ((!content || (content.length === 0)) && (attempts <= maxAttempts)) {
            console.log(`${Properties.module.label} | Waiting for content in Compendium Pack ${compendium.id} (Attempt ${attempts} of ${maxAttempts}. `);
            await this.wait(1000);
            attempts++;
            content = await compendium.getContent();
        }
        return content;
    }

    /**
     * Simple async awaiter delay function
     *
     * @param delay The number of millis to wait before resolving
     * @return a promise that resolves once the delay period has elapsed
     * */
    private async wait(delay: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

}

class FileReadingCraftingSystemFactory extends AbstractCraftingSystemFactory {

    private readonly _filePath: string;
    private readonly _fileErrorsByLineNumber: Map<number, string[]> = new Map();

    constructor(systemSpecification: CraftingSystemSpecification, filePath: string) {
        super(systemSpecification);
        this._filePath = filePath;
    }

    get filePath(): string {
        return this._filePath;
    }

    get fileErrorsByLineNumber(): Map<number, string[]> {
        return this._fileErrorsByLineNumber;
    }

    async prepare(): Promise<BasicSystemData> {
        const lines = await this.readFile(this.filePath);
        return this.parseFileData(lines);
    }

    private async readFile(path: string): Promise<string[]> {
        const contents = await fs.promises.readFile(path, 'utf-8');
        return contents.split('\n');
    }

    private recordError(lineNumber: number, error: string): void {
        if (this._fileErrorsByLineNumber.has(lineNumber)) {
            this._fileErrorsByLineNumber.get(lineNumber).push(error);
        }
        this._fileErrorsByLineNumber.set(lineNumber,[error]);
    }

    parseFileData(lines: string[]): BasicSystemData {
        const systemData: BasicSystemData = {
            recipes: [],
            components: []
        };
        lines.forEach((line: string, index: number) => {
            const lineNumber = index + 1;
            let json: any;
            try {
                json = JSON.parse(line);
            } catch (err) {
                this.recordError(lineNumber, `Line is not valid JSON. `);
                return;
            }
            if (!json.flags) {
                this.recordError(lineNumber, `No flag data was present. `);
                return;
            }
            const fabricateFlags: FabricateCompendiumData = json.flags.fabricate;
            if (!fabricateFlags) {
                this.recordError(lineNumber, `Flag data was present, but no Fabricate flags were set. `);
                return;
            }
            if (!fabricateFlags.identity) {
                this.recordError(lineNumber, `Flag data was present, but no Fabricate Item identity was set. `);
                return;
            }
            if (!fabricateFlags.identity.partId || !fabricateFlags.identity.systemId) {
                this.recordError(lineNumber, `An invalid Fabricate Item identity was set with Part ID '${fabricateFlags.identity.partId}' and System ID '${fabricateFlags.identity.systemId}' `);
                return;
            }
            let fabricateItem: FabricateItem;
            switch (fabricateFlags.type) {
                case FabricateItemType.COMPONENT:
                    if (!fabricateFlags.component) {
                        this.recordError(lineNumber, `No Component definition was provided. `);
                        return;
                    }
                    const craftingComponent: CraftingComponent = CraftingComponent.fromFlags(fabricateFlags, json.name, json.img);
                    fabricateItem = craftingComponent;
                    systemData.components.push(craftingComponent);
                    break;
                case FabricateItemType.RECIPE:
                    if (!fabricateFlags.recipe) {
                        this.recordError(lineNumber, `No Recipe definition was provided. `);
                        return;
                    }
                    const recipe: Recipe = Recipe.fromFlags(fabricateFlags, json.name, json.img);
                    fabricateItem = recipe;
                    systemData.recipes.push(recipe);
                    break;
                default:
                    this.recordError(lineNumber, `The Fabricate Item type ${fabricateFlags.type} was not 
                        recognized. Allowable values are COMPONENT or RECIPE`);
                    return;
            }
            if (fabricateItem.partId !== json._id) {
                this.recordError(lineNumber, `${fabricateFlags.type} part ID '${fabricateItem.partId}' did not match Compendium Entity ID '${json._id}. '`);
            }
            if (fabricateItem.name !== json.name) {
                this.recordError(lineNumber, `${fabricateFlags.type} name '${fabricateItem.name}' did not match Compendium Entity name '${json.name}. '`);
            }
            if (fabricateItem.imageUrl !== json.img) {
                this.recordError(lineNumber, `${fabricateFlags.type} image URL '${fabricateItem.imageUrl}' did not match Compendium Entity image URL '${json.img}. '`);
            }
        });
        if (this.fileErrorsByLineNumber.size === 0) {
            return systemData;
        }
        const lineErrorDetails: string[] = [];
        this.fileErrorsByLineNumber.forEach((errors: string[], line: number) => lineErrorDetails.push(`Line ${line}: ${errors.join(', ')} \n`));
        throw new Error(`Encountered ${this.fileErrorsByLineNumber.size} errors when processing file data for system ${this.systemSpecification.compendiumPackKey}. Errors: \n ${lineErrorDetails}`);
    }

}

export {CraftingSystemFactory, FileReadingCraftingSystemFactory, CompendiumImportingCraftingSystemFactory}