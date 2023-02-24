import {CraftingComponent, CraftingComponentJson, SalvageOption, SalvageOptionJson} from "../common/CraftingComponent";
import {
    IngredientOption,
    IngredientOptionJson,
    Recipe,
    RecipeJson,
    ResultOption,
    ResultOptionJson
} from "../common/Recipe";
import {Essence, EssenceJson} from "../common/Essence";
import {
    DefaultDocumentManager,
    DocumentManager,
    FabricateItemData, NoFabricateItemData,
    PendingFabricateItemData
} from "../foundry/DocumentManager";
import {Identifiable, Serializable} from "../common/Identity";
import {Combination} from "../common/Combination";
import {SelectableOptions} from "../common/SelectableOptions";
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

interface Dictionary<J, I extends Identifiable & Serializable<J>> {

    loadAll(): Promise<I[]>;
    loadById(id: string): Promise<I>;
    sourceData: Record<string, J>;
    isLoaded: boolean;
    getById(id: string): I;
    getAll(): Map<string, I>;
    toJson(): Record<string, J>;
    contains(id: string): boolean;
    size: number;
    isEmpty: boolean;
    insert(item: I): void;
    hasErrors: boolean;
    entriesWithErrors: I[];
    deleteById(id: string): void;

}

class EssenceDictionary implements Dictionary<EssenceJson, Essence> {

    private _sourceData: Record<string, EssenceJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _entries: Map<string, Essence>;
    private _loaded: boolean;

    constructor({
        sourceData,
        documentManager,
        entries = new Map(),
        loaded = false
    }: {
        sourceData: Record<string, EssenceJson>;
        documentManager: DocumentManager;
        entries?: Map<string, Essence>;
        loaded?: boolean;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._entries = entries;
        this._loaded = loaded;
    }

    public clone(): EssenceDictionary {
        return new EssenceDictionary({
            sourceData: this._sourceData,
            documentManager: this._documentManager
        })
    }

    get entriesWithErrors(): Essence[] {
        return Array.from(this._entries.values()).filter(entry => entry.hasErrors);
    }

    get hasErrors(): boolean {
        return this.entriesWithErrors.length > 0;
    }

    get isLoaded(): boolean {
        return this._loaded;
    }

    get size(): number {
        return this._entries.size;
    }

    contains(id: string): boolean {
        return this._entries.has(id);
    }

    getAll(): Map<string, Essence> {
        return new Map(this._entries);
    }

    getById(id: string): Essence {
        if (!this._entries.has(id)) {
            throw new Error(`No Essence data was found for the id "${id}". Known Essence IDs for this system are: ${Array.from(this._entries.keys()).join(", ")}`);
        }
        return this._entries.get(id);
    }

    get sourceData(): Record<string, EssenceJson> {
        return this._sourceData;
    }

    set sourceData(value: Record<string, EssenceJson>) {
        this._sourceData = value;
    }

    insert(essence: Essence): void {
        this._entries.set(essence.id, essence);
    }

    deleteById(id: string): void {
        this._entries.delete(id);
    }

    async loadAll(): Promise<Essence[]> {
        if (!this._sourceData) {
            throw new Error("Unable to load Essences. No source data was provided. ");
        }
        const itemUuids = Object.values(this._sourceData)
            .filter(data => !!data.activeEffectSourceItemUuid)
            .map(data => data.activeEffectSourceItemUuid);
        const cachedItemDataByUUid = await this._documentManager.getDocumentsByUuid(itemUuids);
        this._entries.clear();
        const essences = await Promise.all(Object.keys(this._sourceData).map(id => this.loadById(id, cachedItemDataByUUid)));
        essences.forEach(essence => this._entries.set(essence.id, essence));
        this._loaded = true;
        return essences;
    }

    async loadById(id: string, itemDataCache?: Map<string, FabricateItemData>): Promise<Essence> {
        const sourceRecord = this._sourceData[id];
        if (!sourceRecord) {
            throw new Error(`Unable to load Essence with ID ${id}. No definition for the essence was found in source data. 
                This can occur if an Essence is loaded before it is saved or an invalid ID is passed.`);
        }
        const essence = new Essence({
            id: id,
            name: sourceRecord.name,
            description: sourceRecord.description,
            iconCode: sourceRecord.iconCode,
            tooltip: sourceRecord.tooltip,
            activeEffectSource: sourceRecord.activeEffectSourceItemUuid ? new PendingFabricateItemData(sourceRecord.activeEffectSourceItemUuid) : null
        });
        if (essence.hasActiveEffectSource) {
            let itemData: FabricateItemData;
            if (itemDataCache.has(essence.activeEffectSource.uuid)) {
                itemData = itemDataCache.get(essence.activeEffectSource.uuid);
            } else {
                itemData = await this._documentManager.getDocumentByUuid(essence.activeEffectSource.uuid);
            }
            essence.activeEffectSource = itemData;
        }
        return essence;
    }

    toJson(): Record<string, EssenceJson> {
        return Array.from(this._entries.entries())
            .map(entry => { return  {key: entry[0], value: entry[1].toJson() } })
            .reduce((left, right) => {
                left[right.key] = right.value;
                return left;
            }, <Record<string, EssenceJson>>{});
    }

    get isEmpty(): boolean {
        return this._entries.size === 0;
    }

}

class ComponentDictionary implements Dictionary<CraftingComponentJson, CraftingComponent> {

    private _sourceData: Record<string, CraftingComponentJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _essenceDictionary: EssenceDictionary;
    private readonly _entriesById: Map<string, CraftingComponent>;
    private readonly _entriesByItemUuid: Map<string, CraftingComponent>;
    private _loaded: boolean;

    constructor({
        sourceData,
        documentManager,
        essenceDictionary,
        entriesById = new Map(),
        entriesByItemUuid = new Map(),
        loaded = false
    }: {
        sourceData: Record<string, CraftingComponentJson>;
        documentManager: DocumentManager;
        essenceDictionary: EssenceDictionary;
        entriesById?: Map<string, CraftingComponent>;
        entriesByItemUuid?: Map<string, CraftingComponent>;
        loaded?: boolean;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._essenceDictionary = essenceDictionary;
        this._entriesById = entriesById;
        this._entriesByItemUuid = entriesByItemUuid;
        this._loaded = loaded;
    }

    public clone(): ComponentDictionary {
        return new ComponentDictionary({
            sourceData: this._sourceData,
            documentManager: this._documentManager,
            essenceDictionary: this._essenceDictionary
        })
    }

    get entriesWithErrors(): CraftingComponent[] {
        return Array.from(this._entriesById.values()).filter(entry => entry.hasErrors);
    }

    get hasErrors(): boolean {
        return this.entriesWithErrors.length > 0;
    }

    get isLoaded(): boolean {
        return this._loaded && this._essenceDictionary.isLoaded;
    }

    get size(): number {
        return this._entriesById.size;
    }

    contains(id: string): boolean {
        return this._entriesById.has(id);
    }

    getAll(): Map<string, CraftingComponent> {
        return new Map(this._entriesById);
    }

    getById(id: string): CraftingComponent {
        if (!this._entriesById.has(id)) {
            throw new Error(`No Component data was found for the id "${id}". Known Component IDs for this system are: ${Array.from(this._entriesById.keys()).join(", ")}`);
        }
        return this._entriesById.get(id);
    }

    get sourceData(): Record<string, CraftingComponentJson> {
        return this._sourceData;
    }

    set sourceData(value: Record<string, CraftingComponentJson>) {
        this._sourceData = value;
    }

    insert(craftingComponent: CraftingComponent): void {
        if (this._entriesByItemUuid.has(craftingComponent.itemUuid)) {
            return;
        }
        if (craftingComponent.itemUuid !== NoFabricateItemData.UUID()) {
            this._entriesByItemUuid.set(craftingComponent.itemUuid, craftingComponent);
        }
        this._entriesById.set(craftingComponent.id, craftingComponent);
    }

    deleteById(id: string): void {
        if (!this._entriesById.has(id)) {
            return;
        }
        const componentToDelete = this._entriesById.get(id);
        this._entriesById.delete(id);
        this._entriesByItemUuid.delete(id);
        Array.from(this._entriesById.values())
            .forEach(component => {
                if (!component.isSalvageable) {
                    return;
                }
                component.salvageOptions = component.salvageOptions
                    .map(option => {
                        if (!option.salvage.has(componentToDelete)) {
                            return option;
                        }
                        option.salvage = option.salvage.without(componentToDelete);
                        return option;
                    });
            });
    }

    async loadAll(): Promise<CraftingComponent[]> {
        if (!this._sourceData) {
            throw new Error("Unable to load Crafting components. No source data was provided. ");
        }
        await this.loadDependencies();
        const itemUuids = Object.values(this._sourceData)
            .map(data => data.itemUuid);
        const cachedItemDataByUUid = await this._documentManager.getDocumentsByUuid(itemUuids);
        this._entriesById.clear();
        this._entriesByItemUuid.clear();
        // Loads all components _without_ loading salvage data
        Object.keys(this._sourceData)
            .map(id => { return { id, json: this._sourceData[id] } })
            .map(data => new CraftingComponent({
                id: data.id,
                itemData: cachedItemDataByUUid.get(data.json.itemUuid),
                essences: combinationFromRecord(data.json.essences, this._essenceDictionary.getAll()),
                disabled: data.json.disabled,
                salvageOptions: new SelectableOptions<SalvageOptionJson, SalvageOption>({})
            }))
            .forEach(component => this.insert(component));
        // Iterates over components again to load their salvage data using loaded component references
        const craftingComponents = Array.from(this._entriesById.values());
        craftingComponents
            .forEach(component => {
                const salvageOptionsConfig = this._sourceData[component.id].salvageOptions;
                if (salvageOptionsConfig && Object.keys(salvageOptionsConfig).length > 0) {
                    component.salvageOptions = this.buildSalvageOptions(salvageOptionsConfig, this._entriesById).options;
                }
            });
        this._loaded = true;
        return craftingComponents;
    }

    async loadById(id: string): Promise<CraftingComponent> {
        const sourceRecord = this._sourceData[id];
        if (!sourceRecord) {
            throw new Error(`Unable to load Crafting Component with ID ${id}. No definition for the component was found in source data. 
                This can occur if a component is loaded before it is saved or an invalid ID is passed.`);
        }
        await this.loadDependencies();
        const itemUuid = sourceRecord.itemUuid;
        const itemData = await this._documentManager.getDocumentByUuid(itemUuid);
        return new CraftingComponent({
            id,
            itemData,
            disabled: sourceRecord.disabled,
            salvageOptions: this.buildSalvageOptions(sourceRecord.salvageOptions, this._entriesById),
            essences: combinationFromRecord(sourceRecord.essences, this._essenceDictionary.getAll()),
        });
    }

    private buildSalvageOptions(salvageOptionsJson: Record<string, SalvageOptionJson>, allComponents: Map<string, CraftingComponent>): SelectableOptions<SalvageOptionJson, SalvageOption> {
        const options = Object.keys(salvageOptionsJson)
            .map(name => this.buildSalvageOption(name, salvageOptionsJson[name], allComponents));
        return new SelectableOptions<SalvageOptionJson, SalvageOption>({
            options
        });
    }

    private buildSalvageOption(name: string, salvageOptionJson: SalvageOptionJson, allComponents: Map<string, CraftingComponent>) : SalvageOption {
        return new SalvageOption({
            name,
            salvage: combinationFromRecord(salvageOptionJson, allComponents)
        });
    }

    private async loadDependencies() {
        if (!this._essenceDictionary.isLoaded) {
            await this._essenceDictionary.loadAll();
        }
    }

    toJson(): Record<string, CraftingComponentJson> {
        return Array.from(this._entriesById.entries())
            .map(entry => { return  {key: entry[0], value: entry[1].toJson() } })
            .reduce((left, right) => {
                left[right.key] = right.value;
                return left;
            }, <Record<string, CraftingComponentJson>>{});
    }

    get isEmpty(): boolean {
        return this._entriesById.size === 0;
    }

    dropEssenceReferences(essenceToDelete: Essence) {
        Array.from(this._entriesById.values())
            .forEach(component => {
                component.essences = component.essences.without(essenceToDelete);
            });
    }

    containsItemByUuid(itemUuid: string) {
        return this._entriesByItemUuid.has(itemUuid);
}

    getByItemUuid(uuid: string) {
        return this._entriesByItemUuid.get(uuid);
    }
}

class RecipeDictionary implements Dictionary<RecipeJson, Recipe> {
    private _sourceData: Record<string, RecipeJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _essenceDictionary: EssenceDictionary;
    private readonly _componentDictionary: ComponentDictionary;
    private readonly _entries: Map<string, Recipe>;
    private _loaded: boolean;

    constructor({
        sourceData,
        documentManager,
        essenceDictionary,
        componentDictionary,
        entries = new Map(),
        loaded = false
    }: {
        sourceData: Record<string, RecipeJson>;
        documentManager: DocumentManager;
        essenceDictionary: EssenceDictionary;
        componentDictionary: ComponentDictionary;
        entries?: Map<string, Recipe>;
        loaded?: boolean;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._essenceDictionary = essenceDictionary;
        this._componentDictionary = componentDictionary;
        this._entries = entries;
        this._loaded = loaded;
    }

    public clone(): RecipeDictionary {
        return new RecipeDictionary({
            sourceData: this._sourceData,
            documentManager: this._documentManager,
            essenceDictionary: this._essenceDictionary,
            componentDictionary: this._componentDictionary
        });
    }

    get entriesWithErrors(): Recipe[] {
        return Array.from(this._entries.values()).filter(entry => entry.hasErrors);
    }

    get hasErrors(): boolean {
        return this.entriesWithErrors.length > 0;
    }

    get isLoaded(): boolean {
        return this._loaded && this._essenceDictionary.isLoaded;
    }

    get size(): number {
        return this._entries.size;
    }

    contains(id: string): boolean {
        return this._entries.has(id);
    }

    getAll(): Map<string, Recipe> {
        return new Map(this._entries);
    }

    getById(id: string): Recipe {
        if (!this._entries.has(id)) {
            throw new Error(`No Recipe data was found for the id "${id}". Known Recipe IDs for this system are: ${Array.from(this._entries.keys()).join(", ")}`);
        }
        return this._entries.get(id);
    }

    get sourceData(): Record<string, RecipeJson> {
        return this._sourceData;
    }

    set sourceData(value: Record<string, RecipeJson>) {
        this._sourceData = value;
    }

    insert(recipe: Recipe): void {
        this._entries.set(recipe.id, recipe);
    }

    deleteById(id: string): void {
        this._entries.delete(id);
    }

    async loadAll(): Promise<Recipe[]> {
        if (!this._sourceData) {
            throw new Error("Unable to load Recipes. No source data was provided. ");
        }
        await this.loadDependencies();
        const itemUuids = Object.values(this._sourceData)
            .map(data => data.itemUuid);
        const cachedItemDataByUUid = await this._documentManager.getDocumentsByUuid(itemUuids);
        this._entries.clear();
        const recipes = await Promise.all(Object.keys(this._sourceData)
            .map(id => this.loadById(id, cachedItemDataByUUid)));
        recipes.forEach(recipe => this._entries.set(recipe.id, recipe));
        this._loaded = true;
        return Array.from(this._entries.values());
    }

    async loadById(id: string, itemDataCache?: Map<string, FabricateItemData>): Promise<Recipe> {
        const sourceRecord = this._sourceData[id];
        if (!sourceRecord) {
            throw new Error(`Unable to load Recipe with ID ${id}. No definition for the recipe was found in source data. 
                This can occur if a recipe is loaded before it is saved or an invalid ID is passed.`);
        }
        await this.loadDependencies();
        const itemUuid = sourceRecord.itemUuid;
        const itemData = itemDataCache.has(itemUuid) ? itemDataCache.get(itemUuid) : await this._documentManager.getDocumentByUuid(itemUuid);
        return new Recipe({
            id,
            itemData,
            disabled: sourceRecord.disabled,
            ingredientOptions: this.buildIngredientOptions(sourceRecord.ingredientOptions, this._componentDictionary.getAll()),
            resultOptions: this.buildResultOptions(sourceRecord.resultOptions, this._componentDictionary.getAll()),
            essences: combinationFromRecord(sourceRecord.essences, this._essenceDictionary.getAll())
        });
    }

    private buildIngredientOptions(ingredientOptionsJson: Record<string, IngredientOptionJson>, allComponents: Map<string, CraftingComponent>): SelectableOptions<IngredientOptionJson, IngredientOption> {
        const options = Object.keys(ingredientOptionsJson)
            .map(name => this.buildIngredientOption(name, ingredientOptionsJson[name], allComponents));
        return new SelectableOptions<IngredientOptionJson, IngredientOption>({
            options
        });
    }

    private buildResultOptions(resultOptionsJson: Record<string, ResultOptionJson>, allComponents: Map<string, CraftingComponent>): SelectableOptions<ResultOptionJson, ResultOption> {
        const options = Object.keys(resultOptionsJson)
            .map(name => this.buildResultOption(name, resultOptionsJson[name], allComponents));
        return new SelectableOptions<ResultOptionJson, ResultOption>({
            options
        });
    }

    private buildIngredientOption(name: string, ingredientOptionJson: IngredientOptionJson, allComponents: Map<string, CraftingComponent>) : IngredientOption {
        return new IngredientOption({
            name,
            catalysts: combinationFromRecord(ingredientOptionJson.catalysts, allComponents),
            ingredients: combinationFromRecord(ingredientOptionJson.ingredients, allComponents)
        });
    }

    private buildResultOption(name: string, resultOptionJson: ResultOptionJson, allComponents: Map<string, CraftingComponent>) : ResultOption {
        return new ResultOption({
            name,
            results: combinationFromRecord(resultOptionJson, allComponents)
        });
    }

    private async loadDependencies() {
        if (!this._essenceDictionary.isLoaded) {
            await this._essenceDictionary.loadAll();
        }
        if (!this._componentDictionary.isLoaded) {
            await this._componentDictionary.loadAll();
        }
    }

    toJson(): Record<string, RecipeJson> {
        return Array.from(this._entries.entries())
            .map(entry => { return  {key: entry[0], value: entry[1].toJson() } })
            .reduce((left, right) => {
                left[right.key] = right.value;
                return left;
            }, <Record<string, RecipeJson>>{});
    }

    get isEmpty(): boolean {
        return this._entries.size === 0;
    }

    dropComponentReferences(componentToDelete: CraftingComponent) {
        Array.from(this._entries.keys())
            .forEach(id => {
                const recipe = this._entries.get(id);
                recipe.ingredientOptions = recipe.ingredientOptions
                    .map(ingredientOption => {
                        if (ingredientOption.ingredients.has(componentToDelete)) {
                            ingredientOption.ingredients = ingredientOption.ingredients.without(componentToDelete);
                        }
                        if (ingredientOption.catalysts.has(componentToDelete)) {
                            ingredientOption.catalysts = ingredientOption.catalysts.without(componentToDelete);
                        }
                        return ingredientOption;
                    });
                recipe.resultOptions = recipe.resultOptions
                    .map(resultOption => {
                        if (resultOption.results.has(componentToDelete)) {
                            resultOption.results = resultOption.results.without(componentToDelete);
                        }
                        return resultOption;
                    });
            });
    }

    dropEssenceReferences(essenceToDelete: Essence) {
        Array.from(this._entries.keys())
            .forEach(id => {
                const recipe = this._entries.get(id);
                recipe.essences = recipe.essences.without(essenceToDelete);
            });
    }
}


class PartDictionary {

    private readonly _essenceDictionary: EssenceDictionary;
    private readonly _componentDictionary: ComponentDictionary;
    private readonly _recipeDictionary: RecipeDictionary;

    constructor({
        essenceDictionary,
        componentDictionary,
        recipeDictionary
    }: {
        essenceDictionary: EssenceDictionary;
        componentDictionary: ComponentDictionary;
        recipeDictionary: RecipeDictionary;
    }) {
        this._essenceDictionary = essenceDictionary;
        this._componentDictionary = componentDictionary;
        this._recipeDictionary = recipeDictionary;
    }

    get isLoaded(): boolean {
        return this._essenceDictionary.isLoaded && this._componentDictionary.isLoaded && this._recipeDictionary.isLoaded;
    }

    get hasErrors(): boolean {
        return this._essenceDictionary.hasErrors || this._componentDictionary.hasErrors || this._recipeDictionary.hasErrors;
    }

    public hasEssence(id: string): boolean {
        return this._essenceDictionary.contains(id);
    }

    public hasEssences(): boolean {
        return !this._essenceDictionary.isEmpty;
    }

    public hasComponent(id: string): boolean {
        return this._componentDictionary.contains(id);
    }

    public hasRecipe(id: string): boolean {
        return this._recipeDictionary.contains(id);
    }

    public getRecipe(id: string): Recipe {
        return this._recipeDictionary.getById(id);
    }

    public getComponent(id: string): CraftingComponent {
        return this._componentDictionary.getById(id);
    }

    public getEssence(id: string): Essence {
        return this._essenceDictionary.getById(id);
    }

    get size(): number {
        return this._recipeDictionary.size + this._componentDictionary.size + this._essenceDictionary.size;
    }

    public getComponents(): CraftingComponent[] {
        const componentsById = this._componentDictionary.getAll();
        return Array.from(componentsById.values());
    }

    public async getRecipes(): Promise<Recipe[]> {
        const recipesById = await this._recipeDictionary.getAll();
        return Array.from(recipesById.values());
    }

    public getEssences(): Essence[] {
        const essencesById = this._essenceDictionary.getAll();
        return Array.from(essencesById.values());
    }

    public insertComponent(craftingComponent: CraftingComponent): void {
        this._componentDictionary.insert(craftingComponent);
    }

    public insertRecipe(recipe: Recipe): void {
        this._recipeDictionary.insert(recipe);
    }

    public insertEssence(essence: Essence): void {
        this._essenceDictionary.insert(essence);
    }

    public deleteComponentById(id: string): void {
        const componentToDelete = this._componentDictionary.getById(id);
        this._componentDictionary.deleteById(id);
        this._recipeDictionary.dropComponentReferences(componentToDelete);
    }

    public deleteRecipeById(id: string): void {
        return this._recipeDictionary.deleteById(id);
    }

    public deleteEssenceById(id: string): void {
        const essenceToDelete = this._essenceDictionary.getById(id);
        this._essenceDictionary.deleteById(id);
        this._componentDictionary.dropEssenceReferences(essenceToDelete);
        this._recipeDictionary.dropEssenceReferences(essenceToDelete);
    }

    async loadAll(updatedSource?: PartDictionaryJson): Promise<void> {
        if (updatedSource) {
            this._essenceDictionary.sourceData = updatedSource.essences;
            this._componentDictionary.sourceData = updatedSource.components;
            this._recipeDictionary.sourceData = updatedSource.recipes;
        }
        await this._essenceDictionary.loadAll();
        await this._componentDictionary.loadAll();
        await this._recipeDictionary.loadAll();
    }
    
    async loadEssences(updatedSource?: Record<string, EssenceJson>): Promise<void> {
        if (updatedSource) {
            this._essenceDictionary.sourceData = updatedSource;
        }
        await this._essenceDictionary.loadAll();
    }

    async loadComponents(updatedSource?: Record<string, CraftingComponentJson>): Promise<void> {
        if (updatedSource) {
            this._componentDictionary.sourceData = updatedSource;
        }
        await this._componentDictionary.loadAll();
    }

    async loadRecipes(updatedSource?: Record<string, RecipeJson>): Promise<void> {
        if (updatedSource) {
            this._recipeDictionary.sourceData = updatedSource;
        }
        await this._recipeDictionary.loadAll();
    }

    public toJson(): PartDictionaryJson {
        const essences = this._essenceDictionary.toJson();
        const components = this._componentDictionary.toJson();
        const recipes = this._recipeDictionary.toJson();
        return {
            components,
            recipes,
            essences
        }
    }

    clone() {
        return new PartDictionary({
            essenceDictionary: this._essenceDictionary.clone(),
            recipeDictionary: this._recipeDictionary.clone(),
            componentDictionary: this._componentDictionary.clone()
        });
    }

    hasComponentUuid(itemUuid: string) {
        return this._componentDictionary.containsItemByUuid(itemUuid);
    }

    getComponentByItemUuid(uuid: string) {
        return this._componentDictionary.getByItemUuid(uuid);
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
        const documentManager = this._documentManager;
        const essenceDictionary = new EssenceDictionary({sourceData: sourceData.essences, documentManager});
        const componentDictionary = new ComponentDictionary({
            sourceData: sourceData.components,
            documentManager,
            essenceDictionary
        });
        const recipeDictionary = new RecipeDictionary({
            sourceData: sourceData.recipes,
            documentManager,
            essenceDictionary,
            componentDictionary
        });
        return new PartDictionary({
            essenceDictionary,
            componentDictionary,
            recipeDictionary
        });
    }

}

interface PartDictionaryJson {
    components: Record<string, CraftingComponentJson>,
    recipes: Record<string, RecipeJson>,
    essences: Record<string, EssenceJson>
}

export { PartDictionary, PartDictionaryJson, PartDictionaryFactory }