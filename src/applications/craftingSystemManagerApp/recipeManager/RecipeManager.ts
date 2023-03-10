import {CraftingSystemEditor} from "../CraftingSystemEditor";
import {DropEventParser} from "../../common/DropEventParser";
import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {LocalizationService} from "../../common/LocalizationService";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {Recipe} from "../../../scripts/common/Recipe";

class RecipeManager {

    private readonly _craftingSystemEditor: CraftingSystemEditor;
    private readonly _localization: LocalizationService;
    private readonly  _localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes`;

    constructor({
        craftingSystemEditor,
        localization
    }: {
        craftingSystemEditor: CraftingSystemEditor;
        localization: LocalizationService;
    }) {
        this._craftingSystemEditor = craftingSystemEditor;
        this._localization = localization;
    }

    public async importRecipe(event: any, selectedSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.recipe.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        const itemData = dropData.itemData;
        if (selectedSystem.includesRecipeByItemUuid(itemData.uuid)) {
            const existingRecipe = selectedSystem.getRecipeByItemUuid(itemData.uuid);
            const message = this._localization.format(
                `${this._localizationPath}.errors.import.itemAlreadyIncluded`,
                {
                    itemUuid: itemData.uuid,
                    recipeName: existingRecipe.name,
                    systemName: selectedSystem.name
                }
            );
            ui.notifications.warn(message);
            return;
        }
        const recipe = new Recipe({
            id: randomID(),
            itemData: itemData
        });
        selectedSystem.editRecipe(recipe);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        const message = this._localization.format(
            `${this._localizationPath}.recipe.imported`,
            {
                recipeName: recipe.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
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
                        systemName: selectedSystem.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        selectedSystem.deleteRecipeById(recipe.id);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        const message = this._localization.format(
            `${this._localizationPath}.recipe.deleted`,
            {
                recipeName: recipe.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
    }

    public async saveRecipe(recipe: Recipe, selectedSystem: CraftingSystem) {
        selectedSystem.editRecipe(recipe);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
    }

    public async duplicateRecipe(recipe: Recipe, selectedSystem: CraftingSystem): Promise<Recipe> {
        const clonedRecipe = recipe.clone(randomID());
        selectedSystem.editRecipe(clonedRecipe);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        return clonedRecipe;
    }

    public async replaceItem(event: any, selectedSystem: CraftingSystem, selectedRecipe: Recipe) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.recipe.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        const itemData = dropData.itemData;
        if (selectedSystem.includesRecipeByItemUuid(itemData.uuid)) {
            const existingRecipe = selectedSystem.getRecipeByItemUuid(itemData.uuid);
            const message = this._localization.format(
                `${this._localizationPath}.errors.import.itemAlreadyIncluded`,
                {
                    itemUuid: itemData.uuid,
                    recipeName: existingRecipe.name,
                    systemName: selectedSystem.name
                }
            );
            ui.notifications.error(message);
            return;
        }
        const previousItemName = selectedRecipe.name;
        selectedRecipe.itemData = itemData;
        selectedSystem.editRecipe(selectedRecipe);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        const message = this._localization.format(
            `${this._localizationPath}.recipe.replaced`,
            {
                previousItemName,
                itemName: selectedRecipe.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
        return;
    }

}

export { RecipeManager }