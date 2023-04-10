import {CraftingSystemEditor} from "../CraftingSystemEditor";
import {DropEventParser} from "../../common/DropEventParser";
import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {LocalizationService} from "../../common/LocalizationService";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {RequirementOption, Recipe, ResultOption} from "../../../scripts/crafting/recipe/Recipe";
import {Combination} from "../../../scripts/common/Combination";

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
        if (!dropData.hasItemData) {
            return;
        }
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
        if (this.validateOptionNames(recipe)) {
            selectedSystem.editRecipe(recipe);
            await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
            return;
        }
        const message = this._localization.format(`${this._localizationPath}.recipe.errors.optionNotUnique`, { recipeName: recipe.name });
        ui.notifications.error(message);
    }

    private validateOptionNames(recipe: Recipe) {
        let valid = true;
        recipe.ingredientOptions
            .map(ingredientOption => ingredientOption.name)
            .forEach((value, index, array) => {
                if (array.indexOf(value) !== index) {
                    valid = false;
                    console.error(`The ingredient option name ${value} is not unique.`);
                }
            });
        recipe.resultOptions
            .map(ingredientOption => ingredientOption.name)
            .forEach((value, index, array) => {
                if (array.indexOf(value) !== index) {
                    valid = false;
                    console.error(`The result option name ${value} is not unique.`);
                }
            });
        return valid;
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

    public async addIngredientOption(event: any, addAsCatalyst: boolean, selectedRecipe: Recipe, selectedCraftingSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            strict: true,
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: selectedCraftingSystem.craftingComponents
        });
        const component = (await dropEventParser.parse(event)).component;
        if (!component) {
            return;
        }
        const name = this.generateIngredientOptionName(selectedRecipe);
        let ingredientOption;
        if (addAsCatalyst) {
            ingredientOption = new RequirementOption({name, catalysts: Combination.of(component, 1)});
        } else {
            ingredientOption = new RequirementOption({name, ingredients: Combination.of(component, 1)});
        }
        selectedRecipe.addIngredientOption(ingredientOption);
        selectedCraftingSystem.editRecipe(selectedRecipe);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
    }

    public async addResultOption(event: any, selectedRecipe: Recipe, selectedCraftingSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            strict: true,
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: selectedCraftingSystem.craftingComponents
        });
        const component = (await dropEventParser.parse(event)).component;
        if (!component) {
            return;
        }
        const name = this.generateResultOptionName(selectedRecipe);
        let resultOption = new ResultOption({name, results: Combination.of(component, 1)});
        selectedRecipe.addResultOption(resultOption);
        selectedCraftingSystem.editRecipe(selectedRecipe);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
    }

    public generateIngredientOptionName(recipe: Recipe) {
        if (!recipe.hasRequirements) {
            return this._localization.format(`${Properties.module.id}.typeNames.recipe.ingredientOption.name`, { number: 1 });
        }
        const existingNames = recipe.ingredientOptions.map(ingredientOption => ingredientOption.name);
        let nextOptionNumber = 2;
        let nextOptionName;
        do {
            nextOptionName = this._localization.format(`${Properties.module.id}.typeNames.recipe.ingredientOption.name`, { number: nextOptionNumber });
            nextOptionNumber++;
        } while (existingNames.includes(nextOptionName));
        return nextOptionName;
    }

    public generateResultOptionName(recipe: Recipe) {
        if (!recipe.hasResults) {
            return this._localization.format(`${Properties.module.id}.typeNames.recipe.resultOption.name`, { number: 1 });
        }
        const existingNames = recipe.resultOptions.map(ingredientOption => ingredientOption.name);
        let nextOptionNumber = 2;
        let nextOptionName;
        do {
            nextOptionName = this._localization.format(`${Properties.module.id}.typeNames.recipe.resultOption.name`, { number: nextOptionNumber });
            nextOptionNumber++;
        } while (existingNames.includes(nextOptionName));
        return nextOptionName;
    }

}

export { RecipeManager }