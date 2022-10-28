import {CraftingComponent, CraftingComponentJson} from "../common/CraftingComponent";
import {ComponentGroup, Recipe, RecipeJson} from "../crafting/Recipe";
import {Essence} from "../common/Essence";
import {GameProvider} from "../foundry/GameProvider";
import Properties from "../Properties";
import {Combination} from "../common/Combination";
import {Identifiable} from "../common/Identifiable";

interface LoadResult {
    components: Map<string, CraftingComponent>;
    recipes: Map<string, Recipe>;
}

class PartDictionaryFactory {

    private readonly _systemId: string;
    private readonly _componentIds: string[];
    private readonly _recipeIds: string[];
    private readonly _essences: Map<string, Essence>;
    private readonly _gameProvider: GameProvider;

    constructor({
        systemId,
        componentIds,
        recipeIds,
        essences,
        gameProvider
                }: {
        systemId: string,
        componentIds: string[],
        recipeIds: string[],
        essences: Map<string, Essence>,
        gameProvider: GameProvider
    }) {
        this._systemId = systemId;
        this._componentIds = componentIds;
        this._recipeIds = recipeIds;
        this._essences = essences;
        this._gameProvider = gameProvider;
    }

    public make(): PartDictionary {
        const partLoader = new PartLoader({
            systemId: this._systemId,
            componentIds: this._componentIds,
            recipeIds: this._recipeIds,
            essences: this._essences,
            gameProvider: this._gameProvider
        });
        return new PartDictionary({partLoader, essences: this._essences});
    }

}

class PartLoader {

    private readonly _systemId: string;
    private readonly _componentIds: string[];
    private readonly _recipeIds: string[];
    private readonly _essences: Map<string, Essence>;
    private readonly _gameProvider: GameProvider;

    constructor({
        systemId,
        componentIds,
        recipeIds,
        essences,
        gameProvider
    }: {
        systemId: string,
        componentIds: string[],
        recipeIds: string[],
        essences: Map<string, Essence>,
        gameProvider: GameProvider
    }) {
        this._systemId = systemId;
        this._componentIds = componentIds;
        this._recipeIds = recipeIds;
        this._essences = essences;
        this._gameProvider = gameProvider;
    }

    async loadItems(): Promise<LoadResult> {
        const allPartIds = this._recipeIds.concat(this._componentIds);
        const allItems = await this._gameProvider.getDocumentsById(allPartIds);

        // todo: convert items individually and remove any that error
        const allItemsById = new Map<string, any>(allItems.filter(item => !!item).map(item => [item.uuid, item]));

        const components = this.loadCraftingComponents(this.filterDocumentsById(allItemsById, this._componentIds), this._essences);
        const recipes = this.loadRecipes(this.filterDocumentsById(allItemsById, this._recipeIds), components, this._essences);

        return {
            recipes,
            components
        };
    }

    private filterDocumentsById(allDocumentsById: Map<string, any>, ids: string[]): any[] {
        return ids.filter(id => allDocumentsById.has(id))
            .map(id => allDocumentsById.get(id));
    }

    public loadCraftingComponents(componentDocuments: any[],
                                   essencesById: Map<string, Essence>): Map<string, CraftingComponent> {
        const unpopulatedComponents = componentDocuments
            .map(document => {
                const componentJson = document.getFlag(Properties.module.id, Properties.flags.keys.item.componentData(this._systemId)) as CraftingComponentJson;
                return {
                    component: new CraftingComponent({
                        id: document.uuid,
                        name: document.name,
                        imageUrl: document.img,
                        essences: this.combinationFromRecord(essencesById, componentJson?.essences ?? {}),
                        salvage: Combination.EMPTY()
                    }),
                    unpopulatedSalvage: componentJson?.salvage ?? {}
                }
            });

        const componentsById = new Map<string, CraftingComponent>(unpopulatedComponents.map(unpopulated => [unpopulated.component.id, unpopulated.component]));

        unpopulatedComponents
            .filter(unpopulatedComponent => Object.keys(unpopulatedComponent.unpopulatedSalvage).length > 0)
            .forEach(unpopulatedComponent => {
                const componentToPopulate = componentsById.get(unpopulatedComponent.component.id);
                const populatedSalvage = Object.keys(unpopulatedComponent.unpopulatedSalvage)
                    .map(id => componentsById.get(id))
                    .map(component => Combination.of(component, unpopulatedComponent.unpopulatedSalvage[component.id]))
                    .reduce((left, right) => left.combineWith(right), Combination.EMPTY());
                componentsById.set(componentToPopulate.id, componentToPopulate.setSalvage(populatedSalvage));
            });
        return componentsById;
    }

    public loadRecipes(recipeDocuments: any[],
                        craftingComponentsById: Map<string, CraftingComponent>,
                        essencesById: Map<string, Essence>): Map<string, Recipe> {
        const recipes = recipeDocuments.map(document => {
                return {
                    recipe: document.getFlag(Properties.module.id, Properties.flags.keys.item.recipe(this._systemId)) as RecipeJson,
                    id: document.uuid,
                    name: document.name,
                    imageUrl: document.img
                }
            })
            .map(storedData => new Recipe({
                id: storedData.id,
                name: storedData.name,
                imageUrl: storedData.imageUrl,
                ingredientGroups: this.componentGroupsFromRecords(craftingComponentsById, storedData?.recipe?.ingredientGroups),
                essences: this.combinationFromRecord(essencesById, storedData?.recipe?.essences),
                resultGroups: this.componentGroupsFromRecords(craftingComponentsById, storedData?.recipe?.resultGroups),
                catalysts: this.combinationFromRecord(craftingComponentsById, storedData?.recipe?.catalysts)
            }));
        return new Map<string, Recipe>(recipes.map(recipe => [recipe.id, recipe]));
    }

    private componentGroupsFromRecords(craftingComponentsById: Map<string, CraftingComponent>, values: Record<string, number>[]): ComponentGroup[] {
        if (!values) {
            return [];
        }
        return values.map(value => this.combinationFromRecord(craftingComponentsById, value))
            .map(combination => new ComponentGroup(combination));
    }

    private combinationFromRecord<T extends Identifiable>(identifiables: Map<string, T>, values: Record<string, number>): Combination<T> {
        if (!values) {
            return Combination.EMPTY();
        }
        return Object.keys(values)
            .map(id => Combination.of(identifiables.get(id), values[id]))
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY());
    }

}

class PartDictionary {

    private readonly _partLoader: PartLoader;

    private readonly _components: Map<string, CraftingComponent>;
    private readonly _recipes: Map<string, Recipe>;
    private readonly _essences: Map<string, Essence>;

    constructor({
        components = new Map(),
        recipes = new Map(),
        essences = new Map(),
        partLoader
    }: {
        components?: Map<string, CraftingComponent>,
        recipes?: Map<string, Recipe>,
        essences?: Map<string, Essence>,
        partLoader: PartLoader
    }) {
        this._components = components;
        this._recipes = recipes;
        this._essences = essences;
        this._partLoader = partLoader;
    }

    public async load(): Promise<void> {
        const loadResult = await this._partLoader.loadItems();
        this._components.clear();
        loadResult.components.forEach((value, key) => this._components.set(key, value));
        this._recipes.clear();
        loadResult.recipes.forEach((value, key) => this._recipes.set(key, value));
    }

    public addRecipe(recipe: Recipe): void {
        this._recipes.set(recipe.id, recipe);
    }

    public addComponent(component: CraftingComponent): void {
        this._components.set(component.id, component);
    }

    public addEssence(essence: Essence): void {
        this._essences.set(essence.id, essence);
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

}

export { PartDictionary, PartDictionaryFactory }