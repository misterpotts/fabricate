import {Dictionary} from "./Dictionary";
import {
    IngredientOption,
    IngredientOptionJson,
    Recipe,
    RecipeJson,
    ResultOption,
    ResultOptionJson
} from "../common/Recipe";
import {DocumentManager, FabricateItemData, NoFabricateItemData} from "../foundry/DocumentManager";
import {EssenceDictionary} from "./EssenceDictionary";
import {ComponentDictionary} from "./ComponentDictionary";
import {combinationFromRecord} from "./DictionaryUtils";
import {CraftingComponent} from "../common/CraftingComponent";
import {SelectableOptions} from "../common/SelectableOptions";
import {Essence} from "../common/Essence";

export class RecipeDictionary implements Dictionary<RecipeJson, Recipe> {
    private _sourceData: Record<string, RecipeJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _essenceDictionary: EssenceDictionary;
    private readonly _componentDictionary: ComponentDictionary;
    private readonly _entriesById: Map<string, Recipe>;
    private readonly _entriesByItemUuid: Map<string, Recipe>;
    private _loaded: boolean;

    constructor({
        sourceData,
        documentManager,
        essenceDictionary,
        componentDictionary,
        entriesById = new Map(),
        entriesByItemUuid = new Map(),
        loaded = false
    }: {
        sourceData: Record<string, RecipeJson>;
        documentManager: DocumentManager;
        essenceDictionary: EssenceDictionary;
        componentDictionary: ComponentDictionary;
        entriesById?: Map<string, Recipe>;
        entriesByItemUuid?: Map<string, Recipe>;
        loaded?: boolean;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._essenceDictionary = essenceDictionary;
        this._componentDictionary = componentDictionary;
        this._entriesById = entriesById;
        this._entriesByItemUuid = entriesByItemUuid;
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

    getAll(): Map<string, Recipe> {
        return new Map(this._entriesById);
    }

    getById(id: string): Recipe {
        if (!this._entriesById.has(id)) {
            throw new Error(`No Recipe data was found for the id "${id}". Known Recipe IDs for this system are: ${Array.from(this._entriesById.keys()).join(", ")}`);
        }
        return this._entriesById.get(id);
    }

    get sourceData(): Record<string, RecipeJson> {
        return this._sourceData;
    }

    set sourceData(value: Record<string, RecipeJson>) {
        this._sourceData = value;
    }

    insert(recipe: Recipe): void {
        if (this._entriesByItemUuid.has(recipe.itemUuid)) {
            return;
        }
        if (recipe.itemUuid !== NoFabricateItemData.UUID()) {
            this._entriesByItemUuid.set(recipe.itemUuid, recipe);
        }
        this._entriesById.set(recipe.id, recipe);
    }

    deleteById(id: string): void {
        if (!this._entriesById.has(id)) {
            return;
        }
        this._entriesById.delete(id);
        this._entriesByItemUuid.delete(id);
    }

    async loadAll(): Promise<Recipe[]> {
        if (!this._sourceData) {
            throw new Error("Unable to load Recipes. No source data was provided. ");
        }
        await this.loadDependencies();
        const itemUuids = Object.values(this._sourceData)
            .map(data => data.itemUuid);
        const cachedItemDataByUUid = await this._documentManager.getDocumentsByUuid(itemUuids);
        this._entriesById.clear();
        this._entriesByItemUuid.clear();
        const recipes = await Promise.all(Object.keys(this._sourceData)
            .map(id => this.loadById(id, cachedItemDataByUUid)));
        recipes.forEach(recipe => this.insert(recipe));
        this._loaded = true;
        return Array.from(this._entriesById.values());
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

    private buildIngredientOption(name: string, ingredientOptionJson: IngredientOptionJson, allComponents: Map<string, CraftingComponent>): IngredientOption {
        return new IngredientOption({
            name,
            catalysts: combinationFromRecord(ingredientOptionJson.catalysts, allComponents),
            ingredients: combinationFromRecord(ingredientOptionJson.ingredients, allComponents)
        });
    }

    private buildResultOption(name: string, resultOptionJson: ResultOptionJson, allComponents: Map<string, CraftingComponent>): ResultOption {
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
        return Array.from(this._entriesById.entries())
            .map(entry => {
                return {key: entry[0], value: entry[1].toJson()}
            })
            .reduce((left, right) => {
                left[right.key] = right.value;
                return left;
            }, <Record<string, RecipeJson>>{});
    }

    get isEmpty(): boolean {
        return this._entriesById.size === 0;
    }

    dropComponentReferences(componentToDelete: CraftingComponent) {
        Array.from(this._entriesById.values())
            .forEach(recipe => {
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
        Array.from(this._entriesById.values())
            .forEach(recipe => {
                recipe.essences = recipe.essences.without(essenceToDelete);
            });
    }

    containsItemByUuid(itemUuid: string) {
        return this._entriesByItemUuid.has(itemUuid);
    }

    getByItemUuid(itemUuid: string) {
        return this._entriesByItemUuid.get(itemUuid);
    }
}