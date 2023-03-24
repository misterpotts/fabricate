import {Recipe, RecipeJson} from "../common/Recipe";
import {CraftingSystemApi} from "./CraftingSystemApi";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {SettingManager} from "./SettingManager";
import Properties from "../Properties";

interface CraftingSystemRecipeSettingJson {

    recipeIdsByItemUuid: Record<string, string>;
    recipesById: Record<string, RecipeJson>;

}

interface RecipeSettingJson {
    recipesByCraftingSystem: Record<string, CraftingSystemRecipeSettingJson>;
}

interface RecipeApi {

    create(craftingSystemId: string, recipeJson: RecipeJson): Promise<Recipe>;

}

export { RecipeApi };

class DefaultRecipeApi implements RecipeApi {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly _craftingSystemApi: CraftingSystemApi;
    private readonly _essenceApi: CraftingSystemApi;
    private readonly _componentApi: CraftingSystemApi;
    private readonly _notifications: Notifications;
    private readonly _localizationService: LocalizationService;

    constructor({
        craftingSystemApi,
        componentApi,
        essenceApi,
        notifications,
        localizationService
    }: {
        craftingSystemApi: CraftingSystemApi;
        essenceApi: CraftingSystemApi;
        componentApi: CraftingSystemApi;
        notifications: Notifications;
        localizationService: LocalizationService;
        settingManager: SettingManager<RecipeSettingJson>
    }) {
        this._craftingSystemApi = craftingSystemApi;
        this._essenceApi = essenceApi;
        this._componentApi = componentApi;
        this._notifications = notifications;
        this._localizationService = localizationService;
    }

    create(craftingSystemId: string, recipeJson: RecipeJson): Promise<Recipe> {
        const craftingSystem = this._craftingSystemApi.loadById(craftingSystemId);
        if (!craftingSystem) {
            const message = this._localizationService.format(`${DefaultRecipeApi._LOCALIZATION_PATH}.errors.craftingSystem.doesNotExist`, { craftingSystemId });
            this._notifications.error(message);
            return;
        }

    }

}
export { DefaultRecipeApi };

