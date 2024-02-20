import {LocalizationService} from "../../common/LocalizationService";
import {Essence} from "../../../scripts/crafting/essence/Essence";
import {CraftingSystem} from "../../../scripts/crafting/system/CraftingSystem";
import {DropEventParser} from "../../common/DropEventParser";
import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {FabricateAPI} from "../../../scripts/api/FabricateAPI";
import {EssencesStore} from "../../stores/EssenceStore";
import {ComponentsStore} from "../../stores/ComponentsStore";
import {RecipesStore} from "../../stores/RecipesStore";

class EssenceEditor {

    private readonly _essences: EssencesStore;
    private readonly _components: ComponentsStore;
    private readonly _recipes: RecipesStore;
    private readonly _fabricateAPI: FabricateAPI;
    private readonly _localization: LocalizationService;

    private readonly  _localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences`;

    constructor({
        essences,
        components,
        recipes,
        fabricateAPI,
        localization,
    }: {
        essences: EssencesStore;
        components: ComponentsStore;
        recipes: RecipesStore;
        fabricateAPI: FabricateAPI;
        localization: LocalizationService;
    }) {
        this._essences = essences;
        this._components = components;
        this._recipes = recipes;
        this._fabricateAPI = fabricateAPI;
        this._localization = localization;
    }

    public async create(selectedCraftingSystem: CraftingSystem) {
        const essence = await this._fabricateAPI.essences.create({
            craftingSystemId: selectedCraftingSystem.id
        });
        this._essences.insert(essence);
    }

    public async deleteEssence(event: any, essence: Essence, selectedCraftingSystem: CraftingSystem) {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: this._localization.format(
                    `${this._localizationPath}.prompts.delete.title`,
                    {
                        essenceName: essence.name
                    }
                ),
                content: this._localization.format(
                    `${this._localizationPath}.prompts.delete.content`,
                    {
                        essenceName: essence.name,
                        systemName: selectedCraftingSystem.details.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        const deletedEssence = await this._fabricateAPI.essences.deleteById(essence.id);
        const modifiedComponents = await this._fabricateAPI.components.removeEssenceReferences(essence.id, essence.craftingSystemId);
        const modifiedComponentsById = new Map(modifiedComponents.map(component => [component.id, component]));
        const modifiedRecipes = await this._fabricateAPI.recipes.removeEssenceReferences(essence.id, essence.craftingSystemId);
        const modifiedRecipesById = new Map(modifiedRecipes.map(recipe => [recipe.id, recipe]));
        this._essences.remove(deletedEssence);
        this._components.update((components) => {
            return components.map(component => modifiedComponentsById.get(component.id) || component);
        });
        this._recipes.update((recipes) => {
            return recipes.map(recipe => modifiedRecipesById.get(recipe.id) || recipe);
        });
    }

    public async setActiveEffectSource(event: any, essence: Essence) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager()
        })
        const dropEvent = await dropEventParser.parse(event);
        if (dropEvent.type === "Unknown") {
            return;
        }
        if (dropEvent.type === "Compendium") {
            return;
        }
        if (dropEvent.type === "Item") {
            essence.activeEffectSource = dropEvent.data.item;
        }
        await this._fabricateAPI.essences.save(essence);
        this._essences.insert(essence);
        return essence;
    }

    public async removeActiveEffectSource(essence: Essence) {
        essence.activeEffectSource = null;
        await this._fabricateAPI.essences.save(essence);
        this._essences.insert(essence);
        return essence;
    }

    public async setIconCode(essence: Essence, iconCode: string) {
        essence.iconCode = iconCode;
        await this._fabricateAPI.essences.save(essence);
        this._essences.insert(essence);
        return essence;
    }

    public async saveAll(essences: Essence[]) {
        await this._fabricateAPI.essences.saveAll(essences);
        this._essences.insertAll(essences);
    }

}

export { EssenceEditor }