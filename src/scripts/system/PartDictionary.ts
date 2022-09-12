import {CraftingComponent} from "../common/CraftingComponent";
import Properties from "../Properties";
import {Recipe} from "../crafting/Recipe";
import {FabricateItemType} from "../compendium/CompendiumData";
import {Essence} from "../common/Essence";

class PartDictionary {

    private readonly _components: Map<string, CraftingComponent> = new Map();
    private readonly _recipes: Map<string, Recipe> = new Map();
    private readonly _essences: Map<string, Essence>;

    constructor({
        components = new Map(),
        recipes = new Map(),
        essences = new Map();
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

    public hasComponent(partId: string): boolean {
        return this._components.has(partId);
    }

    public hasRecipe(partId: string): boolean {
        return this._recipes.has(partId);
    }

    public getRecipe(partId: string): Recipe {
        if (this._recipes.has(partId)) {
            return this._recipes.get(partId);
        }
        throw new Error(`No Recipe was found with the identifier ${partId}. `);
    }

    public getComponent(partId: string): CraftingComponent {
        if (this._components.has(partId)) {
            return this._components.get(partId);
        }
        throw new Error(`No Component was found with the identifier ${partId}. `);
    }

    public size(): number {
        return this._recipes.size + this._components.size;
    }

    public getComponents(): CraftingComponent[] {
        const components: CraftingComponent[] = [];
        for (const component of this._components.values()) {
            components.push(component);
        }
        return components;
    }

    public getRecipes(): Recipe[] {
        const recipes: Recipe[] = [];
        for (const recipe of this._recipes.values()) {
            recipes.push(recipe);
        }
        return recipes;
    }

}

export {PartDictionary}