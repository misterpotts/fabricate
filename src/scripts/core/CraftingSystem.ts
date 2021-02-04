import {Fabricator} from "./Fabricator";
import {Recipe} from "./Recipe";
import {CraftingComponent} from "./CraftingComponent";
import {Inventory} from "./Inventory";
import {Ingredient} from "./Ingredient";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";
import {InventoryRecord} from "./InventoryRecord";
import {InventoryRegistry} from "../systems/InventoryRegistry";

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

    get name(): string {
        return this._name;
    }

    public async craft(actorId: string, recipeId: string): Promise<CraftingResult[]> {
        const inventory: Inventory = InventoryRegistry.getFor(actorId);
        const recipe: Recipe = this._recipes.find((recipe: Recipe) => recipe.entryId == recipeId);

        const missingIngredients: Ingredient[] = [];
        recipe.ingredients.forEach((ingredient: Ingredient) => {
            if (!inventory.contains(ingredient)) {
                missingIngredients.push(ingredient);
            }
        });
        if (missingIngredients.length > 0) {
            const message = missingIngredients.map((ingredient: Ingredient) => ingredient.quantity + ':' + ingredient.componentType.name).join(',');
            throw new Error(`Unable to craft recipe ${recipe.name}. The following ingredients were missing: ${message}`);
        }

        const fabricator: Fabricator = this.fabricator;
        const craftingResults: CraftingResult[] = fabricator.fabricateFromRecipe(recipe);
        const inventoryActions: Promise<InventoryRecord|boolean>[] = [];
        craftingResults.forEach((craftingResult: CraftingResult) => {
            switch (craftingResult.action) {
                case ActionType.ADD:
                    const add = inventory.add(craftingResult.item, craftingResult.quantity);
                    inventoryActions.push(add);
                    break;
                case ActionType.REMOVE:
                    const remove = inventory.remove(craftingResult.item, craftingResult.quantity);
                    inventoryActions.push(remove);
                    break;
                default:
                    throw new Error(`The Crafting Action Type ${craftingResult.action} is not supported. Allowable 
                    values are: ADD, REMOVE. `);
            }
        });
        await Promise.all(inventoryActions);
        return craftingResults;
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