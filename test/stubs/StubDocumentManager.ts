import {DocumentManager, FabricateItemData} from "../../src/scripts/foundry/DocumentManager";
import {CraftingComponent, CraftingComponentJson} from "../../src/scripts/common/CraftingComponent";
import {Recipe, RecipeJson} from "../../src/scripts/crafting/Recipe";

class StubDocumentManager implements DocumentManager {

    private readonly _itemData: Map<string, FabricateItemData>;

    constructor(itemData: Map<string, FabricateItemData>) {
        this._itemData = itemData;
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

    public async getDocumentByUuid(_id: string): Promise<any> {
        return Promise.resolve({
            name: "Item name",
            img: "path/to/image/webp",
            uuid: "NOT_A_UUID"
        });
    }

    public async getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>> {
        return new Map(ids.map(id => this._itemData.get(id))
            .map(itemData => [itemData.uuid, itemData])
        );
    }

}

export { StubDocumentManager }