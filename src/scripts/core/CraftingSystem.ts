import {Fabricator} from "./Fabricator";
import {Recipe} from "./Recipe";
import {CraftingComponent} from "./CraftingComponent";
import {Inventory} from "../game/Inventory";
import {Ingredient} from "./Ingredient";
import {FabricationOutcome} from "./FabricationOutcome";

class EssenceDefinition {

    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string;
    private readonly _iconCode: string;

    constructor(name: string, description: string, iconCode?: string) {
        this._name = name;
        this._slug = name.toLowerCase().replace(' ', '-');
        this._description = description;
        this._iconCode = iconCode;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get iconCode(): string {
        return this._iconCode;
    }

    get icon(): string {
        if (this.iconCode) {
            return `<i class="fas fa-${this._iconCode}" title="${this.description}"></i>`;
        }
        return this.name;
    }

    get slug(): string {
        return this._slug;
    }
}

class CraftingSystem {
    private readonly _name: string;
    private readonly _compendiumPackKey: string;
    private readonly _fabricator: Fabricator;
    private readonly _recipesById: Map<string, Recipe> = new Map();
    private readonly _componentsById: Map<string, CraftingComponent> = new Map();
    private readonly _supportedGameSystems: string[] = [];
    private readonly _enableHint: string;
    private readonly _description: string;
    private readonly _essences: EssenceDefinition[] = [];

    private _enabled: boolean;

    constructor(builder: CraftingSystem.Builder) {
        this._name = builder.name;
        this._compendiumPackKey = builder.compendiumPackKey;
        this._fabricator = builder.fabricator;
        this._recipesById = builder.recipes;
        this._componentsById = builder.components;
        this._supportedGameSystems = builder.supportedGameSystems;
        this._enabled = builder.enabled;
        this._enableHint = builder.enableHint;
        this._description = builder.description;
        this._essences = builder.essences;
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

    get description(): string {
        return this._description;
    }

    get essences(): EssenceDefinition[] {
        return this._essences;
    }

    public async craft(actor: Actor, inventory: Inventory, recipe: Recipe): Promise<FabricationOutcome> {

        const missingIngredients: Ingredient[] = [];
        recipe.ingredients.forEach((ingredient: Ingredient) => {
            if (!inventory.containsIngredient(ingredient)) {
                missingIngredients.push(ingredient);
            }
        });
        if (missingIngredients.length > 0) {
            const missingIngredientMessage: string = missingIngredients.map((ingredient: Ingredient) => ingredient.quantity + ':' + ingredient.component.name).join(',');
            const errorMessage: string = `Unable to craft recipe ${recipe.name}. The following ingredients were missing: ${missingIngredientMessage}. `;
            ChatMessage.create({user: game.user, speaker: actor, content: errorMessage});
        }

        try {
            const fabricationOutcome: FabricationOutcome = await this.fabricator.fabricateFromRecipe(inventory, recipe);
            ChatMessage.create({user: game.user, speaker: actor, content: fabricationOutcome.describe()});
            return fabricationOutcome;
        } catch (err) {
            console.error(err);
            ChatMessage.create({user: game.user, speaker: actor, content: err});
        }

    }

    public async craftWithComponents(actor: Actor, inventory: Inventory, components: CraftingComponent[]): Promise<FabricationOutcome> {

        if (!inventory.hasAllComponents(components)) {
            const errorMessage: string = 'There are insufficient crafting components of the specified type in the inventory. ';
            ChatMessage.create({user: game.user, speaker: actor, content: errorMessage});
            return;
        }
        try {
            const fabricationOutcome: FabricationOutcome = await this.fabricator.fabricateFromComponents(inventory, components);
            ChatMessage.create({user: game.user, speaker: actor, content: fabricationOutcome.describe()});
            return fabricationOutcome;
        } catch (err) {
            console.error(err);
            ChatMessage.create({user: game.user, speaker: actor, content: err});
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
        return Array.from(this._recipesById.values());
    }

    get components(): CraftingComponent[] {
        return Array.from(this._componentsById.values());
    }

    public getComponentByPartId(entryId: string): CraftingComponent {
        return this._componentsById.get(entryId);
    }

    public supports(gameSystem: string): boolean {
        if (!this._supportedGameSystems || this._supportedGameSystems.length == 0) {
            return true;
        }
        return this._supportedGameSystems.indexOf(gameSystem) > -1;
    }

    getRecipeByPartId(partId: string): Recipe {
        return this._recipesById.get(partId);
    }
}

namespace CraftingSystem {

    export class Builder {

        public name!: string;
        public compendiumPackKey!: string;
        public fabricator!: Fabricator;
        public supportedGameSystems: string[] = [];
        public recipes: Map<string, Recipe> = new Map();
        public components: Map<string, CraftingComponent> = new Map();
        public enabled: boolean;
        public enableHint!: string;
        public description!: string;
        public essences: EssenceDefinition[] = [];

        public build() : CraftingSystem {
            return new CraftingSystem(this);
        }

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

        public withRecipes(value: Map<string, Recipe>): Builder {
            this.recipes = value;
            return this;
        }

        public withRecipe(value: Recipe): Builder {
            this.recipes.set(value.partId, value);
            return this;
        }

        public withComponent(value: CraftingComponent): Builder {
            this.components.set(value.partId, value);
            return this;
        }

        public withComponents(value: Map<string, CraftingComponent>): Builder {
            this.components = value;
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

        public withDescription(value: string): Builder {
            this.description = value;
            return this;
        }

        public withEssence(value: EssenceDefinition): Builder {
            this.essences.push(value);
            return this;
        }

        public withEssences(value: EssenceDefinition[]): Builder {
            this.essences = value;
            return this;
        }

    }
}

export {CraftingSystem, EssenceDefinition};