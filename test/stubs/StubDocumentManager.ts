import {DocumentManager, FabricateItemData, ItemNotFoundError} from "../../src/scripts/foundry/DocumentManager";
import {CraftingComponent, CraftingComponentJson} from "../../src/scripts/common/CraftingComponent";
import {Recipe, RecipeJson} from "../../src/scripts/crafting/Recipe";

class StubDocumentManager implements DocumentManager {

    private readonly _permissive: boolean;
    private static readonly _defaultItemData: FabricateItemData = {
        name: "Item name",
        imageUrl: "path/to/image/webp",
        uuid: "NOT_A_UUID",
        source: {}
    };

    private readonly _itemData: Map<string, FabricateItemData>;
    private readonly _poisonIds: string[] = [];

    constructor(itemData: Map<string, FabricateItemData>, permissive = true) {
        this._itemData = itemData;
        this._permissive = permissive;
    }

    public static forParts({
       craftingComponents = [],
       recipes = []
   }: {
        craftingComponents?: CraftingComponent[];
        recipes?: Recipe[]
    }): StubDocumentManager {
        const itemData = new Map<string, FabricateItemData>();
        this.ingest((component: CraftingComponent) => {
            return {
                uuid: component.id,
                name: component.name,
                imageUrl: component.imageUrl,
                source: component
            }
        }, craftingComponents, itemData);
        this.ingest((recipe: Recipe) => {
            return {
                uuid: recipe.id,
                name: recipe.name,
                imageUrl: recipe.imageUrl,
                source: recipe
            }
        }, recipes, itemData);
        return new StubDocumentManager(itemData);
    }

    public static forPartDefinitions({
       craftingComponentsJson = [],
       recipesJson = []
   }: {
        craftingComponentsJson?: CraftingComponentJson[];
        recipesJson?: RecipeJson[]
    }): StubDocumentManager {
        const itemData = new Map<string, FabricateItemData>();
        const notLoaded = "NOT_LOADED";
        this.ingest((componentJson: CraftingComponentJson) => {
            return {
                uuid: componentJson.itemUuid,
                name: notLoaded,
                imageUrl: notLoaded,
                source: componentJson
            }
        }, craftingComponentsJson, itemData);
        this.ingest((recipeJson: RecipeJson) => {
            return {
                uuid: recipeJson.itemUuid,
                name: notLoaded,
                imageUrl: notLoaded,
                source: recipeJson
            }
        }, recipesJson, itemData);
        return new StubDocumentManager(itemData);
    }

    private static ingest<T>(mappingFunction: (part: T) => FabricateItemData, parts: T[], target: Map<string, FabricateItemData>): void {
        parts.map(part => mappingFunction(part)).forEach(itemData => target.set(itemData.uuid, itemData));
    }

    public async getDocumentByUuid(id: string): Promise<any> {
        if (this._poisonIds.includes(id)) {
            throw new ItemNotFoundError(id);
        }
        const result = this._itemData.get(id);
        if (!result && this._permissive) {
            return StubDocumentManager._defaultItemData;
        } else if (!result) {
            throw new ItemNotFoundError(id);
        } else {
            return result;
        }
    }

    public async getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>> {
        const results = new Map<string, FabricateItemData>();
        for (const id of ids) {
            if (this._poisonIds.includes(id)) {
                throw new ItemNotFoundError(id);
            }
            const result = this._itemData.get(id);
            if (!result && this._permissive) {
                results.set(id, StubDocumentManager._defaultItemData);
            } else if (!result) {
                throw new ItemNotFoundError(id);
            } else {
                results.set(id, this._itemData.get(id));
            }
        }
        return results;
    }

    poison(id: string) {
        this._poisonIds.push(id);
    }

}

export { StubDocumentManager }