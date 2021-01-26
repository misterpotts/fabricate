import {Fabricator} from "./Fabricator.js";
import {Recipe} from "./Recipe.js";
import {RecipeComponent} from "./RecipeComponent.js";
import {RecipeResult} from "./RecipeResult.js";
import {CraftingElement} from "./CraftingElement.js";

class CraftingSystem {
    private readonly _name: string;
    private readonly _compendiumPackKey: string;
    private readonly _fabricator: Fabricator;
    private readonly _recipes: Recipe[];
    private readonly _supportedGameSystems: string[];
    private readonly _includedItems: CraftingElement[];

    constructor(builder: CraftingSystem.Builder) {
        this._name = builder.name;
        this._compendiumPackKey = builder.compendiumPackKey;
        this._fabricator = builder.fabricator;
        this._supportedGameSystems = builder.supportedGameSystems;
        this._recipes = builder.recipes;
        this._includedItems = this.extractIncludedItemsFromRecipes(this._recipes);
    }

    private extractIncludedItemsFromRecipes(recipes: Recipe[]): CraftingElement[] {
        let knownItems = new Map<string, CraftingElement>();
        recipes.forEach((recipe: Recipe) => {
            recipe.results.forEach((result: RecipeResult) => {
                if (!knownItems.has(result.item.itemId)) {
                    knownItems.set(result.item.itemId, result.item);
                }
            });
            recipe.components.forEach((component: RecipeComponent) => {
                if (!knownItems.has(component.ingredient.itemId)) {
                    knownItems.set(component.ingredient.itemId, component.ingredient);
                }
            });
        });
        return Array.from(knownItems.values());
    }

    public static builder() {
        return new CraftingSystem.Builder();
    }

    get name(): string {
        return this._name;
    }

    public craft(actor: Actor, recipe: Recipe) {
        if (!this.componentsOwnedBy(actor, recipe)) {
            return;
        }
        this.consumeComponentsFrom(actor, recipe.components);
        let results: RecipeResult[] = this.fabricator.fabricate(recipe);
        this.addResultsTo(actor, results);
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

    get includedItems(): CraftingElement[] {
        return this._includedItems;
    }

    public supports(gameSystem: string) {
        if (!this._supportedGameSystems || this._supportedGameSystems.length == 0) {
            return true;
        }
        return this._supportedGameSystems.indexOf(gameSystem) > -1;
    }

    private componentsOwnedBy(actor: Actor, recipe: Recipe): boolean {
        let consumables = actor.data.items.filter(i => i.type == 'consumable');
        return recipe.components.every((component: RecipeComponent) => {
            console.log(component.ingredient.name);
            console.log(consumables);
        });
        return true;
    }

    private consumeComponentsFrom(actor: Actor, components: RecipeComponent[]) {
        let consumables = actor.data.items.filter(i => i.type == 'consumable');
        components.forEach((recipeComponent) => {
            console.log(recipeComponent.ingredient.name);
            console.log(consumables);
        });
    }

    private addResultsTo(actor: Actor, results: RecipeResult[]) {

    }
}

namespace CraftingSystem {
    export class Builder {
        public name: string;
        public compendiumPackKey: string;
        public fabricator: Fabricator;
        public supportedGameSystems: string[];
        public recipes: Recipe[];

        constructor() {
            this.supportedGameSystems = [];
            this.recipes = [];
        }

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

        public build() : CraftingSystem {
            return new CraftingSystem(this);
        }
    }
}

export { CraftingSystem };