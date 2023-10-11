import {CraftingSystemJson} from "../../crafting/system/CraftingSystem";
import {ComponentJson} from "../../crafting/component/Component";
import {RecipeJson} from "../../crafting/recipe/Recipe";
import {EssenceJson} from "../../crafting/essence/Essence";

type V3EntityDataStoreModel<T> = {

    entities: Record<string, T>;
    collections: Record<string, string[]>;

};

export { V3EntityDataStoreModel }

interface V3SettingsModel {

    modelVersion: "V3";

    /**
     * Accepts no collection keys
     */
    craftingSystems: V3EntityDataStoreModel<CraftingSystemJson>;

    /**
     * Accepts keys:
     * - ${Properties.settings.collectionNames.craftingSystem}.craftingSystemId
     * - ${Properties.settings.collectionNames.item}.activeEffectSourceItemUuid
     */
    essences: V3EntityDataStoreModel<EssenceJson>;

    /**
     * Accepts keys:
     * - ${Properties.settings.collectionNames.craftingSystem}.craftingSystemId
     * - ${Properties.settings.collectionNames.item}.itemUuid
     */
    components: V3EntityDataStoreModel<ComponentJson>;

    /**
     * Accepts keys:
     * - ${Properties.settings.collectionNames.craftingSystem}.craftingSystemId
     * - ${Properties.settings.collectionNames.item}.itemUuid
     */
    recipes: V3EntityDataStoreModel<RecipeJson>;

}

export { V3SettingsModel }