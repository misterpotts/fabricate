import {CraftingComponent} from "../common/CraftingComponent";
import {Recipe} from "../crafting/Recipe";
import {Essence} from "../common/Essence";

class PartDictionary {

    private readonly _components: Map<string, CraftingComponent> = new Map();
    private readonly _recipes: Map<string, Recipe> = new Map();
    private readonly _essences: Map<string, Essence>;

    constructor({
        components = new Map(),
        recipes = new Map(),
        essences = new Map()
    }: {
        components?: Map<string, CraftingComponent>,
        recipes?: Map<string, Recipe>,
        essences?: Map<string, Essence>
    }) {
        this._components = components;
        this._recipes = recipes;
        this._essences = essences;
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

export {PartDictionary}