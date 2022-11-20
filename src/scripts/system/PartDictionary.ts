import {StringIdentity, CraftingComponent, CraftingComponentJson} from "../common/CraftingComponent";
import {CombinationChoice, Recipe, RecipeJson} from "../crafting/Recipe";
import {Essence, EssenceJson} from "../common/Essence";
import {DocumentManager} from "../foundry/DocumentManager";
import {Combination} from "../common/Combination";
import Properties from "../Properties";
import {Identifiable} from "../common/Identity";

interface ItemData {
    uuid: string;
    name: string;
    imageUrl: string;
}

interface PartDictionaryLoader {

    load(partDictionary: PartDictionary): Promise<void>;

}

class DefaultPartDictionaryLoader implements PartDictionaryLoader {

    private readonly _documentManager: DocumentManager;
    private readonly _partDictionaryJson: PartDictionaryJson;

    constructor({
        documentManager,
        partDictionaryJson
    } :{
        documentManager: DocumentManager;
        partDictionaryJson: PartDictionaryJson
    }) {
        this._documentManager = documentManager;
        this._partDictionaryJson = partDictionaryJson
    }

    public async load(partDictionary: PartDictionary): Promise<void> {
        const essences = await this.loadEssences(this._partDictionaryJson.essences);
        const components = await this.loadComponents(this._partDictionaryJson.components);
        const recipes = await this.loadRecipes(this._partDictionaryJson.recipes);
        partDictionary.accept({components, recipes, essences});
        return;
    }

    public loadEssences(essences: Record<string, EssenceJson>): Map<string, Essence> {
        return new Map(Object.values(essences)
            .map(essenceJson => [essenceJson.id, this.loadEssence(essenceJson)])
        );
    }

    public loadEssence(essenceJson: EssenceJson): Essence {
        return new Essence({
            id: essenceJson.id,
            name: essenceJson.name,
            description: essenceJson.description,
            iconCode: essenceJson.iconCode,
            tooltip: essenceJson.tooltip
        })
    }

    public async loadComponents(componentsJson: Record<string, CraftingComponentJson>): Promise<Map<string, CraftingComponent>> {
        const loadedComponents = await Promise.all(
            Array.from(Object.values(componentsJson))
                .map(componentJson => this.loadComponent(componentJson))
        );
        return new Map(loadedComponents.map(component => [component.id, component]));
    }

    public async loadComponent(componentJson: CraftingComponentJson): Promise<CraftingComponent> {
        const document = await this._documentManager.getDocumentByUuid(componentJson.itemUuid);
        const itemData = this.extractItemData(document);
        return new CraftingComponent({
            id: componentJson.itemUuid,
            name: itemData.name,
            imageUrl: itemData.imageUrl ?? Properties.ui.defaults.itemImageUrl,
            essences: this.identityCombinationFromRecord(componentJson.essences, StringIdentity),
            salvage: this.identityCombinationFromRecord(componentJson.salvage, StringIdentity),
        });
    }

    public async loadRecipes(recipesJson: Record<string, RecipeJson>): Promise<Map<string, Recipe>> {
        const loadedRecipes = await Promise.all(
            Array.from(Object.values(recipesJson))
                .map(recipeJson => this.loadRecipe(recipeJson))
        );
        return new Map(loadedRecipes.map(recipe => [recipe.id, recipe]));
    }

    public async loadRecipe(recipeJson: RecipeJson): Promise<Recipe> {
        const document = await this._documentManager.getDocumentByUuid(recipeJson.itemUuid);
        const itemData = this.extractItemData(document);
        return new Recipe({
            id: recipeJson.itemUuid,
            name: itemData.name,
            imageUrl: itemData.imageUrl ?? Properties.ui.defaults.itemImageUrl,
            essences: this.identityCombinationFromRecord(recipeJson.essences, StringIdentity),
            catalysts: this.identityCombinationFromRecord(recipeJson.catalysts, StringIdentity),
            ingredientOptions: this.componentIdentityGroupsFromRecords(recipeJson.ingredientGroups),
            resultOptions: this.componentIdentityGroupsFromRecords(recipeJson.resultGroups)
        });
    }

    public extractManyItemsData(documents: any[]): Map<string, ItemData> {
        return new Map(documents.map(document => [document.id, this.extractItemData(document)]));
    }

    public extractItemData(document: any): ItemData {
        return <ItemData>{
            uuid: document.uuid,
            name: document.name,
            imageUrl: document.img
        }
    }

    private identityCombinationFromRecord<T extends Identifiable>(record: Record<string, number>,
                                                                  constructorFunction: new (...args: any[]) => T): Combination<T> {
        return Array.from(Object.keys(record))
            .map(key => Combination.of(new constructorFunction(key), record[key]))
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY())
    }

    private componentIdentityGroupsFromRecords(componentCombinationChoices: Record<string, number>[]): CombinationChoice<StringIdentity> {
        if (!componentCombinationChoices) {
            return CombinationChoice.NONE();
        }
        const combinations = componentCombinationChoices
            .map(value => this.identityCombinationFromRecord(value, StringIdentity));
        return new CombinationChoice<StringIdentity>(combinations);
    }

}

interface PartDictionaryData {
    components?: Map<string, CraftingComponent>;
    recipes?: Map<string, Recipe>;
    essences?: Map<string, Essence>;
}

class PartDictionary {

    private readonly _components: Map<string, CraftingComponent>;
    private readonly _recipes: Map<string, Recipe>;
    private readonly _essences: Map<string, Essence>;

    constructor({
        components = new Map(),
        recipes = new Map(),
        essences = new Map()
    }: PartDictionaryData) {
        this._components = components;
        this._recipes = recipes;
        this._essences = essences;
    }

    public hasEssence(id: string): boolean {
        return this._essences.has(id);
    }

    public hasComponent(id: string): boolean {
        return this._components.has(id);
    }

    public hasRecipe(id: string): boolean {
        return this._recipes.has(id);
    }

    public getRecipe(id: string): Recipe {
        if (this._recipes.has(id)) {
            return this._recipes.get(id);
        }
        throw new Error(`No Recipe was found with the identifier ${id}. `);
    }

    public getComponent(id: string): CraftingComponent {
        if (this._components.has(id)) {
            return this._components.get(id);
        }
        throw new Error(`No Component was found with the identifier ${id}. `);
    }

    public getEssence(id: string): Essence {
        if (this._essences.has(id)) {
            return this._essences.get(id);
        }
        throw new Error(`No Essence was found with the identifier ${id}. `);
    }

    public size(): number {
        return this._recipes.size + this._components.size +this._essences.size;
    }

    public getComponents(): CraftingComponent[] {
        return Array.from(this._components.values());
    }

    public getRecipes(): Recipe[] {
        return Array.from(this._recipes.values());
    }

    public getEssences(): Essence[] {
        return Array.from(this._essences.values());
    }

    public toJson(): PartDictionaryJson {
        const componentsJson: Record<string, CraftingComponentJson> = {};
        this._components.forEach((component, id) => componentsJson[id] = component.toJson());

        const recipesJson: Record<string, RecipeJson> = {};
        this._recipes.forEach((recipe, id) => recipesJson[id] = recipe.toJson());

        const essencesJson: Record<string, EssenceJson> = {};
        this._essences.forEach((essence, id) => essencesJson[id] = essence.toJson());

        return {
            components: componentsJson,
            recipes: recipesJson,
            essences: essencesJson
        }
    }

    addComponent(craftingComponent: CraftingComponent) {
        this._components.set(craftingComponent.id, craftingComponent);
    }

    addRecipe(recipe: Recipe) {
        this._recipes.set(recipe.id, recipe);
    }

    addEssence(essence: Essence) {
        this._essences.set(essence.id, essence);
    }

    deleteComponentById(id: string) {
        this._components.delete(id);
    }

    deleteRecipeById(id: string) {
        this._recipes.delete(id);
    }

    deleteEssenceById(id: string) {
        this._essences.delete(id);
    }

    editEssence(modified: Essence): Essence {
        if (!this._essences.has(modified.id)) {
            this._essences.set(modified.id, modified);
            return null;
        }
        const previous = this._essences.get(modified.id);
        this._essences.set(modified.id, modified);
        return previous;

    }

    accept(partDictionaryData: PartDictionaryData): void {
        this._essences.clear();
        partDictionaryData.essences.forEach((value, key) => this._essences.set(key, value));

        this._components.clear();
        partDictionaryData.components.forEach((value, key) => this._components.set(key, value));

        this._recipes.clear();
        partDictionaryData.recipes.forEach((value, key) => this._recipes.set(key, value));
    }

}

interface PartDictionaryJson {
    components: Record<string, CraftingComponentJson>,
    recipes: Record<string, RecipeJson>,
    essences: Record<string, EssenceJson>
}

export { PartDictionary, PartDictionaryJson, PartDictionaryLoader, DefaultPartDictionaryLoader }