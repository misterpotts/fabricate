import {
    DocumentManager,
    FabricateItemData,
    ItemNotFoundError,
    LoadedFabricateItemData
} from "../../src/scripts/foundry/DocumentManager";
import {Component, ComponentJson} from "../../src/scripts/crafting/component/Component";
import {Recipe, RecipeJson} from "../../src/scripts/crafting/recipe/Recipe";

class StubDocumentManager implements DocumentManager {

    private readonly _permissive: boolean;
    private static readonly _defaultItemData: FabricateItemData = new LoadedFabricateItemData({
        name: "Item name",
        imageUrl: "path/to/image/webp",
        itemUuid: "NOT_A_UUID",
        sourceDocument: {
            effects: []
        }
    });

    private readonly _itemDataByUuid: Map<string, FabricateItemData>;
    private readonly _poisonIds: string[] = [];

    constructor(itemDataByUuid: Map<string, FabricateItemData>, permissive = true) {
        this._itemDataByUuid = itemDataByUuid;
        this._permissive = permissive;
    }

    public static forParts({
       craftingComponents = [],
       recipes = []
   }: {
        craftingComponents?: Component[];
        recipes?: Recipe[]
    }): StubDocumentManager {
        const itemData = new Map<string, FabricateItemData>();
        this.ingest((component: Component) => {
            return new LoadedFabricateItemData({
                itemUuid: component.itemUuid,
                name: component.name,
                imageUrl: component.imageUrl,
                sourceDocument: component
            });
        }, craftingComponents, itemData);
        this.ingest((recipe: Recipe) => {
            return new LoadedFabricateItemData({
                itemUuid: recipe.itemUuid,
                name: recipe.name,
                imageUrl: recipe.imageUrl,
                sourceDocument: recipe
            });
        }, recipes, itemData);
        return new StubDocumentManager(itemData);
    }

    public static forPartDefinitions({
       craftingComponentsJson = [],
       recipesJson = []
    }: {
        craftingComponentsJson?: ComponentJson[];
        recipesJson?: RecipeJson[]
    }): StubDocumentManager {
        const itemData = new Map<string, FabricateItemData>();
        const notLoaded = "NOT_LOADED";
        this.ingest((componentJson: ComponentJson) => {
            return new LoadedFabricateItemData({
                itemUuid: componentJson.itemUuid,
                name: notLoaded,
                imageUrl: notLoaded,
                sourceDocument: componentJson
            });
        }, craftingComponentsJson, itemData);
        this.ingest((recipeJson: RecipeJson) => {
            return new LoadedFabricateItemData({
                itemUuid: recipeJson.itemUuid,
                name: notLoaded,
                imageUrl: notLoaded,
                sourceDocument: recipeJson
            })
        }, recipesJson, itemData);
        return new StubDocumentManager(itemData);
    }

    private static ingest<T>(mappingFunction: (part: T) => FabricateItemData, parts: T[], target: Map<string, FabricateItemData>): void {
        parts.map(part => mappingFunction(part))
            .forEach(itemData => target.set(itemData.uuid, itemData));
    }

    public async getDocumentByUuid(id: string): Promise<any> {
        if (this._poisonIds.includes(id)) {
            throw new ItemNotFoundError(id);
        }
        const result = this._itemDataByUuid.get(id);
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
            const result = this._itemDataByUuid.get(id);
            if (!result && this._permissive) {
                results.set(id, StubDocumentManager._defaultItemData);
            } else if (!result) {
                throw new ItemNotFoundError(id);
            } else {
                results.set(id, this._itemDataByUuid.get(id));
            }
        }
        return results;
    }

    poison(id: string) {
        this._poisonIds.push(id);
    }

}

export { StubDocumentManager }