import {Identifiable} from "../common/FabricateItem";
import {Fabricator} from "../core/Fabricator";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import { EssenceDefinition } from "../common/EssenceDefinition";
import {Inventory} from "../actor/Inventory";
import {FabricationOutcome} from "../core/FabricationOutcome";
import {CraftingChatMessage} from "../interface/CraftingChatMessage";
import Properties from "../Properties";
import {Combination} from "../common/Combination";
import {CraftingError} from "../error/CraftingError";
import {GameSystem} from "./GameSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck} from "../crafting/CraftingCheck";

interface CraftingSystemConfig {
    partDictionary: PartDictionary;
    essences: EssenceDefinition[],
    enabled: boolean;
    fabricator: Fabricator<{}, Actor>;
    craftingCheck: CraftingCheck<Actor>;
    supportedGameSystems: GameSystem[];
    id: string;
}

class CraftingSystem implements Identifiable {
    private readonly _essencesBySlug: Map<string, EssenceDefinition>;
    private readonly _partDictionary: PartDictionary;
    private readonly _fabricator: Fabricator<{}, Actor>;
    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _supportedGameSystems: GameSystem[];
    private readonly _id: string;

    private _enabled: boolean = false;
    private _craftingCheckEnabled: boolean = false;

    constructor(config: CraftingSystemConfig) {
        this._essencesBySlug = new Map(config.essences.map((essence: EssenceDefinition) => [essence.slug, essence]));
        this._partDictionary = config.partDictionary;
        this._fabricator = config.fabricator;
        this._enabled = config.enabled;
        this._craftingCheck = config.craftingCheck;
        this._supportedGameSystems = config.supportedGameSystems;
        this._id = config.id;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get essences(): EssenceDefinition[] {
        return Array.from(this._essencesBySlug.values());
    }

    getEssenceBySlug(slug: string) {
        return this._essencesBySlug.get(slug);
    }

    get isCraftingCheckEnabled(): boolean {
        return this._craftingCheckEnabled;
    }

    get hasCraftingCheck(): boolean {
        return this._craftingCheck !== null;
    }

    get supportsAlchemy() {
        return !!this._fabricator.supportsAlchemy;
    }

    get id(): string {
        return this._id;
    }

    public async craft(actor: Actor, inventory: Inventory<{}, Actor>, recipe: Recipe): Promise<FabricationOutcome> {
        // use a component selector to get an ingredient selection
        // check that the ingredient selection is present in the inventory before proceeding
        // create a crafting attempt (interface) with an ingredient selection (simple crafting attempt) or with an ingredient selection and a crafting check (checked crafting attempt)
        // get a successful or failed crafting result (interface) from the crafting attempt
        // apply the result to the inventory
        // create a chat message from the crafting result and post it
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

    get fabricator(): Fabricator<{}, Actor> {
        return this._fabricator;
    }

    get supportedGameSystems(): GameSystem[] {
        return this._supportedGameSystems;
    }

    get recipes(): Recipe[] {
        return this._partDictionary.getRecipes()
    }

    get components(): CraftingComponent[] {
        return this._partDictionary.getComponents();
    }

    public getComponentByPartId(partId: string): CraftingComponent {
        return this._partDictionary.getComponent(partId, this.id);
    }

    public supports(gameSystem: GameSystem): boolean {
        return this._supportedGameSystems.includes(gameSystem);
    }

    getRecipeByPartId(partId: string): Recipe {
        return this._partDictionary.getRecipe(partId, this.id);
    }

}

export {CraftingSystem, CraftingSystemConfig};