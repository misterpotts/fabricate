import {Combination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {SelectableOptions} from "./SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Unit} from "../../common/Unit";
import {Serializable} from "../../common/Serializable";
import {ComponentReference} from "../component/ComponentReference";
import {EssenceReference} from "../essence/EssenceReference";

interface RecipeJson {
    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    craftingSystemId: string;
    essences: Record<string, number>,
    resultOptions: ResultOptionJson[];
    requirementOptions: RequirementOptionJson[];
}

type ResultOptionJson = {
    name: string;
    results: Record<string, number>;
};

interface RequirementOptionJson {
    name: string,
    catalysts: Record<string, number>;
    ingredients: Record<string, number>;
}

class RequirementOption implements Identifiable, Serializable<RequirementOptionJson> {

    private _catalysts: Combination<ComponentReference>;
    private _ingredients: Combination<ComponentReference>;
    private _name: string;

    constructor({
        name,
        catalysts = Combination.EMPTY(),
        ingredients = Combination.EMPTY()
    }: {
        name: string;
        catalysts?: Combination<ComponentReference>;
        ingredients?: Combination<ComponentReference>;
    }) {
        this._name = name;
        this._catalysts = catalysts;
        this._ingredients = ingredients;
    }

    get requiresCatalysts(): boolean {
        return !this._catalysts.isEmpty();
    }

    get requiresIngredients(): boolean {
        return !this._ingredients.isEmpty();
    }

    set catalysts(value: Combination<ComponentReference>) {
        this._catalysts = value;
    }

    set ingredients(value: Combination<ComponentReference>) {
        this._ingredients = value;
    }

    get catalysts(): Combination<ComponentReference> {
        return this._catalysts;
    }

    get ingredients(): Combination<ComponentReference> {
        return this._ingredients;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): string {
        return this._name;
    }

    public addCatalyst(componentId: string, amount = 1) {
        this._catalysts = this._catalysts.addUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtractCatalyst(componentId: string, amount = 1) {
        this._catalysts = this._catalysts.subtractUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public addIngredient(componentId: string, amount = 1) {
        this._ingredients = this._ingredients.addUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtractIngredient(componentId: string, amount = 1) {
        this._ingredients = this._ingredients.subtractUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public get isEmpty(): boolean {
        return this._ingredients.isEmpty() && this._catalysts.isEmpty();
    }

    toJson(): RequirementOptionJson {
        return {
            name:this._name,
            catalysts: this._catalysts.toJson(),
            ingredients: this._ingredients.toJson()
        };
    }

    static
    fromJson(requirementOptionJson: RequirementOptionJson): RequirementOption {
        try {
            return new RequirementOption({
                name: requirementOptionJson.name,
                catalysts: Combination.fromRecord(requirementOptionJson.catalysts, ComponentReference.fromComponentId),
                ingredients: Combination.fromRecord(requirementOptionJson.ingredients, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`Unable to build requirement option ${requirementOptionJson.name}`, { cause });
        }
    }

}

class ResultOption implements Identifiable, Serializable<ResultOptionJson> {

    private _results: Combination<ComponentReference>;
    private _name: string;

    constructor({
        name,
        results
    }: {
        name: string;
        results: Combination<ComponentReference>;
    }) {
        this._name = name;
        this._results = results;
    }

    get isEmpty(): boolean {
        return this._results.isEmpty();
    }

    get results(): Combination<ComponentReference> {
        return this._results;
    }

    set results(value: Combination<ComponentReference>) {
        this._results = value;
    }

    set name(value: string) {
        this._name = value;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._name;
    }

    public add(componentId: string, amount = 1) {
        this._results = this._results.addUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtract(componentId: string, amount = 1) {
        this._results = this._results.subtractUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    toJson(): ResultOptionJson {
        return {
            name: this._name,
            results: this._results.toJson()
        }
    }

    static fromJson(resultOptionJson: ResultOptionJson) {
        try {
            return new ResultOption({
                name: resultOptionJson.name,
                results: Combination.fromRecord(resultOptionJson.results, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`Unable to build result option ${resultOptionJson.name}`, { cause });
        }
    }
}

class Recipe implements Identifiable, Serializable<RecipeJson> {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _craftingSystemId: string;
    private readonly _embedded: boolean;

    private _itemData: FabricateItemData;
    private _essences: Combination<EssenceReference>;
    private _requirementOptions: SelectableOptions<RequirementOptionJson, RequirementOption>;
    private _resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;
    private disabled: boolean;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        embedded = false,
        craftingSystemId,
        disabled = false,
        essences = Combination.EMPTY(),
        itemData = NoFabricateItemData.INSTANCE(),
        resultOptions = new SelectableOptions({}),
        requirementOptions = new SelectableOptions({})
    }: {
        id: string;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        essences?: Combination<EssenceReference>;
        resultOptions?: SelectableOptions<ResultOptionJson, ResultOption>;
        requirementOptions?: SelectableOptions<RequirementOptionJson, RequirementOption>;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._craftingSystemId = craftingSystemId;
        this._itemData = itemData;
        this.disabled = disabled;
        this._requirementOptions = requirementOptions;
        this._essences = essences;
        this._resultOptions = resultOptions;
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get id(): string {
        return this._id;
    }

    get embedded(): boolean {
        return this._embedded;
    }

    get craftingSystemId(): string {
        return this._craftingSystemId;
    }

    get itemUuid(): string {
        return this._itemData.uuid;
    }

    get name(): string {
        return this._itemData.name;
    }

    get imageUrl(): string {
        return this._itemData.imageUrl;
    }

    get itemData(): FabricateItemData {
        return this._itemData;
    }

    set itemData(value: FabricateItemData) {
        this._itemData = value;
    }

    get requirementOptions(): SelectableOptions<RequirementOptionJson, RequirementOption> {
        return this._requirementOptions;
    }

    get essences(): Combination<EssenceReference> {
        return this._essences;
    }

    set essences(value: Combination<EssenceReference>) {
        this._essences = value;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
    }

    get isDisabled(): boolean {
        return this.disabled;
    }

    get resultOptions(): SelectableOptions<ResultOptionJson, ResultOption> {
        return this._resultOptions;
    }

    public get hasOptions(): boolean {
        return this.hasRequirementOptions || this.hasResultOptions;
    }

    public get hasRequirementOptions(): boolean {
        return this._requirementOptions.requiresUserChoice;
    }

    public get hasResultOptions(): boolean {
        return this._resultOptions.requiresUserChoice
    }

    public ready(): boolean {
        if (!this.hasOptions) {
            return true;
        }
        return this._requirementOptions.isReady && this._resultOptions.isReady;
    }

    public getSelectedIngredients(): RequirementOption {
        if (this._requirementOptions.isReady) {
            return this._requirementOptions.selectedOption;
        }
        throw new Error("You must select an ingredient group. ");
    }

    public getSelectedResults(): ResultOption {
        if (this._resultOptions.isReady) {
            return this._resultOptions.selectedOption;
        }
        throw new Error("You must select a result group. ");
    }

    public get hasRequirements() {
        return !this._requirementOptions.isEmpty;
    }

    public get hasResults(): boolean {
        return !this._resultOptions.isEmpty;
    }

    public get requiresEssences(): boolean {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public selectRequirementOption(optionName: string) {
        return this._requirementOptions.select(optionName);
    }

    public selectResultOption(optionName: string) {
        return this._resultOptions.select(optionName);
    }

    get selectedRequirementOptionName(): string {
        return this._requirementOptions.selectedOptionId;
    }

    public selectNextRequirementOption(): string {
        this._requirementOptions.selectNext();
        return this.selectedRequirementOptionName;
    }

    public selectPreviousRequirementOption(): string {
        this._requirementOptions.selectPrevious();
        return this.selectedRequirementOptionName;
    }

    get selectedResultOptionName(): string {
        return this._resultOptions.selectedOptionId;
    }

    public selectNextResultOption(): string {
        this._resultOptions.selectNext();
        return this.selectedResultOptionName;
    }

    public selectPreviousResultOption(): string {
        this._resultOptions.selectPrevious();
        return this.selectedResultOptionName;
    }

    public makeDefaultSelections() {
        this._requirementOptions.selectFirst();
        this._resultOptions.selectFirst();
    }

    public editRequirementOption(requirementOption: RequirementOption) {
        if (!this._requirementOptions.has(requirementOption.id)) {
            throw new Error(`Cannot edit Ingredient Option "${requirementOption.id}". It does not exist in this Recipe.`);
        }
        this._requirementOptions.set(requirementOption);
    }

    set resultOptions(value: SelectableOptions<ResultOptionJson, ResultOption>) {
        this._resultOptions = value;
    }

    addIngredientOption(value: RequirementOption) {
        if (this._requirementOptions.has(value.id)) {
            throw new Error(`Ingredient option ${value.id} already exists in this recipe. `);
        }
        this._requirementOptions.add(value);
    }

    addResultOption(value: ResultOption) {
        if (this._resultOptions.has(value.id)) {
            throw new Error(`Result option ${value.id} already exists in this recipe. `);
        }
        this._resultOptions.add(value);
    }

    setIngredientOption(value: RequirementOption) {
        this._requirementOptions.set(value);
    }

    deleteIngredientOptionByName(id: string) {
        this._requirementOptions.deleteById(id);
    }

    deleteResultOptionByName(id: string) {
        this._resultOptions.deleteById(id);
    }

    setResultOption(value: ResultOptionJson) {
        const resultOption = ResultOption.fromJson(value);
        this._resultOptions.set(resultOption);
    }

    deleteResultOptionById(id: string) {
        this._resultOptions.deleteById(id);
    }

    get hasErrors(): boolean {
        return this._itemData.hasErrors;
    }

    get errorCodes(): string[] {
        return this._itemData.errors.map(error => error.code);
    }

    get errors(): ItemLoadingError[] {
        return this._itemData.errors;
    }

    deselectIngredients() {
        this._requirementOptions.deselect();
    }

    deselectResults() {
        this._resultOptions.deselect();
    }

    clone(cloneId: string) {
        return new Recipe({
            id: cloneId,
            embedded: false,
            craftingSystemId: this._craftingSystemId,
            itemData: NoFabricateItemData.INSTANCE(),
            disabled: this.disabled,
            essences: this._essences.clone(),
            resultOptions: this._resultOptions.clone(),
            requirementOptions: this._requirementOptions.clone()
        });
    }

    getUniqueReferencedComponents(): ComponentReference[] {
        const componentsFromResults = this.resultOptions.options
            .map(resultOption => resultOption.results)
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<ComponentReference>());
        const componentFromRequirements = this.requirementOptions.options
            .map(requirementOption => requirementOption.ingredients.combineWith(requirementOption.catalysts))
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<ComponentReference>());
        return componentFromRequirements.combineWith(componentsFromResults).members;
    }

    getUniqueReferencedEssences(): EssenceReference[] {
        return this.essences.members;
    }

    async load() {
        this.itemData = await this.itemData.load();
    }

    get loaded(): boolean {
        return this.itemData.loaded;
    }

    public toJson(): RecipeJson {
        return {
            id: this._id,
            itemUuid: this._itemData.uuid,
            craftingSystemId: this._craftingSystemId,
            disabled: this.disabled,
            embedded: this._embedded,
            essences: this._essences.toJson(),
            resultOptions: this._resultOptions.toJson(),
            requirementOptions: this._requirementOptions.toJson()
        };
    }

    equals(other: Recipe) {
        if (!this.equalsNotLoaded(other)) {
            return false;
        }
        return this._craftingSystemId === other.craftingSystemId
            && this.isDisabled === other.isDisabled
            && this._essences.equals(other.essences)
            && this._itemData.equals(other.itemData)
            && this._requirementOptions.equals(other.requirementOptions)
            && this._resultOptions.equals(other.resultOptions);
    }

    public equalsNotLoaded(other: Recipe): boolean {
        if (!other) {
            return false;
        }
        if (this === other ) {
            return true;
        }
        return this._id === other.id;
    }

    hasComponent(componentId: string): boolean {
        const inRequirements = this.requirementOptions.options
            .map(option => option.ingredients.has(componentId) || option.catalysts.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);

        if (inRequirements) {
            return true;
        }

        return this.resultOptions.options
            .map(option => option.results.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);
    }

    removeComponent(componentId: string) {
        const modifiedRequirementOptions = this.requirementOptions.options.map(option => {
            const ingredients = option.ingredients.without(componentId);
            const catalysts = option.catalysts.without(componentId);
            return new RequirementOption({
                name: option.name,
                catalysts,
                ingredients
            });
        });
        this._requirementOptions = new SelectableOptions<RequirementOptionJson, RequirementOption>({ options: modifiedRequirementOptions });
        const modifiedResultOptions = this.resultOptions.options.map(option => {
            const results = option.results.without(componentId);
            return new ResultOption({
                name: option.name,
                results
            });
        });
        this._resultOptions = new SelectableOptions<ResultOptionJson, ResultOption>({ options: modifiedResultOptions });
    }

    hasEssence(essenceId: string) {
        return this.essences.has(essenceId);
    }

    removeEssence(essenceId: string) {
        this._essences = this.essences.without(essenceId);
    }

    setRequirementOption(requirementOptionJson: RequirementOptionJson) {
        const requirementOption = RequirementOption.fromJson(requirementOptionJson);
        this._requirementOptions.set(requirementOption);
    }

    addEssence(essenceId: string, quantity: number) {
        this._essences = this._essences.addUnit(new Unit(new EssenceReference(essenceId), quantity));
    }

    subtractEssence(essenceId: string, quantity: number) {
        this._essences = this._essences.subtractUnit(new Unit(new EssenceReference(essenceId), quantity));
    }

}

export { Recipe, RecipeJson, ResultOptionJson, ResultOption, RequirementOptionJson, RequirementOption }