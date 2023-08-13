import {DropEventParser} from "../../common/DropEventParser";
import {DefaultDocumentManager, FabricateItemData} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {LocalizationService} from "../../common/LocalizationService";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {Recipe} from "../../../scripts/crafting/recipe/Recipe";
import {FabricateAPI} from "../../../scripts/api/FabricateAPI";
import {RecipesStore} from "../../stores/RecipesStore";
import {ComponentsStore} from "../../stores/ComponentsStore";

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
            partType: this._localization.localize(`${Properties.module.id}.typeNames.recipe.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        if (!dropData.hasItemData) {
            return;
        }
        await this.createRecipe(dropData.itemData, selectedSystem);
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
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.recipe.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        selectedRecipe.itemData = dropData.itemData;
        const updatedRecipe = await this._fabricateAPI.recipes.save(selectedRecipe);
        this._recipes.insert(updatedRecipe);
        return updatedRecipe;
    }

    public async addRequirementOptionComponentAsCatalyst(event: any, selectedRecipe: Recipe) {
        const component = await this.getComponentFromDropEvent(event);
        selectedRecipe.setRequirementOption({
            name: this.generateOptionName(Array.from(selectedRecipe.requirementOptions.byId.keys())),
            catalysts: { [ component.id ]: 1 }
        });
    }

    public async addRequirementOptionComponentAsIngredient(event: any, selectedRecipe: Recipe) {
        const component = await this.getComponentFromDropEvent(event);
        selectedRecipe.setRequirementOption({
            name: this.generateOptionName(Array.from(selectedRecipe.requirementOptions.byId.keys())),
            ingredients: { [ component.id ]: 1 }
        });
    }

    public async addResultOptionComponent(event: any, selectedRecipe: Recipe) {
        const component = await this.getComponentFromDropEvent(event);
        selectedRecipe.setResultOption({
            name: this.generateOptionName(Array.from(selectedRecipe.resultOptions.byId.keys())),
            results: { [ component.id ]: 1 }
        });
    }

    private async getComponentFromDropEvent(event: any) {
        const dropEventParser = new DropEventParser({
            strict: true,
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: this._components.get(),
        });
        const component = (await dropEventParser.parse(event)).component;
        if (!component) {
            throw new Error("No component found in drop data.");
        }
        return component;
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

}

export { RecipeEditor }