import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import {Essence} from "../common/Essence";
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
import {PartDictionary, PartDictionaryJson, PartDictionaryLoader} from "./PartDictionary";
import {CraftingSystemDetails, CraftingSystemDetailsJson} from "./CraftingSystemDetails";

interface CraftingSystemJson {
    id: string,
    details: CraftingSystemDetailsJson,
    locked: boolean,
    enabled: boolean,
    parts: PartDictionaryJson
}

class CraftingSystem {

    private readonly _id: string;

    private _details: CraftingSystemDetails;

    private _enabled: boolean;
    private readonly _locked: boolean;

    private readonly _partDictionary: PartDictionary;
    private readonly _partDictionaryLoader: PartDictionaryLoader;

    private readonly _recipeCraftingCheck: CraftingCheck<Actor>;
    private readonly _alchemyCraftingCheck: CraftingCheck<Actor>;

    private readonly _alchemyAttemptFactory: AlchemyAttemptFactory;
    private readonly _craftingAttemptFactory: CraftingAttemptFactory;

    constructor({
        id,
        details,
        locked,
        craftingChecks = {
            recipe: new NoCraftingCheck(),
            alchemy: new NoCraftingCheck()
        },
        alchemyAttemptFactory = new DisabledAlchemyAttemptFactory(),
        craftingAttemptFactory,
        enabled,
        partDictionary,
        partDictionaryLoader
    }: {
        id: string;
        details: CraftingSystemDetails,
        locked: boolean;
        enabled: boolean;
        craftingChecks?: {
            recipe?: CraftingCheck<Actor>;
            alchemy?: CraftingCheck<Actor>;
        };
        alchemyAttemptFactory?: AlchemyAttemptFactory;
        craftingAttemptFactory: CraftingAttemptFactory;
        partDictionary: PartDictionary;
        partDictionaryLoader: PartDictionaryLoader;
    }) {
        this._id = id;
        this._details = details;
        this._locked = locked;
        this._alchemyCraftingCheck = craftingChecks.alchemy;
        this._recipeCraftingCheck = craftingChecks.recipe;
        this._craftingAttemptFactory = craftingAttemptFactory;
        this._alchemyAttemptFactory = alchemyAttemptFactory;
        this._enabled = enabled;
        this._partDictionary = partDictionary;
        this._partDictionaryLoader = partDictionaryLoader;
    }

    public setEnabled(value: boolean): CraftingSystem {
        this._enabled = value;
        return this;
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

    get details(): CraftingSystemDetails {
        return this._details;
    }

    get essences(): Essence[] {
        return this._partDictionary.getEssences();
    }

    get components(): CraftingComponent[] {
        return this._partDictionary.getComponents();
    }

    get recipes(): Recipe[] {
        return this._partDictionary.getRecipes();
    }

    get summary(): string {
        return this._details.summary;
    }

    get description(): string {
        return this._details.description;
    }

    get author(): string {
        return this._details.author;
    }

    getEssenceById(id: string) {
        return this._partDictionary.getEssence(id);
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
        return this._details.name;
    }

    get partDictionary(): PartDictionary {
        return this._partDictionary;
    }

    setDetails(value: CraftingSystemDetails): void {
        this._details = value;
    }

    public async loadPartDictionary() {
        await this._partDictionaryLoader.load(this._partDictionary);
    }

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

    toJson(): CraftingSystemJson {
        return {
            id: this._id,
            details: this._details.toJson(),
            enabled: this._enabled,
            locked: this._locked,
            parts: this._partDictionary.toJson()
        };
    }

}

export { CraftingSystem, CraftingSystemJson };