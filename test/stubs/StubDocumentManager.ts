import {
    DocumentManager,
    FabricateItemData,
    ItemNotFoundError,
    LoadedFabricateItemData, PendingFabricateItemData
} from "../../src/scripts/foundry/DocumentManager";
import {Component, ComponentJson} from "../../src/scripts/crafting/component/Component";
import {Recipe, RecipeJson} from "../../src/scripts/crafting/recipe/Recipe";

class StubDocumentManager implements DocumentManager {

    private static DEFAULT_ITEM_DATA(uuid: string): FabricateItemData {
        return new LoadedFabricateItemData({
            name: "Item name",
            imageUrl: "path/to/image/webp",
            itemUuid: uuid,
            sourceDocument: {
                effects: []
            }
        });
    }

    private itemDataByUuid: Map<string, FabricateItemData>;
    private poisonIds: string[] = [];
    private allowUnknownIds: boolean;
    private cachedState: {
        itemDataByUuid: Map<string, FabricateItemData>;
        poisonIds: string[];
        allowUnknownIds: boolean;
    };

    constructor({
        itemDataByUuid = new Map(),
        allowUnknownIds = false,
        poisonIds = []
    }: {
        itemDataByUuid?: Map<string, FabricateItemData>;
        allowUnknownIds?: boolean;
        poisonIds?: string[];
    } = {}) {
        this.itemDataByUuid = itemDataByUuid;
        this.allowUnknownIds = allowUnknownIds;
        this.poisonIds = poisonIds;
        this.cachedState = {
            itemDataByUuid,
            poisonIds,
            allowUnknownIds
        };
    }

    public static forParts({
       components = [],
       recipes = []
    }: {
        components?: Component[];
        recipes?: Recipe[]
    }): StubDocumentManager {
        const result = new StubDocumentManager();
        result.ingest((component: Component) => {
            return new LoadedFabricateItemData({
                itemUuid: component.itemUuid,
                name: component.name,
                imageUrl: component.imageUrl,
                sourceDocument: component
            });
        }, components);
        result.ingest((recipe: Recipe) => {
            return new LoadedFabricateItemData({
                itemUuid: recipe.itemUuid,
                name: recipe.name,
                imageUrl: recipe.imageUrl,
                sourceDocument: recipe
            });
        }, recipes);
        return result;
    }

    public static forPartDefinitions({
       componentsJson = [],
       recipesJson = []
    }: {
        componentsJson?: ComponentJson[];
        recipesJson?: RecipeJson[]
    }): StubDocumentManager {
        const result = new StubDocumentManager();
        const notLoaded = "NOT_LOADED";
        result.ingest((componentJson: ComponentJson) => {
            return new LoadedFabricateItemData({
                itemUuid: componentJson.itemUuid,
                name: notLoaded,
                imageUrl: notLoaded,
                sourceDocument: componentJson
            });
        }, componentsJson);
        result.ingest((recipeJson: RecipeJson) => {
            return new LoadedFabricateItemData({
                itemUuid: recipeJson.itemUuid,
                name: notLoaded,
                imageUrl: notLoaded,
                sourceDocument: recipeJson
            })
        }, recipesJson);
        return result;
    }

    private ingest<T>(mappingFunction: (part: T) => FabricateItemData, parts: T[]): void {
        parts.map(part => mappingFunction(part))
            .forEach(itemData => this.itemDataByUuid.set(itemData.uuid, itemData));
    }

    public async loadItemDataByDocumentUuid(uuid: string): Promise<FabricateItemData> {
        if (this.poisonIds.includes(uuid)) {
            throw new ItemNotFoundError(uuid);
        }
        const result = this.itemDataByUuid.get(uuid);
        if (!result && this.allowUnknownIds) {
            return StubDocumentManager.DEFAULT_ITEM_DATA(uuid);
        } else if (!result) {
            throw new ItemNotFoundError(uuid);
        } else {
            return result;
        }
    }

    public async loadItemDataForDocumentsByUuid(uuids: string[]): Promise<Map<string, FabricateItemData>> {
        const itemData = await Promise.all(uuids.map(uuid => this.loadItemDataByDocumentUuid(uuid)));
        return new Map(itemData.map(data => [data.uuid, data]));
    }

    poison(poisonId: string): void {
        this.poisonIds.push(poisonId);
    }

    cure(cureId: string): void {
        this.poisonIds = this.poisonIds.filter(poisonId => poisonId !== cureId);
    }

    public setAllowUnknownIds(value: boolean): void {
        this.allowUnknownIds = value;
    }

    public save(): void {
        this.cachedState = {
            itemDataByUuid: this.itemDataByUuid,
            poisonIds: this.poisonIds,
            allowUnknownIds: this.allowUnknownIds
        }
    }

    public reset(): void {
        this.itemDataByUuid = this.cachedState.itemDataByUuid;
        this.poisonIds = this.cachedState.poisonIds;
        this.allowUnknownIds = this.cachedState.allowUnknownIds;
    }

    async prepareItemDataByDocumentUuid(uuid: string): Promise<FabricateItemData> {
        return new PendingFabricateItemData(uuid, () => this.loadItemDataByDocumentUuid(uuid))
    }

}

export { StubDocumentManager }