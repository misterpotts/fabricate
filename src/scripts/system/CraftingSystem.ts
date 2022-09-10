import {Identifiable} from "../common/FabricateItem";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import {Essence, EssenceDefinition} from "../common/Essence";
import {Inventory} from "../actor/Inventory";
import {Combination} from "../common/Combination";
import {CraftingCheck, NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {CraftingAttempt} from "../crafting/attempt/CraftingAttempt";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {AlchemyAttempt} from "../crafting/alchemy/AlchemyAttempt";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";
import {AlchemyAttemptFactory, DisabledAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";
import {AlchemyFormula} from "../crafting/alchemy/AlchemyFormula";
import {CraftingSystemDefinition} from "../system_definitions/CraftingSystemDefinition";
import {PartDictionary} from "./PartDictionary";

interface CraftingSystemMutation {
    author?: string;
    name?: string;
    summary?: string;
    description?: string;
    enabled?: boolean;
    essences?: Essence[];
    alchemyCraftingCheck?: CraftingCheck<Actor>;
    recipeCraftingCheck?: CraftingCheck<Actor>;
}

class CraftingSystem implements Identifiable {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _summary: string;
    private readonly _description: string;
    private readonly _author: string;

    private readonly _enabled: boolean;
    private readonly _locked: boolean;

    private readonly _essencesById: Map<string, Essence>;
    private readonly _partDictionary: PartDictionary;

    private readonly _recipeCraftingCheck: CraftingCheck<Actor>;
    private readonly _alchemyCraftingCheck: CraftingCheck<Actor>;

    private readonly _alchemyAttemptFactory: AlchemyAttemptFactory;
    private readonly _craftingAttemptFactory: CraftingAttemptFactory;


    constructor({
        id,
        name,
        summary,
        description,
        author,
        locked,
        craftingChecks = {
            recipe: new NoCraftingCheck(),
            alchemy: new NoCraftingCheck()
        },
        essences,
        alchemyAttemptFactory,
        craftingAttemptFactory,
        enabled,
        partDictionary
    }: {
        id: string;
        name: string;
        summary: string;
        description: string;
        author: string;
        locked: boolean;
        craftingChecks?: {
            recipe?: CraftingCheck<Actor>;
            alchemy?: CraftingCheck<Actor>;
        };
        essences: Essence[];
        alchemyAttemptFactory?: AlchemyAttemptFactory;
        craftingAttemptFactory: CraftingAttemptFactory;
        enabled: boolean;
        partDictionary: PartDictionary;
    }) {
        this._id = id;
        this._name = name;
        this._summary = summary;
        this._description = description;
        this._author = author;
        this._locked = locked;
        this._alchemyCraftingCheck = craftingChecks?.alchemy ?? new NoCraftingCheck();
        this._recipeCraftingCheck = craftingChecks?.recipe ?? new NoCraftingCheck();
        this._essencesById = new Map(essences.map((essence: Essence) => [essence.id, essence]));
        this._craftingAttemptFactory = craftingAttemptFactory;
        this._alchemyAttemptFactory = alchemyAttemptFactory ?? new DisabledAlchemyAttemptFactory();
        this._enabled = enabled;
        this._partDictionary = partDictionary;
    }

    public mutate(craftingSystemMutation: CraftingSystemMutation): CraftingSystem {
        if (this._locked) {
            throw new Error(`${this._name} is locked and cannot be edited. `);
        }
        return new CraftingSystem({
            id: this._id,
            locked: this._locked,
            alchemyAttemptFactory: this._alchemyAttemptFactory,
            craftingAttemptFactory: this._craftingAttemptFactory,
            partDictionary: this._partDictionary,
            name: craftingSystemMutation.name ?? this._name,
            summary: craftingSystemMutation.summary ?? this._summary,
            description: craftingSystemMutation.description ?? this._description,
            enabled: craftingSystemMutation.enabled ?? this.enabled,
            author: craftingSystemMutation.author ?? this._author,
            essences: craftingSystemMutation.essences ?? this.essences,
            craftingChecks: {
                recipe: craftingSystemMutation.recipeCraftingCheck ?? this._recipeCraftingCheck,
                alchemy: craftingSystemMutation.alchemyCraftingCheck ?? this._alchemyCraftingCheck
            },
        });
    }

    get locked(): boolean {
        return this._locked;
    }

    get alchemyFormulae(): Map<string, AlchemyFormula> {
        return this._alchemyAttemptFactory.formulaeByBasePartId;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    get essences(): Essence[] {
        return Array.from(this._essencesById.values());
    }


    get summary(): string {
        return this._summary;
    }

    get description(): string {
        return this._description;
    }

    get author(): string {
        return this._author;
    }

    getEssenceById(id: string) {
        return this._essencesById.get(id);
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

    get name(): string {
        return this._name;
    }

    get partDictionary(): PartDictionary {
        return this._partDictionary;
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

    toSystemDefinition(): CraftingSystemDefinition {
        const essences: Record<string, EssenceDefinition> = {};
        this._essencesById.forEach((essence) => essences[essence.id] = essence.toEssenceDefinition());
        return {
            id: this._id,
            name: this._name,
            summary: this._summary,
            description: this._description,
            enabled: this.enabled,
            locked: this._locked,
            alchemy: this._alchemyAttemptFactory.toAlchemyDefinition(),
            checks: {
                alchemy: this._alchemyCraftingCheck.toCheckDefinition(),
                hasCustomAlchemyCheck: true,
                recipe: this._recipeCraftingCheck.toCheckDefinition(),
                enabled: true
            },
            essences: essences,
            author: this._author,
            componentIds: this._partDictionary.getComponents().map(component => component.partId),
            recipeIds: this._partDictionary.getRecipes().map(recipe => recipe.partId),
            compendiumIds: this._partDictionary.getCompendiumIds()
        };
    }
}

export {CraftingSystem};