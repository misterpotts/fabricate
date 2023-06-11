import {Identifiable} from "../common/Identifiable";
import {RecipeJson} from "../crafting/recipe/Recipe";
import Properties from "../Properties";

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
