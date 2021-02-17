import {Fabricator} from "./Fabricator";
import {Recipe} from "./Recipe";
import {CraftingComponent} from "./CraftingComponent";
import {Inventory} from "../game/Inventory";
import {Ingredient} from "./Ingredient";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";
import {InventoryRegistry} from "../registries/InventoryRegistry";

class CraftingSystem {
    private readonly _name: string;
    private readonly _compendiumPackKey: string;
    private readonly _fabricator: Fabricator;
    private readonly _recipes: Recipe[];
    private readonly _componentsById: Map<string, CraftingComponent>;
    private readonly _supportedGameSystems: string[];
    private _enabled: boolean;
    private readonly _enableHint: string;

    constructor(builder: CraftingSystem.Builder) {
        this._name = builder.name;
        this._compendiumPackKey = builder.compendiumPackKey;
        this._fabricator = builder.fabricator;
        this._recipes = builder.recipes;
        this._componentsById = new Map(builder.components.map((component: CraftingComponent) => [component.compendiumEntry.entryId, component]));
        this._supportedGameSystems = builder.supportedGameSystems;
        this._enabled = builder.enabled;
        this._enableHint = builder.enableHint;
    }

    public static builder() {
        return new CraftingSystem.Builder();
    }

    get name(): string {
        return this._name;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get enableHint(): string {
        return this._enableHint;
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
        const craftingResults: CraftingResult[] = fabricator.fabricateFromRecipe(recipe, inventory.denormalizedContents());

        await this.applyResults(craftingResults, inventory);
        return craftingResults;
    }

    public async craftWithComponents(actorId: string, components: CraftingComponent[]): Promise<CraftingResult[]> {
        const inventory: Inventory = InventoryRegistry.getFor(actorId);

        if (!inventory.hasAll(components)) {
            throw new Error(`There are insufficient crafting components of the specified type in the inventory of Actor ID ${actorId}`);
        }

        const craftingResults: CraftingResult[] = this.fabricator.fabricateFromComponents(components);
        await this.applyResults(craftingResults, inventory);
        return craftingResults;
    }

    private async applyResults(craftingResults: CraftingResult[], inventory: Inventory) {
        for (const craftingResult of craftingResults) {
            switch (craftingResult.action) {
                case ActionType.ADD:
                    if (craftingResult.customData) {
                        await inventory.add(craftingResult.item, craftingResult.quantity, craftingResult.customData);
                    } else {
                        await inventory.add(craftingResult.item, craftingResult.quantity);
                    }
                    break;
                case ActionType.REMOVE:
                    await inventory.remove(craftingResult.item, craftingResult.quantity);
                    break;
                default:
                    throw new Error(`The Crafting Action Type ${craftingResult.action} is not supported. Allowable 
                        values are: ADD, REMOVE. `);
            }
        }
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
        return Array.from(this._componentsById.values());
    }

    getComponentByEntryId(entryId: string): CraftingComponent {
        return this._componentsById.get(entryId);
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
        public enabled: boolean;
        public enableHint: string;

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        public withCompendiumPackKey(value: string): Builder {
            this.compendiumPackKey = value;
            return this;
        }

        public withFabricator(value: Fabricator): Builder {
            this.fabricator = value;
            return this;
        }

        public withSupportedGameSystems(value: string[]): Builder {
            this.supportedGameSystems = value;
            return this;
        }

        public withSupportedGameSystem(value: string): Builder {
            this.supportedGameSystems.push(value);
            return this;
        }

        public withRecipes(value: Recipe[]): Builder {
            this.recipes = value;
            return this;
        }

        public withRecipe(value: Recipe): Builder {
            this.recipes.push(value);
            return this;
        }

        public withComponents(value: CraftingComponent[]): Builder {
            this.components = value;
            return this;
        }

        public withComponent(value: CraftingComponent): Builder {
            this.components.push(value);
            return this;
        }

        public isEnabled(value: boolean): Builder {
            this.enabled = value;
            return this;
        }

        public withEnableHint(value: string): Builder {
            this.enableHint = value;
            return this;
        }

        public build() : CraftingSystem {
            return new CraftingSystem(this);
        }
    }
}

export { CraftingSystem };