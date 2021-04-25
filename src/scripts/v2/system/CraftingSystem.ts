import {Identifiable} from "../common/FabricateItem";
import {Fabricator} from "../core/Fabricator";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import { EssenceDefinition } from "../common/EssenceDefinition";
import {CraftingCheck} from "../crafting/CraftingCheck";
import {Inventory} from "../actor/Inventory";
import {FabricationOutcome} from "../core/FabricationOutcome";
import {CraftingChatMessage} from "../interface/CraftingChatMessage";
import Properties from "../../Properties";
import {Combination} from "../common/Combination";
import {CraftingError} from "../error/CraftingError";

class CraftingSystem implements Identifiable {
    private readonly _name: string;
    private readonly _compendiumPackKey: string;
    private readonly _fabricator: Fabricator<{}, Actor>;
    private readonly _recipesById: Map<string, Recipe> = new Map();
    private readonly _componentsById: Map<string, CraftingComponent> = new Map();
    private readonly _supportedGameSystems: string[] = [];
    private readonly _enableHint: string;
    private readonly _description: string;
    private readonly _essences: EssenceDefinition[] = [];
    private readonly _essencesBySlug: Map<string, EssenceDefinition> = new Map();
    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _hasCraftingCheck: boolean;

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
        this._essencesBySlug = new Map(builder.essences.map((essence: EssenceDefinition) => [essence.slug, essence]));
        this._craftingCheck = builder.craftingCheck;
        this._hasCraftingCheck = !!this._craftingCheck;
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

    get craftingCheck(): CraftingCheck<Actor> {
        return this._craftingCheck;
    }

    get hasCraftingCheck(): boolean {
        return this._hasCraftingCheck;
    }

    get supportsAlchemy() {
        return !!this._fabricator.supportsAlchemy;
    }

    get id(): string {
        return this.compendiumPackKey;
    }

    public async craft(actor: Actor, inventory: Inventory<{}, Actor>, recipe: Recipe): Promise<FabricationOutcome> {
        try {
            const fabricationOutcome: FabricationOutcome = await this.fabricator.followRecipe(actor, inventory, recipe);
            const message: CraftingChatMessage = CraftingChatMessage.fromFabricationOutcome(fabricationOutcome);
            const messageTemplate = await renderTemplate(Properties.module.templates.craftingMessage, message);
            await ChatMessage.create({user: game.user, speaker: {actor: actor._id}, content: messageTemplate});
            return fabricationOutcome;
        } catch (error) {
            await this.handleCraftingError(error, actor);
        }
    }

    public async doAlchemy(actor: Actor, inventory: Inventory<{}, Actor>, baseComponent: CraftingComponent, components: Combination<CraftingComponent>): Promise<FabricationOutcome> {
        try {
            const fabricationOutcome: FabricationOutcome = await this.fabricator.performAlchemy(baseComponent, components, actor, inventory);
            const message: CraftingChatMessage = CraftingChatMessage.fromFabricationOutcome(fabricationOutcome);
            const messageTemplate: string = await renderTemplate(Properties.module.templates.craftingMessage, message);
            await ChatMessage.create({user: game.user, speaker: {actor: actor._id}, content: messageTemplate});
            return fabricationOutcome;
        } catch (error) {
            await this.handleCraftingError(error, actor);
        }
    }

    private async handleCraftingError(error: Error, actor: Actor): Promise<void> {
        let messageTemplate: string;
        if (error instanceof CraftingError) {
            const message: CraftingChatMessage = CraftingChatMessage.fromFabricationError(error);
            messageTemplate = await renderTemplate(Properties.module.templates.craftingMessage, message);
        } else {
            const message: CraftingChatMessage = CraftingChatMessage.fromUnexpectedError(error);
            messageTemplate = await renderTemplate(Properties.module.templates.craftingMessage, message);
            console.error(error);
        }
        await ChatMessage.create({user: game.user, speaker: {actor: actor._id}, content: messageTemplate});
    }

    get compendiumPackKey(): string {
        return this._compendiumPackKey;
    }

    get fabricator(): Fabricator<{}, Actor> {
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
        public fabricator!: Fabricator<{}, Actor>;
        public supportedGameSystems: string[] = [];
        public recipes: Map<string, Recipe> = new Map();
        public components: Map<string, CraftingComponent> = new Map();
        public enabled: boolean;
        public enableHint!: string;
        public description!: string;
        public essences: EssenceDefinition[] = [];
        public craftingCheck: CraftingCheck<Actor>;

        public build() : CraftingSystem{
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

        public withFabricator(value: Fabricator<{}, Actor>): Builder {
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

        withCraftingCheck(value: CraftingCheck<Actor>) {
            this.craftingCheck = value;
            return this;
        }
    }
}

export {CraftingSystem, EssenceDefinition};