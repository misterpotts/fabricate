import {Identifiable} from "../common/FabricateItem";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import { EssenceDefinition } from "../common/EssenceDefinition";
import {Inventory} from "../actor/Inventory";
import {Combination} from "../common/Combination";
import {GameSystem} from "./GameSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck} from "../crafting/check/CraftingCheck";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {CraftingAttempt} from "../crafting/attempt/CraftingAttempt";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {AlchemyAttempt} from "../crafting/alchemy/AlchemyAttempt";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";
import {AlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";

interface CraftingSystemConfig {
    id: string;
    gameSystem: GameSystem;
    craftingCheck: CraftingCheck<Actor>;
    partDictionary: PartDictionary;
    essences: EssenceDefinition[],
    alchemyAttemptFactory: AlchemyAttemptFactory;

    craftingAttemptFactory: CraftingAttemptFactory;
    enabled: boolean;
}

class CraftingSystem implements Identifiable {
    private readonly _id: string;
    private readonly _gameSystem: GameSystem;
    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _partDictionary: PartDictionary;
    private readonly _essencesBySlug: Map<string, EssenceDefinition>;
    private readonly _alchemyAttemptFactory: AlchemyAttemptFactory;
    private readonly _craftingAttemptFactory: CraftingAttemptFactory;

    private _enabled: boolean;

    constructor(config: CraftingSystemConfig) {
        this._id = config.id;
        this._gameSystem = config.gameSystem;
        this._craftingCheck = config.craftingCheck;
        this._partDictionary = config.partDictionary;
        this._essencesBySlug = new Map(config.essences.map((essence: EssenceDefinition) => [essence.slug, essence]));
        this._craftingAttemptFactory = config.craftingAttemptFactory;
        this._alchemyAttemptFactory = config.alchemyAttemptFactory;
        this._enabled = config.enabled;
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

    get hasCraftingCheck(): boolean {
        return this._craftingCheck !== null;
    }

    get supportsAlchemy() {
        return this._alchemyAttemptFactory.isEnabled();
    }

    get id(): string {
        return this._id;
    }

    /**
     * Attempts to craft a Recipe for the given Actor, modifying the given inventory to reflect the result.
     *
     * @param actor The Actor performing the Crafting Attempt
     * @param inventory The Inventory owned by the Actor
     * @param recipe The Recipe to attempt to craft
     *
     * @return a CraftingResult describing the outcome of the Crafting attempt
     *
     * The Crafting Result returned by this function is self-describing. Once obtained, it can be used to create and
     * send a Chat Message if required.
     *
     * @example
     * const craftingResult: CraftingResult = await craft(actor, inventory, recipe);
     * const craftingMessage: CraftingChatMessage = craftingResult.describe();
     * await chatDialog.send(actor.id, craftingMessage);
     * */
    public async craft(actor: Actor, inventory: Inventory<{}, Actor>, recipe: Recipe): Promise<CraftingResult> {

        const craftingAttempt: CraftingAttempt = this._craftingAttemptFactory.make(inventory.ownedComponents, recipe);

        const craftingResult: CraftingResult = craftingAttempt.perform(actor, this._craftingCheck);

        await inventory.acceptCraftingResult(craftingResult);

        return craftingResult;

    }

    // todo implement
    public async doAlchemy(actor: Actor,
                           inventory: Inventory<{}, Actor>,
                           baseComponent: CraftingComponent,
                           componentSelection: Combination<CraftingComponent>): Promise<AlchemyResult> {

        const alchemyAttempt: AlchemyAttempt = this._alchemyAttemptFactory.make(baseComponent, componentSelection);

        const alchemyResult: AlchemyResult = alchemyAttempt.perform(actor, this._craftingCheck);

        await inventory.acceptAlchemyResult(alchemyResult);

        return alchemyResult;

    }

    get gameSystem(): GameSystem {
        return this._gameSystem;
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
        return this._gameSystem.includes(gameSystem);
    }

    getRecipeByPartId(partId: string): Recipe {
        return this._partDictionary.getRecipe(partId, this.id);
    }

}

export {CraftingSystem, CraftingSystemConfig};