import {Recipe, RecipeJson} from "../common/Recipe";
import {CraftingComponent, CraftingComponentJson} from "../common/CraftingComponent";
import {Essence, EssenceJson} from "../common/Essence";
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

    constructor({
        id,
        details,
        locked,
        enabled,
        partDictionary
    }: {
        id: string;
        details: CraftingSystemDetails,
        locked: boolean;
        enabled: boolean;
        partDictionary: PartDictionary;
    }) {
        this._id = id;
        this._details = details;
        this._isLocked = locked;
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

    get recipes(): Recipe[] {
        return this._partDictionary.getRecipes();
    }

    get craftingComponents(): CraftingComponent[] {
        return this._partDictionary.getComponents();
    }

    get craftingComponentsByItemUuid(): Map<string, CraftingComponent> {
        return this._partDictionary.componentsByUuid;
    }

    get essences(): Essence[] {
        return this._partDictionary.getEssences();
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

    public editRecipe(recipe: Recipe): void {
        return this._partDictionary.insertRecipe(recipe);
    }

    public async createRecipe(recipeJson: RecipeJson): Promise<Recipe> {
        return this._partDictionary.createRecipe(recipeJson);
    }

    public async createComponent(craftingComponentJson: CraftingComponentJson): Promise<CraftingComponent> {
        return this._partDictionary.createComponent(craftingComponentJson);
    }

    public async createEssence(essenceJson: EssenceJson): Promise<Essence> {
        return this._partDictionary.createEssence(essenceJson);
    }

    get summary(): string {
        return this._details.summary;
    }

    set summary(value: string) {
        this.details.summary = value;
    }

    get description(): string {
        return this._details.description;
    }

    set description(value: string) {
        this.details.description = value;
    }

    get author(): string {
        return this._details.author;
    }

    set author(value: string) {
        this.details.author = value;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._details.name;
    }

    set name(value: string) {
        this.details.name = value;
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
            locked,
            enabled: this._enabled,
            partDictionary: this._partDictionary.clone()
        });
    }
}

export { CraftingSystem, CraftingSystemJson };