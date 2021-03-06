import {Fabricator} from "./Fabricator";
import {Recipe} from "./Recipe";
import {CraftingComponent} from "./CraftingComponent";
import {Inventory} from "../game/Inventory";
import {FabricationOutcome} from "./FabricationOutcome";
import {CraftingChatMessage} from "../interface/CraftingChatMessage";
import Properties from "../Properties";
import {CraftingError} from "../error/CraftingError";

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
    private readonly _fabricator: Fabricator<Item.Data>;
    private readonly _recipesById: Map<string, Recipe> = new Map();
    private readonly _componentsById: Map<string, CraftingComponent> = new Map();
    private readonly _supportedGameSystems: string[] = [];
    private readonly _enableHint: string;
    private readonly _description: string;
    private readonly _essences: EssenceDefinition[] = [];
    private readonly _essencesBySlug: Map<string, EssenceDefinition> = new Map();

    private _enabled: boolean;

    constructor(builder: CraftingSystem.Builder<Item.Data>) {
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
        this._essencesBySlug = new Map(builder.essences.map((essence: EssenceDefinition) => [essence.slug, essence]));
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

    getEssenceBySlug(slug: string) {
        return this._essencesBySlug.get(slug);
    }

    public async craft(actor: Actor, inventory: Inventory<Item.Data>, recipe: Recipe): Promise<FabricationOutcome> {
        let chatMessage: HTMLElement;
        try {
            const fabricationOutcome: FabricationOutcome = await this.fabricator.fabricateFromRecipe(inventory, recipe);
            const message: CraftingChatMessage = CraftingChatMessage.fromFabricationOutcome(fabricationOutcome);
            chatMessage = await renderTemplate(Properties.module.templates.craftingMessage, message);
            ChatMessage.create({user: game.user, speaker: actor, content: chatMessage});
            return fabricationOutcome;
        } catch (err) {
            if (err instanceof CraftingError) {
                const message: CraftingChatMessage = CraftingChatMessage.fromFabricationError(err);
                chatMessage = await renderTemplate(Properties.module.templates.craftingMessage, message);
            } else {
                const message: CraftingChatMessage = CraftingChatMessage.fromUnexpectedError(err);
                chatMessage = await renderTemplate(Properties.module.templates.craftingMessage, message);
                console.error(err);
            }
            ChatMessage.create({user: game.user, speaker: actor, content: chatMessage});
        }
    }

    public async craftWithComponents(actor: Actor, inventory: Inventory<Item.Data>, components: CraftingComponent[]): Promise<FabricationOutcome> {
        let chatMessage: HTMLElement;
        try {
            const fabricationOutcome: FabricationOutcome = await this.fabricator.fabricateFromComponents(inventory, components);
            const message: CraftingChatMessage = CraftingChatMessage.fromFabricationOutcome(fabricationOutcome);
            chatMessage = await renderTemplate(Properties.module.templates.craftingMessage, message);
            ChatMessage.create({user: game.user, speaker: actor, content: chatMessage});
            return fabricationOutcome;
        } catch (err) {
            if (err instanceof CraftingError) {
                const message: CraftingChatMessage = CraftingChatMessage.fromFabricationError(err);
                chatMessage = await renderTemplate(Properties.module.templates.craftingMessage, message);
            } else {
                const message: CraftingChatMessage = CraftingChatMessage.fromUnexpectedError(err);
                chatMessage = await renderTemplate(Properties.module.templates.craftingMessage, message);
                console.error(err);
            }
            ChatMessage.create({user: game.user, speaker: actor, content: chatMessage});
        }
    }

    get compendiumPackKey(): string {
        return this._compendiumPackKey;
    }

    get fabricator(): Fabricator<Item.Data> {
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

    export class Builder<T extends Item.Data> {

        public name!: string;
        public compendiumPackKey!: string;
        public fabricator!: Fabricator<T>;
        public supportedGameSystems: string[] = [];
        public recipes: Map<string, Recipe> = new Map();
        public components: Map<string, CraftingComponent> = new Map();
        public enabled: boolean;
        public enableHint!: string;
        public description!: string;
        public essences: EssenceDefinition[] = [];

        public build() : CraftingSystem{
            return new CraftingSystem(this);
        }

        public withName(value: string): Builder<T> {
            this.name = value;
            return this;
        }

        public withCompendiumPackKey(value: string): Builder<T> {
            this.compendiumPackKey = value;
            return this;
        }

        public withFabricator(value: Fabricator<T>): Builder<T> {
            this.fabricator = value;
            return this;
        }

        public withSupportedGameSystems(value: string[]): Builder<T> {
            this.supportedGameSystems = value;
            return this;
        }

        public withSupportedGameSystem(value: string): Builder<T> {
            this.supportedGameSystems.push(value);
            return this;
        }

        public withRecipes(value: Map<string, Recipe>): Builder<T> {
            this.recipes = value;
            return this;
        }

        public withRecipe(value: Recipe): Builder<T> {
            this.recipes.set(value.partId, value);
            return this;
        }

        public withComponent(value: CraftingComponent): Builder<T> {
            this.components.set(value.partId, value);
            return this;
        }

        public withComponents(value: Map<string, CraftingComponent>): Builder<T> {
            this.components = value;
            return this;
        }

        public isEnabled(value: boolean): Builder<T> {
            this.enabled = value;
            return this;
        }

        public withEnableHint(value: string): Builder<T> {
            this.enableHint = value;
            return this;
        }

        public withDescription(value: string): Builder<T> {
            this.description = value;
            return this;
        }

        public withEssence(value: EssenceDefinition): Builder<T> {
            this.essences.push(value);
            return this;
        }

        public withEssences(value: EssenceDefinition[]): Builder<T> {
            this.essences = value;
            return this;
        }

    }
}

export {CraftingSystem, EssenceDefinition};