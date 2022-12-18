import {CraftingComponent, CraftingComponentJson, CraftingComponentSummary} from "../common/CraftingComponent";
import {CombinationChoice, Recipe, RecipeJson} from "../crafting/Recipe";
import {Essence, EssenceJson} from "../common/Essence";
import {DefaultDocumentManager, DocumentManager, FabricateItemData} from "../foundry/DocumentManager";
import {Combination} from "../common/Combination";
import Properties from "../Properties";
import {Identifiable, Serializable} from "../common/Identity";

interface PartCache<T, K> extends Serializable<Record<string, K>>{

    getById(id: string): Promise<T>;

    deleteById(id: string): Promise<void>;

    contains(id: string): boolean;

    size: number;

    isEmpty(): boolean;

    getAll(): Promise<Map<string, T>>;

    update(value: T): Promise<void>;

}

interface PartLoader<T, K> {

    loadById(id: string): Promise<T>;

    loadAll(): Promise<Map<string, T>>;

    sourceData: Record <string, K>;

    contains(id: string): boolean;

}

const combinationFromRecord: <T extends Identifiable>(amounts: Record<string, number>, candidatesById: Map<string, T>) => Combination<T> = (amounts, candidatesById) => {
    if (!amounts) {
        return Combination.EMPTY();
    }
    return Object.keys(amounts)
        .map(id => {
            if (!candidatesById.has(id)) {
                throw new Error(`Unable to resolve ID ${id}. `);
            }
            return Combination.of(candidatesById.get(id), amounts[id]);
        })
        .reduce((left, right) => left.combineWith(right), Combination.EMPTY());
}

class EssenceLoader implements PartLoader<Essence, EssenceJson> {

    private readonly _sourceData: Record<string, EssenceJson>;

    constructor({
        sourceData
    }: {
        sourceData: Record<string, EssenceJson>
    }) {
        this._sourceData = sourceData;
    }

    public async loadById(id: string): Promise<Essence> {
        const essenceJson = this._sourceData[id];
        if (!essenceJson) {
            throw new Error(`No Essence data was found for the id "${id}". Known Essence IDs for this system are: ${Object.keys(this._sourceData).join(", ")}`);
        }
        return new Essence({
            id: essenceJson.id,
            name: essenceJson.name,
            description: essenceJson.description,
            iconCode: essenceJson.iconCode,
            tooltip: essenceJson.tooltip
        });
    }

    public async loadAll(): Promise<Map<string, Essence>> {
        if (!this._sourceData) {
            throw new Error("Cannot load essences. Source data was not defined. ");
        }
        const ids = Object.keys(this._sourceData);
        const essences = await Promise.all(ids.map(id => this.loadById(id)));
        return new Map(essences.map(essence => [essence.id, essence]));
    }

    get sourceData(): Record<string, EssenceJson> {
        return this._sourceData;
    }

    contains(id: string): boolean {
        return !!this._sourceData[id];
    }

}

class ComponentLoader implements PartLoader<CraftingComponent, CraftingComponentJson> {

    private readonly _sourceData: Record<string, CraftingComponentJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _essenceCache: PartCache<Essence, EssenceJson>;

    constructor({
        sourceData,
        documentManager,
        essenceCache
    }: {
        sourceData: Record<string, CraftingComponentJson>;
        documentManager:DocumentManager;
        essenceCache: PartCache<Essence, EssenceJson>;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._essenceCache = essenceCache;
    }

    public async loadById(id: string): Promise<CraftingComponent> {
        const componentJson = this._sourceData[id];
        if (!componentJson) {
            throw new Error(`No Component data was found for the id "${id}". Known Component IDs for this system are: ${Object.keys(this._sourceData).join(", ")}`);
        }
        const salvageIds = componentJson.salvage ? Object.keys(componentJson.salvage) : [];
        const documentIds = [id, ...salvageIds];
        const itemData = await this._documentManager.getDocumentsByUuid(documentIds);
        const essences = await this._essenceCache.getAll();
        return new CraftingComponent({
            id: componentJson.itemUuid,
            name: itemData.get(id).name,
            imageUrl: itemData.get(id).imageUrl ?? Properties.ui.defaults.itemImageUrl,
            essences: combinationFromRecord(componentJson.essences, essences),
            salvage: combinationFromRecord(componentJson.salvage, this.prepareComponentSummaries(itemData))
        });
    }

    private prepareComponentSummaries(itemData: Map<string, FabricateItemData>): Map<string, CraftingComponentSummary> {
        const summaryEntries: [string, CraftingComponentSummary][] = Array.from(itemData.values())
            .map(item => new CraftingComponentSummary({
                id: item.uuid,
                name: item.name,
                imageUrl: item.imageUrl
            }))
            .map(summary => [summary.id, summary]);
        return new Map(summaryEntries);
    }

    public async loadAll(): Promise<Map<string, CraftingComponent>> {
        if (!this._sourceData) {
            throw new Error("Cannot load components. Source data was not defined. ");
        }
        const uniqueItemUuids = Object.values(this._sourceData)
            .map(definition => {
                const theseItemIds = [definition.itemUuid];
                if (definition.salvage) {
                    theseItemIds.push(...Object.keys(definition.salvage))
                }
                return theseItemIds;
            })
            .reduce((left, right) => left.concat(right), [])
            .filter((value, index, array) => array.indexOf(value) === index);
        const itemData = await this._documentManager.getDocumentsByUuid(uniqueItemUuids);
        const essences = await this._essenceCache.getAll();
        const components = await Promise.all(Object.values(this._sourceData).map(async componentJson => {
            return new CraftingComponent({
                id: componentJson.itemUuid,
                name: itemData.get(componentJson.itemUuid).name,
                imageUrl: itemData.get(componentJson.itemUuid).imageUrl ?? Properties.ui.defaults.itemImageUrl,
                essences: combinationFromRecord(componentJson.essences, essences),
                salvage: combinationFromRecord(componentJson.salvage, this.prepareComponentSummaries(itemData))
            });
        }));
        return new Map(components.map(component => [component.id, component]));
    }

    get sourceData(): Record<string, CraftingComponentJson> {
        return this._sourceData;
    }

    contains(id: string): boolean {
        return !!this._sourceData[id];
    }

}

class RecipeLoader implements PartLoader<Recipe, RecipeJson> {

    private readonly _sourceData: Record<string, RecipeJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _essenceCache: PartCache<Essence, EssenceJson>;
    private readonly _componentCache: PartCache<CraftingComponent, CraftingComponentJson>;

    constructor({
        sourceData,
        documentManager,
        essenceCache,
        componentCache
                }: {
        sourceData: Record<string, RecipeJson>;
        documentManager: DocumentManager;
        essenceCache: PartCache<Essence, EssenceJson>;
        componentCache: PartCache<CraftingComponent, CraftingComponentJson>;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._essenceCache = essenceCache;
        this._componentCache = componentCache;
    }

    get sourceData(): Record<string, RecipeJson> {
        return this._sourceData;
    }

    contains(id: string): boolean {
        return !!this._sourceData[id];
    }

    async loadAll(): Promise<Map<string, Recipe>> {
        if (!this._sourceData) {
            throw new Error("Cannot load Recipes. Source data was not defined. ");
        }
        const componentsById = await this._componentCache.getAll();
        const itemData = await this._documentManager.getDocumentsByUuid(Object.keys(this._sourceData));
        const essences = await this._essenceCache.getAll();
        const recipes = await Promise.all(Object.values(this._sourceData).map(async recipeJson => {
            return new Recipe({
                id: recipeJson.itemUuid,
                name: itemData.get(recipeJson.itemUuid).name,
                imageUrl: itemData.get(recipeJson.itemUuid).imageUrl ?? Properties.ui.defaults.itemImageUrl,
                essences: combinationFromRecord(recipeJson.essences, essences),
                catalysts: this.prepareCatalysts(recipeJson.catalysts, componentsById),
                ingredientOptions: this.prepareCombinationChoice(recipeJson.ingredientGroups, componentsById),
                resultOptions: this.prepareCombinationChoice(recipeJson.resultGroups, componentsById)
            });
        }));
        return new Map(recipes.map(recipe => [recipe.id, recipe]));
    }

    async loadById(id: string): Promise<Recipe> {
        const recipeJson = this._sourceData[id];
        if (!recipeJson) {
            throw new Error(`No Recipe data was found for the id "${id}". Known Recipe IDs for this system are: ${Object.keys(this._sourceData).join(", ")}`);
        }
        const catalystIds = recipeJson.catalysts ? Object.keys(recipeJson.catalysts) : [];
        const ingredientIds = recipeJson.ingredientGroups
            .map(combination => Object.keys(combination))
            .reduce((left, right) => left.concat(right), []);
        const resultIds = recipeJson.resultGroups
            .map(combination => Object.keys(combination))
            .reduce((left, right) => left.concat(right), []);
        const uniqueComponentIds = [...catalystIds, ...ingredientIds, ...resultIds]
            .filter((value, index, array) => array.indexOf(value) === index);
        const components = await Promise.all(uniqueComponentIds.map(id => this._componentCache.getById(id)))
        const componentsById = new Map(components.map(component => [component.id, component]));
        const itemData = await this._documentManager.getDocumentByUuid(id);
        const essences = await this._essenceCache.getAll();
        return new Recipe({
            id: recipeJson.itemUuid,
            name: itemData.name,
            imageUrl: itemData.imageUrl ?? Properties.ui.defaults.itemImageUrl,
            essences: combinationFromRecord(recipeJson.essences, essences),
            catalysts: this.prepareCatalysts(recipeJson.catalysts, componentsById),
            ingredientOptions: this.prepareCombinationChoice(recipeJson.ingredientGroups, componentsById),
            resultOptions: this.prepareCombinationChoice(recipeJson.resultGroups, componentsById)
        });
    }

    private prepareCatalysts(catalysts: Record<string, number>, componentsById: Map<string, CraftingComponent>): Combination<CraftingComponent> {
        if (!catalysts) {
            return Combination.EMPTY()
        }
        const catalystIds = Object.keys(catalysts);
        if (catalystIds.length === 0) {
            return Combination.EMPTY()
        }
        return catalystIds.map(catalystId => {
            if (!componentsById.has(catalystId)) {
                throw new Error(`Unable to resolve Catalyst ID "${catalystId}". `)
            }
            return Combination.of(componentsById.get(catalystId), catalysts[catalystId]);
        })
        .reduce((left, right) => left.combineWith(right), Combination.EMPTY());
    }

    private prepareCombinationChoice(ingredientGroups: Record<string, number>[], componentsById: Map<string, CraftingComponent>): CombinationChoice<CraftingComponent> {
        if (!ingredientGroups || ingredientGroups.length === 0) {
            return CombinationChoice.NONE();
        }
        const members = ingredientGroups.map(ingredientGroup => combinationFromRecord(ingredientGroup, componentsById));
        return CombinationChoice.between(...members)
    }

}

class DefaultPartCache<T extends Identifiable & Serializable<K>, K> implements PartCache<T, K> {
    private readonly _cache: Map<string, T>;
    private readonly _partLoader: PartLoader<T, K>;

    private _populated: boolean = false;

    constructor({
        cache = new Map(),
        partLoader
    }: {
        cache?: Map<string, T>;
        partLoader: PartLoader<T, K>;
    }) {
        this._cache = cache;
        this._partLoader = partLoader;
    }

    public contains(id: string): boolean {
        return this._cache.has(id) || !!this._partLoader.contains(id);
    }

    public async deleteById(id: string): Promise<void> {
        if (!this._populated) {
            await this.loadAll();
        }
        this._cache.delete(id);
    }

    public async getAll(): Promise<Map<string, T>> {
        if (!this._populated) {
            await this.loadAll();
        }
        return new Map(this._cache);
    }

    public async getById(id: string): Promise<T> {
        if (this._cache.has(id)) {
            return this._cache.get(id);
        }
        const loaded = await this._partLoader.loadById(id);
        this._cache.set(loaded.id, loaded);
        return loaded;
    }

    public async loadAll(): Promise<Map<string, T>> {
        const loadResult = await this._partLoader.loadAll();
        this._cache.clear();
        Array.from(loadResult.values()).forEach(value => this._cache.set(value.id, value));
        this._populated = true;
        return new Map(this._cache);
    }

    get size(): number {
        return this._cache.size;
    }

    public isEmpty(): boolean {
        return this._cache.size === 0;
    }

    public async update(value: T): Promise<void> {
        if (!this._populated) {
            await this.loadAll();
        }
        this._cache.set(value.id, value);
    }

    public toJson(): Record<string, K> {
        if (!this._populated) {
            return this._partLoader.sourceData;
        }
        const json: Record<string, K> = {};
        this._cache.forEach((value, id) => json[id] = value.toJson());
        return json;
    }

}

class PartDictionary {

    private readonly _essenceCache: PartCache<Essence, EssenceJson>;
    private readonly _componentCache: PartCache<CraftingComponent, CraftingComponentJson>;
    private readonly _recipeCache: PartCache<Recipe, RecipeJson>;

    constructor({
        essenceCache,
        componentCache,
        recipeCache
    }: {
        essenceCache: PartCache<Essence, EssenceJson>;
        componentCache: PartCache<CraftingComponent, CraftingComponentJson>;
        recipeCache: PartCache<Recipe, RecipeJson>;
    }) {
        this._essenceCache = essenceCache;
        this._componentCache = componentCache;
        this._recipeCache = recipeCache;
    }

    public hasEssence(id: string): boolean {
        return this._essenceCache.contains(id);
    }

    public hasEssences(): boolean {
        return !this._essenceCache.isEmpty();
    }

    public hasComponent(id: string): boolean {
        return this._componentCache.contains(id);
    }

    public hasRecipe(id: string): boolean {
        return this._recipeCache.contains(id);
    }

    public async getRecipe(id: string): Promise<Recipe> {
        return await this._recipeCache.getById(id);
    }

    public async getComponent(id: string): Promise<CraftingComponent> {
        return await this._componentCache.getById(id);
    }

    public async getEssence(id: string): Promise<Essence> {
        return await this._essenceCache.getById(id);
    }

    get size(): number {
        return this._recipeCache.size + this._componentCache.size +this._essenceCache.size;
    }

    public async getComponents(): Promise<CraftingComponent[]> {
        const componentsById = await this._componentCache.getAll();
        return Array.from(componentsById.values());
    }

    public async getRecipes(): Promise<Recipe[]> {
        const recipesById = await this._recipeCache.getAll();
        return Array.from(recipesById.values());
    }

    public async getEssences(): Promise<Essence[]> {
        const essencesById = await this._essenceCache.getAll();
        return Array.from(essencesById.values());
    }

    public async insertComponent(craftingComponent: CraftingComponent): Promise<void> {
        return await this._componentCache.update(craftingComponent);
    }

    public async insertRecipe(recipe: Recipe): Promise<void> {
        return await this._recipeCache.update(recipe);
    }

    public async insertEssence(essence: Essence): Promise<void> {
        return await this._essenceCache.update(essence);
    }

    public async deleteComponentById(id: string): Promise<void> {
        return await this._componentCache.deleteById(id);
    }

    public async deleteRecipeById(id: string): Promise<void> {
        return await this._recipeCache.deleteById(id);
    }

    public async deleteEssenceById(id: string): Promise<void> {
        return await this._essenceCache.deleteById(id);
    }

    async loadAll(): Promise<void> {
        await this._essenceCache.getAll();
        await this._componentCache.getAll();
        await this._recipeCache.getAll();
    }

    public toJson(): PartDictionaryJson {
        const essences = this._essenceCache.toJson();
        const components = this._componentCache.toJson();
        const recipes = this._recipeCache.toJson();
        return {
            components,
            recipes,
            essences
        }
    }

}

class PartDictionaryFactory {
    private readonly _documentManager: DocumentManager;

    constructor({
        documentManager = new DefaultDocumentManager()
    }: {
        documentManager?: DocumentManager;
    }) {
        this._documentManager = documentManager;
    }

    make(sourceData: PartDictionaryJson): PartDictionary {
        const essenceLoader = new EssenceLoader({sourceData: sourceData.essences});
        const essenceCache = new DefaultPartCache({partLoader: essenceLoader});
        const documentManager = this._documentManager;
        const componentLoader = new ComponentLoader({sourceData: sourceData.components, essenceCache, documentManager});
        const componentCache = new DefaultPartCache({partLoader: componentLoader});
        const recipeLoader = new RecipeLoader({sourceData: sourceData.recipes, essenceCache, componentCache, documentManager});
        const recipeCache = new DefaultPartCache({partLoader: recipeLoader})
        return new PartDictionary({essenceCache, componentCache, recipeCache});
    }

}

interface PartDictionaryJson {
    components: Record<string, CraftingComponentJson>,
    recipes: Record<string, RecipeJson>,
    essences: Record<string, EssenceJson>
}

export { PartDictionary, PartDictionaryJson, PartDictionaryFactory }