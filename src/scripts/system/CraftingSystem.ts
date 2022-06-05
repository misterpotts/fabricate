import {Identifiable} from "../common/FabricateItem";
import {Fabricator} from "../core/Fabricator";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import { EssenceDefinition } from "../common/EssenceDefinition";
import {Inventory} from "../actor/Inventory";
import {FabricationOutcome} from "../core/FabricationOutcome";
import {Combination} from "../common/Combination";
import {GameSystem} from "./GameSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck} from "../crafting/check/CraftingCheck";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {CraftingAttempt} from "../crafting/attempt/CraftingAttempt";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {CraftingMessage} from "../interface/CraftingMessage";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/DefaultComponentSelectionStrategy";

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

    public async craft(actor: Actor, inventory: Inventory<{}, Actor>, recipe: Recipe): Promise<CraftingResult> {

        const craftingAttemptFactory: CraftingAttemptFactory = new CraftingAttemptFactory({
            selectionStrategy: new DefaultComponentSelectionStrategy(),
            availableComponents: inventory.ownedComponents,
            recipe: recipe,
            craftingCheck: this._craftingCheck,
            actor: actor
        });

        const craftingAttempt: CraftingAttempt = craftingAttemptFactory.make();

        const craftingResult: CraftingResult = craftingAttempt.perform();

        await inventory.accept(craftingResult);

        const craftingMessage: CraftingMessage = craftingResult.describe();

        await craftingMessage.send(actor.id);

        return craftingResult;

    }

    // @ts-ignore
    // todo implement
    public async doAlchemy(actor: Actor, inventory: Inventory<{}, Actor>, baseComponent: CraftingComponent, components: Combination<CraftingComponent>): Promise<FabricationOutcome> {

        /*const fabricationOutcome: FabricationOutcome = await this.fabricator.performAlchemy(baseComponent, components, actor, inventory);
        const message: CraftingChatMessage = CraftingChatMessage.fromFabricationOutcome(fabricationOutcome);
        const messageTemplate: string = await renderTemplate(Properties.module.templates.craftingMessage, message);
        await ChatMessage.create({user: game.user, speaker: {actor: actor._id}, content: messageTemplate});
        return fabricationOutcome;*/

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