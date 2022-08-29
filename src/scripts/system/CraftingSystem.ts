import {Identifiable} from "../common/FabricateItem";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import {EssenceDefinition} from "../common/EssenceDefinition";
import {Inventory} from "../actor/Inventory";
import {Combination} from "../common/Combination";
import {GameSystem} from "./GameSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck, NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {CraftingAttempt} from "../crafting/attempt/CraftingAttempt";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {AlchemyAttempt} from "../crafting/alchemy/AlchemyAttempt";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";
import {AlchemyAttemptFactory, DisabledAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";
import {AlchemyFormula} from "../crafting/alchemy/AlchemyFormula";

class CraftingSystem implements Identifiable {
    private readonly _id: string;
    private readonly _gameSystem: GameSystem;
    private readonly _recipeCraftingCheck: CraftingCheck<Actor>;
    private readonly _alchemyCraftingCheck: CraftingCheck<Actor>;
    private readonly _partDictionary: PartDictionary;
    private readonly _essencesBySlug: Map<string, EssenceDefinition>;
    private readonly _alchemyAttemptFactory: AlchemyAttemptFactory;
    private readonly _craftingAttemptFactory: CraftingAttemptFactory;

    private _enabled: boolean;

    constructor({
        id,
        gameSystem,
        craftingChecks = {
            recipe: new NoCraftingCheck(),
            alchemy: new NoCraftingCheck()
        },
        partDictionary,
        essences,
        alchemyAttemptFactory,
        craftingAttemptFactory,
        enabled
    }: {
        id: string;
        gameSystem: GameSystem;
        craftingChecks?: {
            recipe?: CraftingCheck<Actor>;
            alchemy?: CraftingCheck<Actor>;
        };
        partDictionary: PartDictionary;
        essences: EssenceDefinition[],
        alchemyAttemptFactory?: AlchemyAttemptFactory;
        craftingAttemptFactory: CraftingAttemptFactory;
        enabled: boolean;
    }) {
        this._id = id;
        this._gameSystem = gameSystem;
        this._alchemyCraftingCheck = craftingChecks?.alchemy ?? new NoCraftingCheck();
        this._recipeCraftingCheck = craftingChecks?.recipe ?? new NoCraftingCheck();
        this._partDictionary = partDictionary;
        this._essencesBySlug = new Map(essences.map((essence: EssenceDefinition) => [essence.slug, essence]));
        this._craftingAttemptFactory = craftingAttemptFactory;
        this._alchemyAttemptFactory = alchemyAttemptFactory ?? new DisabledAlchemyAttemptFactory();
        this._enabled = enabled;
    }

    get alchemyFormulae(): Map<string, AlchemyFormula> {
        return this._alchemyAttemptFactory.formulaeByBasePartId;
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

    get hasRecipeCraftingCheck(): boolean {
        return this._recipeCraftingCheck !== null && !(this._recipeCraftingCheck instanceof NoCraftingCheck);
    }

    get hasAlchemyCraftingCheck(): boolean {
        return this._alchemyCraftingCheck !== null && !(this._alchemyCraftingCheck instanceof NoCraftingCheck);
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
    public async craft(actor: Actor, inventory: Inventory, recipe: Recipe): Promise<CraftingResult> {

        const craftingAttempt: CraftingAttempt = this._craftingAttemptFactory.make(inventory.ownedComponents, recipe);

        const craftingResult: CraftingResult = craftingAttempt.perform(actor, this._recipeCraftingCheck);

        await inventory.acceptCraftingResult(craftingResult);

        return craftingResult;

    }

    // todo implement
    public async doAlchemy(actor: Actor,
                           inventory: Inventory,
                           baseComponent: CraftingComponent,
                           componentSelection: Combination<CraftingComponent>): Promise<AlchemyResult> {

        const alchemyAttempt: AlchemyAttempt = this._alchemyAttemptFactory.make(baseComponent, componentSelection);

        const alchemyResult: AlchemyResult = alchemyAttempt.perform(actor, this._alchemyCraftingCheck);

        await inventory.acceptAlchemyResult(alchemyResult);

        return alchemyResult;

    }

    get gameSystem(): GameSystem {
        return this._gameSystem;
    }

    get recipes(): Recipe[] {
        return this._partDictionary.getRecipes();
    }

    get components(): CraftingComponent[] {
        return this._partDictionary.getComponents();
    }

    public getComponentByPartId(partId: string): CraftingComponent {
        return this._partDictionary.getComponent(partId, this.id);
    }

    getRecipeByPartId(partId: string): Recipe {
        return this._partDictionary.getRecipe(partId, this.id);
    }

}

export {CraftingSystem};