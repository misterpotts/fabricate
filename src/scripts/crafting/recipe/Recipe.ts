import {Combination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {SelectableOptions} from "../selection/SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Serializable} from "../../common/Serializable";
import {ComponentReference} from "../component/ComponentReference";
import {RequirementOption} from "./RequirementOption";
import {RequirementOptionJson} from "./RequirementOption";
import {RequirementOptionConfig} from "./RequirementOption";
import {ResultOption, ResultOptionJson} from "./ResultOption";
import {ResultOptionConfig} from "./ResultOption";
import {EssenceReference} from "../essence/EssenceReference";

interface RecipeJson {

    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    craftingSystemId: string;
    resultOptions: Record<string, ResultOptionJson>;
    requirementOptions: Record<string, RequirementOptionJson>;

}

export { RecipeJson }

interface Recipe extends Identifiable, Serializable<RecipeJson> {

    /**
     * The unique ID of the recipe
     */
    readonly id: string;

    /**
     * The unique ID of the item this recipe is associated with
     */
    readonly itemUuid: string;

    /**
     * The unique ID of the crafting system this recipe belongs to
     */
    readonly craftingSystemId: string;

    /**
     * Whether this recipe is embedded with Fabricate
     */
    readonly embedded: boolean;

    /**
     * Whether this recipe is disabled
     */
    isDisabled: boolean;

    /**
     * The name of the item this recipe is associated with
     */
    readonly name: string;

    /**
     * The URL of the image of the item this recipe is associated with
     */
    readonly imageUrl: string;

    /**
     * The data of the item this recipe is associated with
     */
    itemData: FabricateItemData;

    /**
     * The options for the requirements of this recipe. May be empty.
     */
    readonly requirementOptions: SelectableOptions<RequirementOptionJson, RequirementOption>;

    /**
     * The options for the results of this recipe. May be empty.
     */
    readonly resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;

    /**
     * Whether this recipe has any requirement options. This is a convenience function for checking if the requirement
     *  options are empty.
     */
    readonly hasRequirements: boolean;

    /**
     * Whether this recipe has any result options. This is a convenience function for checking if the result options
     *  are empty.
     */
    readonly hasResults: boolean;

    /**
     * Whether this recipe requires any choices to be made by the user. This is a convenience function for checking if
     *  either the requirement options or the result options require choices.
     */
    readonly hasChoices: boolean;

    /**
     * Whether this recipe requires any choices to be made by the user for the requirements. This is a convenience
     *   function for checking if there are multiple requirement options.
     */
    readonly hasRequirementChoices: boolean;

    /**
     * Whether this recipe requires any choices to be made by the user for the results. This is a convenience function
     *  for checking if there are multiple result options.
     */
    readonly hasResultChoices: boolean;

    /**
     * Whether this recipe has any errors in its item data. This is a convenience function for checking if the item data
     *  has any errors.
     */
    readonly hasErrors: boolean;

    /**
     * The codes for the errors that occurred while loading the item data, if any. May be an empty array.
     */
    readonly errorCodes: string[];

    /**
     * The errors that occurred while loading the item data, if any. May be an empty array.
     */
    readonly errors: ItemLoadingError[];

    /**
     * Indicates whether this recipe's item data has been loaded
     */
    readonly loaded: boolean;

    /**
     * Sets the result option for this recipe. If the result option has an ID, it will be used to attempt to overwrite
     * an existing result option. Otherwise, a new result option will be created with a new ID.
     *
     * @param {ResultOptionConfig | ResultOption} resultOption - The result option to set. Accepts a ResultOption
     *  instance or a ResultOptionConfig object.
     */
    setResultOption(resultOption: ResultOptionConfig | ResultOption): void;

    /**
     * Sets the requirement option for this recipe. If the requirement option has an ID, it will be used to attempt to
     * overwrite an existing requirement option. Otherwise, a new requirement option will be created with a new ID.
     *
     * @param {RequirementOptionConfig | RequirementOption} requirementOption - The requirement option to set. Accepts
     * a RequirementOption instance or a RequirementOptionConfig object.
     */
    setRequirementOption(requirementOption: RequirementOptionConfig | RequirementOption): void;

    /**
     * Deletes the result option with the given ID from this recipe
     *
     * @param id - The ID of the result option to delete
     */
    deleteResultOptionById(id: string): void;

    /**
     * Deletes the requirement option with the given ID from this recipe
     *
     * @param id - The ID of the requirement option to delete
     */
    deleteRequirementOptionById(id: string): void;

    /**
     * Clones this recipe, optionally with a new ID, crafting system ID, and/or substitute essence and component IDs
     *
     * @param id - The ID for the cloned recipe. Must not be the ID of this recipe.
     * @param embedded - Whether the cloned recipe should be embedded with Fabricate. Defaults to false.
     * @param craftingSystemId - The ID of the crafting system for the cloned recipe. Defaults to the ID of this
     *  recipe's crafting system.
     * @param substituteEssenceIds - A map of essence IDs to substitute with new IDs. Defaults to an empty map. This is
     *  used when cloning a recipe into a new crafting system, to ensure that the cloned recipe's essences are
     *  unique to the new crafting system.
     * @param substituteComponentIds - A map of component IDs to substitute with new IDs. Defaults to an empty map.
     *  This is used when cloning a recipe into a new crafting system, to ensure that the cloned recipe's components
     *  are unique to the new crafting system.
     */
    clone({
        id,
        craftingSystemId,
        substituteEssenceIds,
        substituteComponentIds,
      }: {
        id: string;
        craftingSystemId?: string;
        substituteEssenceIds?: Map<string, string>;
        substituteComponentIds?: Map<string, string>;
    }): Recipe;

    /**
     * Lists all the components referenced by this recipe. May be an empty array.
     *
     * @returns {ComponentReference[]} - An array of all the components referenced by this recipe
     */
    getUniqueReferencedComponents(): ComponentReference[];

    /**
     * Lists all the essences referenced by this recipe. May be an empty array.
     *
     * @returns {EssenceReference[]} - An array of all the essences referenced by this recipe
     */
    getUniqueReferencedEssences(): EssenceReference[];

    /**
     * Loads the item data for this recipe
     *
     * @param forceReload - Whether to reload the item data. Defaults to false.
     * @returns {Promise<Component>} - A promise that resolves to this recipe, once the item data has been loaded
     */
    load(forceReload?: boolean): Promise<Recipe>;

    /**
     * Performs an equality check between this recipe and another recipe. If excludeDisabled is true, the disabled
     *  status of the recipes will be ignored. Works regardless of whether the recipes are loaded.
     *
     * @param other - The other recipe to compare to
     * @param excludeDisabled - Whether to ignore the disabled status of the recipes. Defaults to false.
     */
    equals(other: Recipe, excludeDisabled?: boolean): boolean;

    /**
     * Indicates whether this recipe has a requirement option that requires essences
     */
    hasEssenceRequirementOption(): boolean;

    /**
     * Indicates whether this recipe has a component with the given ID in any of its requirement or result options
     *
     * @param componentId - The ID of the component to check for
     */
    hasComponent(componentId: string): boolean;

    /**
     * Removes the component with the given ID from any of the requirement or result options
     *
     * @param componentId - The ID of the component to remove
     */
    removeComponent(componentId: string): void;

    /**
     * Indicates whether this recipe has an essence with the given ID in any of its requirement options
     *
     * @param essenceIdToRemove - The ID of the essence to check for
     */
    removeEssence(essenceIdToRemove: string): void;

    /**
     * Indicates whether this recipe has an essence with the given ID in any of its requirement options
     *
     * @param essenceId - The ID of the essence to check for
     */
    hasEssence(essenceId: string): any;

}

export { Recipe }

class DefaultRecipe implements Recipe {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _craftingSystemId: string;
    private readonly _embedded: boolean;

    private _itemData: FabricateItemData;
    private _requirementOptions: SelectableOptions<RequirementOptionJson, RequirementOption>;
    private _resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;
    private _disabled: boolean;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        embedded = false,
        craftingSystemId,
        disabled = false,
        itemData = NoFabricateItemData.INSTANCE(),
        resultOptions = new SelectableOptions({}),
        requirementOptions = new SelectableOptions({})
    }: {
        id: string;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        resultOptions?: SelectableOptions<ResultOptionJson, ResultOption>;
        requirementOptions?: SelectableOptions<RequirementOptionJson, RequirementOption>;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._craftingSystemId = craftingSystemId;
        this._itemData = itemData;
        this._disabled = disabled;
        this._requirementOptions = requirementOptions;
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

    get requirementOptions(): SelectableOptions<RequirementOptionJson, RequirementOption> {
        return this._requirementOptions;
    }

    get isDisabled(): boolean {
        return this._disabled;
    }

    get resultOptions(): SelectableOptions<ResultOptionJson, ResultOption> {
        return this._resultOptions;
    }

    get hasChoices(): boolean {
        return this.hasRequirementChoices || this.hasResultChoices;
    }

    get hasRequirementChoices(): boolean {
        return this._requirementOptions.requiresUserChoice;
    }

    get hasResultChoices(): boolean {
        return this._resultOptions.requiresUserChoice
    }

    get hasRequirements() {
        return !this._requirementOptions.isEmpty;
    }

    get hasResults(): boolean {
        return !this._resultOptions.isEmpty;
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

    get loaded(): boolean {
        return this.itemData.loaded;
    }

    /* ===========================
    *  Setters
    *  =========================== */

    set itemData(value: FabricateItemData) {
        this._itemData = value;
    }

    set isDisabled(value: boolean) {
        this._disabled = value;
    }

    /* ===========================
    *  Methods
    *  =========================== */

    setResultOption(resultOption: ResultOptionConfig | ResultOption): void {
        if (resultOption instanceof ResultOption) {
            this._resultOptions.set(resultOption);
            return;
        }
        if (resultOption.id && !this._resultOptions.has(resultOption.id)) {
            throw new Error(`Unable to find result option with id ${resultOption.id}`);
        }
        const optionId = this._resultOptions.nextId();
        const value = ResultOption.fromJson({
            id: optionId,
            ...resultOption
        });
        this._resultOptions.set(value);
    }

    setRequirementOption(requirementOption: RequirementOptionConfig | RequirementOption): void {
        if (requirementOption instanceof RequirementOption) {
            this._requirementOptions.set(requirementOption);
            return;
        }
        if (requirementOption.id && !this._requirementOptions.has(requirementOption.id)) {
            throw new Error(`Unable to find requirement option with id ${requirementOption.id}`);
        }
        const optionId = this._requirementOptions.nextId();
        const value = RequirementOption.fromJson({
            id: optionId,
            name: requirementOption.name,
            catalysts: requirementOption.catalysts,
            ingredients: requirementOption.ingredients,
            essences: requirementOption.essences
        });
        this._requirementOptions.set(value);
    }

    deleteResultOptionById(id: string) {
        this._resultOptions.deleteById(id);
    }

    deleteRequirementOptionById(id: string) {
        this._requirementOptions.deleteById(id);
    }

    clone({
              id,
              craftingSystemId = this._craftingSystemId,
              substituteEssenceIds = new Map<string, string>(),
              substituteComponentIds = new Map<string, string>(),
          }: {
        id: string;
        craftingSystemId?: string;
        substituteEssenceIds?: Map<string, string>;
        substituteComponentIds?: Map<string, string>;
    }): Recipe {
        if (id === this._id) {
            throw new Error(`Cannot clone recipe with ID "${this._id}" using the same ID`);
        }
        craftingSystemId = craftingSystemId || this._craftingSystemId;
        const itemData = craftingSystemId === this._craftingSystemId ? NoFabricateItemData.INSTANCE() : this._itemData;
        return new DefaultRecipe({
            id,
            itemData,
            embedded: false,
            craftingSystemId,
            disabled: this._disabled,
            resultOptions: this._resultOptions.clone((resultOption) => {
                return resultOption.clone({
                    substituteComponentIds,
                });
            }),
            requirementOptions: this._requirementOptions.clone((requirementOption) => {
                return requirementOption.clone({
                    substituteEssenceIds,
                    substituteComponentIds,
                });
            })
        });
    }

    getUniqueReferencedComponents(): ComponentReference[] {
        const componentsFromResults = this.resultOptions.all
            .map(resultOption => resultOption.results)
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<ComponentReference>());
        const componentFromRequirements = this.requirementOptions.all
            .map(requirementOption => requirementOption.ingredients.combineWith(requirementOption.catalysts))
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<ComponentReference>());
        return componentFromRequirements.combineWith(componentsFromResults).members;
    }

    async load(forceReload = false): Promise<Recipe> {
        if (this.loaded && !forceReload) {
            return this;
        }
        this.itemData = await this.itemData.load();
        return this;
    }

    public toJson(): RecipeJson {
        return {
            id: this._id,
            itemUuid: this._itemData.uuid,
            craftingSystemId: this._craftingSystemId,
            disabled: this._disabled,
            embedded: this._embedded,
            resultOptions: this._resultOptions.toJson(),
            requirementOptions: this._requirementOptions.toJson()
        };
    }

    equals(other: Recipe, excludeDisabled = false): boolean {
        if (!other) {
            return false;
        }
        if (!this.loaded || !other.loaded) {
            return this.id === other.id
                && this.craftingSystemId === other.craftingSystemId
                && this.embedded === other.embedded
                && this.itemUuid === other.itemUuid
                && (excludeDisabled || this.isDisabled === other.isDisabled);
        }
        return this.id === other.id
            && this.craftingSystemId === other.craftingSystemId
            && this.embedded === other.embedded
            && this.itemData.equals(other.itemData)
            && (excludeDisabled || this.isDisabled === other.isDisabled)
            && this.requirementOptions.equals(other.requirementOptions)
            && this.resultOptions.equals(other.resultOptions)
            && this.name === other.name
            && this.imageUrl === other.imageUrl;
    }

    hasEssenceRequirementOption() {
        return this._requirementOptions.all.some(option => !option.essences.isEmpty());
    }

    hasComponent(componentId: string): boolean {
        const inRequirements = this.requirementOptions.all
            .map(option => option.ingredients.has(componentId) || option.catalysts.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);

        if (inRequirements) {
            return true;
        }

        return this.resultOptions.all
            .map(option => option.results.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);
    }

    removeComponent(componentId: string) {
        const modifiedRequirementOptions = this.requirementOptions.all.map(option => {
            const ingredients = option.ingredients.without(componentId);
            const catalysts = option.catalysts.without(componentId);
            return new RequirementOption({
                id: option.id,
                name: option.name,
                essences: option.essences,
                catalysts,
                ingredients
            });
        });
        this._requirementOptions = new SelectableOptions<RequirementOptionJson, RequirementOption>({options: modifiedRequirementOptions});
        const modifiedResultOptions = this.resultOptions.all.map(option => {
            const results = option.results.without(componentId);
            return new ResultOption({
                id: option.id,
                name: option.name,
                results
            });
        });
        this._resultOptions = new SelectableOptions<ResultOptionJson, ResultOption>({options: modifiedResultOptions});
    }

    removeEssence(essenceIdToRemove: string) {
        const modifiedRequirementOptions = this.requirementOptions.all.map(option => {
            const essences = option.essences.without(essenceIdToRemove);
            return new RequirementOption({
                id: option.id,
                name: option.name,
                essences,
                catalysts: option.catalysts,
                ingredients: option.ingredients
            });
        });
        this._requirementOptions = new SelectableOptions<RequirementOptionJson, RequirementOption>({options: modifiedRequirementOptions});
    }

    hasEssence(essenceId: string) {
        return this.getUniqueReferencedEssences().some(essence => essence.id === essenceId);
    }

    getUniqueReferencedEssences(): EssenceReference[] {
        return this.requirementOptions.all
            .flatMap(option => option.essences.members)
            .filter((essence, index, array) => array.findIndex(other => other.id === essence.id) === index);
    }

    static fromJson(recipeJson: RecipeJson) {
        const resultOptions = SelectableOptions.fromJson<ResultOptionJson, ResultOption>(recipeJson.resultOptions, ResultOption.fromJson);
        const requirementOptions = SelectableOptions.fromJson<RequirementOptionJson, RequirementOption>(recipeJson.requirementOptions, RequirementOption.fromJson);
        return new DefaultRecipe({
            id: recipeJson.id,
            embedded: recipeJson.embedded,
            craftingSystemId: recipeJson.craftingSystemId,
            disabled: recipeJson.disabled,
            itemData: NoFabricateItemData.INSTANCE(),
            resultOptions,
            requirementOptions
        });
    }

}

export { DefaultRecipe }