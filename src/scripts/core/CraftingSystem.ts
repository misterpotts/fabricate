import {Fabricator} from "./Fabricator";
import {Recipe} from "./Recipe";
import {RecipeComponent} from "./RecipeComponent";
import {CraftingComponent} from "./CraftingComponent";

class CraftingSystem {
    private readonly _name: string;
    private readonly _compendiumPackKey: string;
    private readonly _fabricator: Fabricator;
    private readonly _recipes: Recipe[];
    private readonly _components: CraftingComponent[];
    private readonly _supportedGameSystems: string[];

    constructor(builder: CraftingSystem.Builder) {
        this._name = builder.name;
        this._compendiumPackKey = builder.compendiumPackKey;
        this._fabricator = builder.fabricator;
        this._recipes = builder.recipes;
        this._components = builder.components;
        this._supportedGameSystems = builder.supportedGameSystems;
    }

    public static builder() {
        return new CraftingSystem.Builder();
    }

    public getFirstRecipeByName(name: string): Recipe {
        return <Recipe>this._recipes.find((recipe) => {
            return recipe.name === name
        });
    }

    get name(): string {
        return this._name;
    }

    public craft(actor: Actor, recipe: Recipe) {
        if (!this.componentsOwnedBy(actor, recipe)) {
            return;
        }
        this.consumeComponentsFrom(actor, recipe.components);
        // let results: CraftingResult[] = this.fabricator.fabricate();
    }

    get compendiumPackKey(): string {
        return this._compendiumPackKey;
    }

    get fabricator(): Fabricator {
        return this._fabricator;
    }

    get supportedGameSystems(): string[] {
        return this._supportedGameSystems;
    }

    get recipes(): Recipe[] {
        return this._recipes;
    }

    get components(): CraftingComponent[] {
        return this._components;
    }

    public supports(gameSystem: string) {
        if (!this._supportedGameSystems || this._supportedGameSystems.length == 0) {
            return true;
        }
        return this._supportedGameSystems.indexOf(gameSystem) > -1;
    }

    private componentsOwnedBy(actor: Actor, recipe: Recipe): boolean {
        let consumables = actor.data.items.filter((i: Item.Data) => i.type == 'consumable');
        return recipe.components.every((component: RecipeComponent) => {
            console.log(component.ingredient.name);
            console.log(consumables);
        });
        return true;
    }

    private consumeComponentsFrom(actor: Actor, components: RecipeComponent[]) {
        let consumables = actor.data.items.filter((i: Item.Data) => i.type == 'consumable');
        components.forEach((recipeComponent) => {
            console.log(recipeComponent.ingredient.name);
            console.log(consumables);
        });
    }
}

namespace CraftingSystem {
    export class Builder {
        public name!: string;
        public compendiumPackKey!: string;
        public fabricator!: Fabricator;
        public supportedGameSystems: string[] = [];
        public recipes: Recipe[] = [];
        public components: CraftingComponent[] = [];

        public withName(value: string) : Builder {
            this.name = value;
            return this;
        }

        public withCompendiumPackKey(value: string) : Builder {
            this.compendiumPackKey = value;
            return this;
        }

        public withFabricator(value: Fabricator) : Builder {
            this.fabricator = value;
            return this;
        }

        public withSupportedGameSystems(value: string[]) : Builder {
            this.supportedGameSystems = value;
            return this;
        }

        public withSupportedGameSystem(value: string) : Builder {
            this.supportedGameSystems.push(value);
            return this;
        }

        public withRecipes(value: Recipe[]) : Builder {
            this.recipes = value;
            return this;
        }

        public withRecipe(value: Recipe) : Builder {
            this.recipes.push(value);
            return this;
        }

        public withComponents(value: CraftingComponent[]) : Builder {
            this.components = value;
            return this;
        }

        public withComponent(value: CraftingComponent) : Builder {
            this.components.push(value);
            return this;
        }

        public build() : CraftingSystem {
            return new CraftingSystem(this);
        }
    }
}

export { CraftingSystem };