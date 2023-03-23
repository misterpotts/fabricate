import {CraftingComponent, CraftingComponentJson} from "../common/CraftingComponent";
import {Recipe, RecipeJson} from "../common/Recipe";
import {Essence, EssenceJson} from "../common/Essence";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";
import {EssenceDictionary} from "./EssenceDictionary";
import {ComponentDictionary} from "./ComponentDictionary";
import {RecipeDictionary} from "./RecipeDictionary";


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

    get componentsByUuid(): Map<string, CraftingComponent> {
        return this._componentDictionary.allByItemUuid;
    }

    public getRecipes(): Recipe[] {
        const recipesById = this._recipeDictionary.getAll();
        return Array.from(recipesById.values());
    }

    public getEssences(): Essence[] {
        const essencesById = this._essenceDictionary.getAll();
        return Array.from(essencesById.values());
    }

    public insertComponent(craftingComponent: CraftingComponent): void {
        this._componentDictionary.insert(craftingComponent);
    }

    async mutateComponent(id: string, mutation: CraftingComponentJson): Promise<CraftingComponent> {
        return this._componentDictionary.mutate(id, mutation);
    }

    async mutateRecipe(id: string, mutation: RecipeJson): Promise<Recipe> {
        return this._recipeDictionary.mutate(id, mutation);
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
        if (!this.isLoaded) {
            throw new Error("Fabricate currently requires that a part dictionary is loaded before it is serialized and saved. ");
        }
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

    hasRecipeUuid(itemUuid: string) {
        return this._recipeDictionary.containsItemByUuid(itemUuid);
    }

    getComponentByItemUuid(uuid: string) {
        return this._componentDictionary.getByItemUuid(uuid);
    }

    getRecipeByItemUuid(uuid: string) {
        return this._recipeDictionary.getByItemUuid(uuid);
    }

    async createRecipe(recipeJson: RecipeJson): Promise<Recipe> {
        return this._recipeDictionary.create(recipeJson);
    }

    async createComponent(craftingComponentJson: CraftingComponentJson): Promise<CraftingComponent> {
        return this._componentDictionary.create(craftingComponentJson);
    }

    async createEssence(essenceJson: EssenceJson): Promise<Essence> {
        return this._essenceDictionary.create(essenceJson);
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
        const essenceDictionary = new EssenceDictionary({
            sourceData: sourceData.essences,
            documentManager
        });
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
    components: Record<string, CraftingComponentJson>;
    recipes: Record<string, RecipeJson>;
    essences: Record<string, EssenceJson>;
}

export { PartDictionary, PartDictionaryJson, PartDictionaryFactory }