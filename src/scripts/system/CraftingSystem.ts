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
import {PartDictionary, PartDictionaryJson} from "./PartDictionary";
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
    private readonly _isLocked: boolean;

    private readonly _partDictionary: PartDictionary;

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
        partDictionary
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
    }) {
        this._id = id;
        this._details = details;
        this._isLocked = locked;
        this._alchemyCraftingCheck = craftingChecks.alchemy;
        this._recipeCraftingCheck = craftingChecks.recipe;
        this._craftingAttemptFactory = craftingAttemptFactory;
        this._alchemyAttemptFactory = alchemyAttemptFactory;
        this._enabled = enabled;
        this._partDictionary = partDictionary;
    }

    public enable(): void {
        this._enabled = true;
    }

    public disable(): void {
        this._enabled = false;
    }

    get isLocked(): boolean {
        return this._isLocked;
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

    public hasPart(itemUuid: string): boolean {
        return this._partDictionary.hasComponent(itemUuid) || this._partDictionary.hasRecipe(itemUuid);
    }

    public hasEssence(id: string) {
        return this._partDictionary.hasEssence(id);
    }

    public get hasEssences() {
        return this._partDictionary.hasEssences();
    }

    public async getEssences(): Promise<Essence[]> {
        return await this._partDictionary.getEssences();
    }

    public async getEssenceById(id: string): Promise<Essence> {
        return await this._partDictionary.getEssence(id);
    }

    public deleteEssenceById(id: string): Promise<void> {
        return this._partDictionary.deleteEssenceById(id);
    }

    public async editEssence(essence: Essence): Promise<void> {
        return this._partDictionary.insertEssence(essence);
    }

    public async getComponents(): Promise<CraftingComponent[]> {
        return await this._partDictionary.getComponents();
    }

    public hasComponent(id: string) {
        return this._partDictionary.hasComponent(id);
    }

    public async getComponentById(id: string): Promise<CraftingComponent> {
        return await this._partDictionary.getComponent(id);
    }

    public deleteComponentById(id: string): Promise<void> {
        return this._partDictionary.deleteComponentById(id);
    }

    public async editComponent(component: CraftingComponent): Promise<void> {
        return this._partDictionary.insertComponent(component);
    }

    public async getRecipes(): Promise<Recipe[]> {
        return await this._partDictionary.getRecipes();
    }

    public hasRecipe(id: string) {
        return this._partDictionary.hasRecipe(id);
    }

    public async getRecipeById(id: string): Promise<Recipe> {
        return await this._partDictionary.getRecipe(id);
    }

    public deleteRecipeById(id: string): Promise<void> {
        return this._partDictionary.deleteRecipeById(id);
    }

    public async editRecipe(recipe: Recipe): Promise<void> {
        return this._partDictionary.insertRecipe(recipe);
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

    set details(value: CraftingSystemDetails) {
        this._details = value;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    public async loadPartDictionary(): Promise<void> {
        await this._partDictionary.loadAll();
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
            locked: this._isLocked,
            parts: this._partDictionary.toJson()
        };
    }

    clone({id, name, locked}: { name: string; id: string; locked: boolean }) {
        return new CraftingSystem({
            id,
            details: new CraftingSystemDetails({
                name,
                summary: this._details.summary,
                description: this._details.description,
                author: this._details.author,
            }),
            alchemyAttemptFactory:this._alchemyAttemptFactory,
            craftingAttemptFactory:this._craftingAttemptFactory,
            craftingChecks: {
                alchemy: this._alchemyCraftingCheck,
                recipe: this._recipeCraftingCheck
            },
            locked,
            enabled: this._enabled,
            partDictionary: this._partDictionary.clone()
        });
    }
}

export { CraftingSystem, CraftingSystemJson };