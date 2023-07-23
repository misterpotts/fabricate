import {Identifiable} from "../common/Identifiable";
import {RecipeJson} from "../crafting/recipe/Recipe";
import Properties from "../Properties";
import {CraftingSystemJson} from "../system/CraftingSystem";
import {EssenceJson} from "../crafting/essence/Essence";
import {ComponentJson} from "../crafting/component/Component";

/**
 * The CollectionManager is responsible for determining which collections an entity belongs to.
 * */
interface CollectionManager<T extends { id: string }> {

    /**
     * Returns a list of collections that the entity belongs to.
     * */
    listCollectionMemberships(entityJson: T): { prefix: string, name: string }[];

}

export { CollectionManager };

class NoCollectionManager<T extends { id: string }> implements CollectionManager<T> {

    private static readonly _INSTANCE: NoCollectionManager<Identifiable> = new NoCollectionManager<Identifiable>();

    private constructor() {
    }

    public static get INSTANCE(): NoCollectionManager<Identifiable> {
        return NoCollectionManager._INSTANCE;
    }

    listCollectionMemberships(_entityJson: T): { prefix: string, name: string }[] {
        return [];
    }

}

export { NoCollectionManager };

class RecipeCollectionManager implements CollectionManager<RecipeJson> {

    listCollectionMemberships(recipeJson: RecipeJson): { prefix: string; name: string }[] {
        return [
            { prefix: Properties.settings.collectionNames.craftingSystem, name: recipeJson.craftingSystemId },
            { prefix: Properties.settings.collectionNames.item, name: recipeJson.itemUuid }
        ];
    }

}

export { RecipeCollectionManager };

class CraftingSystemCollectionManager implements CollectionManager<CraftingSystemJson> {

    listCollectionMemberships(_craftingSystemJson: CraftingSystemJson): { prefix: string; name: string }[] {
        return [];
    }

}

export { CraftingSystemCollectionManager };

class EssenceCollectionManager implements CollectionManager<EssenceJson> {

    listCollectionMemberships(essenceJson: EssenceJson): { prefix: string; name: string }[] {
        return [
            { prefix: Properties.settings.collectionNames.craftingSystem, name: essenceJson.craftingSystemId },
            { prefix: Properties.settings.collectionNames.item, name: essenceJson.activeEffectSourceItemUuid }
        ];
    }

}

export { EssenceCollectionManager };

class ComponentCollectionManager implements CollectionManager<ComponentJson> {

    listCollectionMemberships(entityJson: ComponentJson): { prefix: string; name: string }[] {
        return [
            { prefix: Properties.settings.collectionNames.craftingSystem, name: entityJson.craftingSystemId },
            { prefix: Properties.settings.collectionNames.item, name: entityJson.itemUuid }
        ];
    }

}

export { ComponentCollectionManager };