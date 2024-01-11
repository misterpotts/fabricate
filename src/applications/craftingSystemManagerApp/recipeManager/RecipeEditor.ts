import {DropEventParser, ItemDropEvent} from "../../common/DropEventParser";
import {DefaultDocumentManager, FabricateItemData} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {LocalizationService} from "../../common/LocalizationService";
import {CraftingSystem} from "../../../scripts/crafting/system/CraftingSystem";
import {Recipe} from "../../../scripts/crafting/recipe/Recipe";
import {FabricateAPI} from "../../../scripts/api/FabricateAPI";
import {RecipesStore} from "../../stores/RecipesStore";
import {ComponentsStore} from "../../stores/ComponentsStore";
import {Requirement} from "../../../scripts/crafting/recipe/Requirement";
import {Result} from "../../../scripts/crafting/recipe/Result";
import {Essence} from "../../../scripts/crafting/essence/Essence";
import {Option} from "../../../scripts/common/Options";
import {Component} from "../../../scripts/crafting/component/Component";

class RecipeEditor {

    private readonly _recipes: RecipesStore;
    private readonly _components: ComponentsStore;
    private readonly _fabricateAPI: FabricateAPI;
    private readonly _localization: LocalizationService;

    private readonly  _localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes`;

    constructor({
        recipes,
        components,
        fabricateAPI,
        localization,
    }: {
        recipes: RecipesStore;
        components: ComponentsStore;
        fabricateAPI: FabricateAPI;
        localization: LocalizationService;
    }) {
        this._recipes = recipes;
        this._components = components;
        this._fabricateAPI = fabricateAPI;
        this._localization = localization;
    }

    public async importRecipe(event: any, selectedSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
        })
        const dropEvent = await dropEventParser.parse(event);
        if (dropEvent.type === "Unknown") {
            return;
        }
        if (dropEvent.type === "Compendium") {
            return this.importCompendiumRecipes(dropEvent.data.metadata, selectedSystem);
        }
        if (dropEvent.type === "Item") {
            return this.createRecipe(dropEvent.data.item, selectedSystem);
        }
    }

    public async importCompendiumRecipes(compendiumMetadata: CompendiumMetadata, selectedSystem: CraftingSystem): Promise<Recipe[]> {
        const recipes = await this._fabricateAPI.recipes.importCompendium({
            craftingSystemId: selectedSystem.id,
            compendiumId: compendiumMetadata.id
        });
        recipes.forEach(recipe => this._recipes.insert(recipe));
        return recipes;
    }

    public async createRecipe(itemData: FabricateItemData, selectedSystem: CraftingSystem): Promise<Recipe> {
        const recipe = await this._fabricateAPI.recipes.create({
            craftingSystemId: selectedSystem.id,
            itemUuid: itemData.uuid
        });
        this._recipes.insert(recipe);
        return recipe;
    }

    public async deleteRecipe(event: any, recipe: Recipe, selectedSystem: CraftingSystem) {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: this._localization.format(
                    `${this._localizationPath}.prompts.delete.title`,
                    {
                        recipeName: recipe.name
                    }
                ),
                content: this._localization.format(
                    `${this._localizationPath}.prompts.delete.content`,
                    {
                        recipeName: recipe.name,
                        systemName: selectedSystem.details.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        const deletedRecipe = await this._fabricateAPI.recipes.deleteById(recipe.id);
        this._recipes.remove(deletedRecipe);
    }

    public async saveRecipe(recipe: Recipe) {
        const savedRecipe = await this._fabricateAPI.recipes.save(recipe);
        this._recipes.insert(savedRecipe);
        return savedRecipe;
    }

    public async duplicateRecipe(recipe: Recipe): Promise<Recipe> {
        const duplicatedRecipe = await this._fabricateAPI.recipes.cloneById(recipe.id);
        this._recipes.insert(duplicatedRecipe);
        return duplicatedRecipe;
    }

    public async replaceItem(event: any, selectedRecipe: Recipe) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager()
        })
        const dropEvent = await dropEventParser.parse(event);
        if (dropEvent.type !== "Item") {
            return;
        }
        selectedRecipe.itemData = dropEvent.data.item;
        return this.saveRecipe(selectedRecipe);
    }

    public async addRequirementOptionComponentAsCatalyst(event: any, selectedRecipe: Recipe) {
        const component = await this.getComponentFromDropEvent(event);
        selectedRecipe.setRequirementOption({
            name: this.generateOptionName(selectedRecipe.requirementOptions.all.map(requirementOption => requirementOption.name)),
            catalysts: { [ component.id ]: 1 }
        });
        await this.saveRecipe(selectedRecipe);
    }

    public async addRequirementOptionComponentAsIngredient(event: any, selectedRecipe: Recipe) {
        const component = await this.getComponentFromDropEvent(event);
        selectedRecipe.setRequirementOption({
            name: this.generateOptionName(selectedRecipe.requirementOptions.all.map(requirementOption => requirementOption.name)),
            ingredients: { [ component.id ]: 1 }
        });
        await this.saveRecipe(selectedRecipe);
    }

    public async addResultOptionComponent(event: any, selectedRecipe: Recipe) {
        const component = await this.getComponentFromDropEvent(event);
        selectedRecipe.setResultOption({
            name: this.generateOptionName(selectedRecipe.resultOptions.all.map(resultOption => resultOption.name)),
            results: { [ component.id ]: 1 }
        });
        await this.saveRecipe(selectedRecipe);
    }

    // todo: prompt to import unknown items as components
    public async getComponentFromDropEvent(event: any): Promise<Component> {
        const dropEvent = await this.parseItemDropEvent(event);
        if (!dropEvent.data.component) {
            throw new Error("No component found in drop data.");
        }
        return dropEvent.data.component;
    }

    public async parseItemDropEvent(event: any): Promise<ItemDropEvent> {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            allowedCraftingComponents: this._components.get(),
        });
        const dropEvent = await dropEventParser.parse(event);
        if (dropEvent.type !== "Item") {
            throw new Error(`Invalid drop data type "${dropEvent.type}".}`);
        }
        return dropEvent;
    }

    private generateOptionName(existingNames: string[]) {
        let nextOptionNumber = 1;
        let nextOptionName;
        do {
            nextOptionName = this._localization.format(`${Properties.module.id}.typeNames.recipe.option.name`, { number: nextOptionNumber });
            nextOptionNumber++;
        } while (existingNames.includes(nextOptionName));
        return nextOptionName;
    }

    public async deleteRequirementOption(selectedRecipe: Recipe, requirementOption: Option<Requirement>) {
        selectedRecipe.deleteRequirementOptionById(requirementOption.id);
        const updatedRecipe = await this._fabricateAPI.recipes.save(selectedRecipe);
        this._recipes.insert(updatedRecipe);
        return updatedRecipe;
    }

    public async deleteResultOption(selectedRecipe: Recipe, resultOption: Option<Result>) {
        selectedRecipe.deleteResultOptionById(resultOption.id);
        await this.saveRecipe(selectedRecipe);
    }

    public async createEssenceRequirementOption(selectedRecipe: Recipe, essence: Essence) {
        selectedRecipe.setRequirementOption({
            name: this.generateOptionName(selectedRecipe.requirementOptions.all.map(requirementOption => requirementOption.name)),
            essences: { [ essence.id ]: 1 }
        });
        await this.saveRecipe(selectedRecipe);
    }

}

export { RecipeEditor }