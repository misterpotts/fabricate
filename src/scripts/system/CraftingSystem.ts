import {Recipe, RecipeJson} from "../common/Recipe";
import {CraftingComponent, CraftingComponentJson} from "../common/CraftingComponent";
import {Essence, EssenceJson} from "../common/Essence";
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

    public hasPart(id: string): boolean {
        return this._partDictionary.hasComponent(id) || this._partDictionary.hasRecipe(id);
    }

    public hasEssence(id: string) {
        return this._partDictionary.hasEssence(id);
    }

    public get hasEssences() {
        return this._partDictionary.hasEssences();
    }

    public getEssences(): Essence[] {
        return this._partDictionary.getEssences();
    }

    public getEssenceById(id: string): Essence {
        return this._partDictionary.getEssence(id);
    }

    public deleteEssenceById(id: string): void {
        return this._partDictionary.deleteEssenceById(id);
    }

    public editEssence(essence: Essence): void {
        return this._partDictionary.insertEssence(essence);
    }

    public getComponents(): CraftingComponent[] {
        return this._partDictionary.getComponents();
    }

    public hasComponent(id: string) {
        return this._partDictionary.hasComponent(id);
    }

    public includesComponentByItemUuid(itemUuid: string) {
        return this._partDictionary.hasComponentUuid(itemUuid);
    }

    public includesRecipeByItemUuid(itemUuid: string) {
        return this._partDictionary.hasRecipeUuid(itemUuid);
    }

    public includesItemUuid(itemUuid: string) {
        return this.includesComponentByItemUuid(itemUuid) || this.includesRecipeByItemUuid(itemUuid);
    }

    public getComponentById(id: string): CraftingComponent {
        return this._partDictionary.getComponent(id);
    }

    public getComponentByItemUuid(uuid: string): CraftingComponent {
        return this._partDictionary.getComponentByItemUuid(uuid);
    }

    public getRecipeByItemUuid(uuid: string): Recipe {
        return this._partDictionary.getRecipeByItemUuid(uuid);
    }

    public deleteComponentById(id: string): void {
        return this._partDictionary.deleteComponentById(id);
    }

    public editComponent(component: CraftingComponent): void {
        return this._partDictionary.insertComponent(component);
    }

    public getRecipes(): Recipe[] {
        return this._partDictionary.getRecipes();
    }

    public hasRecipe(id: string) {
        return this._partDictionary.hasRecipe(id);
    }

    public getRecipeById(id: string): Recipe {
        return this._partDictionary.getRecipe(id);
    }

    public deleteRecipeById(id: string): void {
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

    public async reload(): Promise<void> {
        return this.loadPartDictionary();
    }

    public async loadPartDictionary(): Promise<void> {
        if (!this.isLoaded) {
            await this._partDictionary.loadAll();
        }
        await this._partDictionary.loadAll(this._partDictionary.toJson());
    }

    public async loadEssences(updatedSource?: Record<string, EssenceJson>): Promise<void> {
        await this._partDictionary.loadEssences(updatedSource);
    }

    public async loadComponents(updatedSource?: Record<string, CraftingComponentJson>): Promise<void> {
        await this._partDictionary.loadComponents(updatedSource);
    }

    public async loadRecipes(updatedSource?: Record<string, RecipeJson>): Promise<void> {
        await this._partDictionary.loadRecipes(updatedSource);
    }

    get isLoaded(): boolean {
        return this._partDictionary.isLoaded;
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

    get hasErrors(): boolean {
        return this._partDictionary.hasErrors;
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