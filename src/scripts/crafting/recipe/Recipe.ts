import {DefaultCombination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {FabricateItemData, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Serializable} from "../../common/Serializable";
import {ComponentReference} from "../component/ComponentReference";
import {Requirement} from "./Requirement";
import {RequirementJson} from "./Requirement";
import {Result, ResultJson} from "./Result";
import {EssenceReference} from "../essence/EssenceReference";
import {
    Option,
    DefaultOption,
    OptionConfig,
    SerializableOptions,
    DefaultSerializableOption,
    DefaultSerializableOptions
} from "../../common/Options";

/**
 * The RequirementOptionConfig interface. This interface is used to define the structure of the JSON object used to
 *   define a requirement option without instantiating one directly.
 *
 * @deprecated - Replaced by OptionConfiguration<RequirementConfig> in Recipe#setRequirementOption
 */
interface RequirementOptionConfig {
    id?: string,
    name: string,
    catalysts?: Record<string, number>;
    ingredients?: Record<string, number>;
    essences?: Record<string, number>;
}

export { RequirementOptionConfig }

/**
 * The ResultOptionConfig interface. This interface is used to define the structure of the JSON object used to define
 *  a result option without instantiating one directly.
 *
 *  @deprecated - Replaced by OptionConfiguration<ResultConfig> in Recipe#setResultOption
 */
interface ResultOptionConfig {

    id?: string;
    name: string;
    results: Record<string, number>;

}

export { ResultOptionConfig }

// todo: BREAKING replace with OptionsJson and RequirementJson and perform data migration
type RecipeRequirementOptionJson = Record<string, {
    id: string;
    name: string;
    catalysts: Record<string, number>;
    ingredients: Record<string, number>;
    essences: Record<string, number>;
}>;

export { RecipeRequirementOptionJson }

// todo: BREAKING replace with OptionsJson and ResultJson and perform data migration
type RecipeResultOptionJson = Record<string, {
    id: string;
    name: string;
    results: Record<string, number>;
}>;

export { RecipeResultOptionJson }

interface RecipeJson {

    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    craftingSystemId: string;
    resultOptions: RecipeResultOptionJson;
    requirementOptions: RecipeRequirementOptionJson;

}

export { RecipeJson }

/**
 * A configuration object for a new result option
 */
interface ResultConfig {

    /**
     * A dictionary of the components produced by this result option and the amount of each component produced, keyed on
     * the component ID
     */
    products: Record<string, number>;

}

export { ResultConfig }

/**
 * A configuration object for a new requirement option
 */
interface RequirementConfig {

    /**
     * A dictionary of the catalysts required by this requirement option and the amount of each required, keyed on the
     * component ID
     */
    catalysts?: Record<string, number>;

    /**
     * A dictionary of the ingredients required by this requirement option and the amount of each required, keyed on the
     * component ID
     */
    ingredients?: Record<string, number>;

    /**
     * A dictionary of the essences required by this requirement option and the amount of each required, keyed on the
     * essence ID
     */
    essences?: Record<string, number>;

}

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
     * The options for the requirements of this recipe
     */
    readonly requirementOptions: SerializableOptions<RequirementJson, Requirement>;

    /**
     * The options for the results of this recipe
     */
    readonly resultOptions: SerializableOptions<ResultJson, Result>;

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
     * Indicates whether this recipe's item data has been loaded. This is a convenience function for checking if the
     *  item data has been loaded.
     */
    readonly loaded: boolean;

    /**
     * Sets the result option for this recipe. If the result option has an ID, it will be used to attempt to overwrite
     * an existing result option. Otherwise, a new result option will be created with a new ID.
     *
     * @param {OptionConfig<ResultConfig> | Option<Result>} resultOption - The result option to set. Accepts an
     * Option instance or a ResultOptionConfig object.
     */
    setResultOption(resultOption: OptionConfig<ResultConfig> | Option<Result>): void;

    /**
     * Sets the requirement option for this recipe. If the requirement option has an ID, it will be used to attempt to
     * overwrite an existing requirement option. Otherwise, a new requirement option will be created with a new ID.
     *
     * @param {OptionConfig<RequirementConfig> | Option<Requirement>} requirementOption - The requirement option
     * to set. Accepts an Option instance or a RequirementOptionConfig object.
     */
    setRequirementOption(requirementOption: OptionConfig<RequirementConfig> | Option<Requirement>): void;

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
    private _requirementOptions: SerializableOptions<RequirementJson, Requirement>;
    private _resultOptions: SerializableOptions<ResultJson, Result>;
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
        resultOptions = new DefaultSerializableOptions(),
        requirementOptions = new DefaultSerializableOptions(),
    }: {
        id: string;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        resultOptions?: SerializableOptions<ResultJson, Result>;
        requirementOptions?: SerializableOptions<RequirementJson, Requirement>;
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

    get requirementOptions(): SerializableOptions<RequirementJson, Requirement> {
        return this._requirementOptions;
    }

    get isDisabled(): boolean {
        return this._disabled;
    }

    get resultOptions(): SerializableOptions<ResultJson, Result> {
        return this._resultOptions;
    }

    get hasChoices(): boolean {
        return this.hasRequirementChoices || this.hasResultChoices;
    }

    get hasRequirementChoices(): boolean {
        return this._requirementOptions.size > 1;
    }

    get hasResultChoices(): boolean {
        return this._resultOptions.size > 1;
    }

    get hasRequirements() {
        return this._requirementOptions.size !== 0;
    }

    get hasResults(): boolean {
        return this._resultOptions.size !== 0;
    }

    get hasErrors(): boolean {
        return this._itemData.hasErrors;
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

    setResultOption(resultOption: OptionConfig<ResultConfig> | Option<Result> | ResultOptionConfig): void {

        // Do not allow non-serializable options
        if (resultOption instanceof DefaultOption) {
            throw new Error('Recipe result options must be serializable. Pass an OptionConfiguration object or an instance of DefaultSerializableOption instead.');
        }

        // If the result option is already a serializable option, set it directly
        if (resultOption instanceof DefaultSerializableOption) {
            this._resultOptions.set(resultOption);
            return;
        }

        // Upgrade the result option config to an OptionConfiguration object if required
        if (this.isResultOptionConfig(resultOption)) {
            console.warn("Recipe result options should be passed as OptionConfiguration objects. Passing a ResultOptionConfig object is deprecated and will be removed in a future version.");
            resultOption = {
                id: resultOption.id,
                name: resultOption.name,
                value: {
                    products: resultOption.results
                }
            }
        }

        // We don't accept user-defined identifiers for result options
        // If the result option has an ID, assert that it exists to overwrite
        if (resultOption.id && !this._resultOptions.has(resultOption.id)) {
            throw new Error(`Unable to find result option with id ${resultOption.id}`);
        }

        const optionConfig = <OptionConfig<ResultJson>>resultOption;
        const value = Result.fromJson({
            products: optionConfig.value.products
        });
        const option = new DefaultSerializableOption({
            id: resultOption.id,
            name: resultOption.name,
            value
        });
        this._resultOptions.set(option);

    }

    private isResultOptionConfig(resultOption: any): resultOption is ResultOptionConfig {
        return resultOption
            && resultOption.name
            && !("value" in resultOption);
    }

    setRequirementOption(requirementOption: OptionConfig<RequirementConfig> | Option<Requirement> | RequirementOptionConfig): void {

        // Do not allow non-serializable options
        if (requirementOption instanceof DefaultOption) {
            throw new Error('Recipe requirement options must be serializable. Pass an OptionConfiguration object or an instance of DefaultSerializableOption instead.');
        }

        // If the requirement option is already a serializable option, set it directly
        if (requirementOption instanceof DefaultSerializableOption) {
            this._requirementOptions.set(requirementOption);
            return;
        }

        // Upgrade the requirement option config to an OptionConfiguration object if required
        if (this.isRequirementOptionConfig(requirementOption)) {
            console.warn("Recipe requirement options should be passed as OptionConfiguration objects. Passing a RequirementOptionConfig object is deprecated and will be removed in a future version.");
            requirementOption = {
                id: requirementOption.id,
                name: requirementOption.name,
                value: {
                    catalysts: requirementOption.catalysts,
                    ingredients: requirementOption.ingredients,
                    essences: requirementOption.essences
                }
            }
        }

        // We don't accept user-defined identifiers for requirement options
        // If the requirement option has an ID, assert that it exists to overwrite
        if (requirementOption.id && !this._requirementOptions.has(requirementOption.id)) {
            throw new Error(`Unable to find requirement option with id ${requirementOption.id}`);
        }

        const optionConfig = <OptionConfig<RequirementJson>>requirementOption;
        const value = Requirement.fromJson({
            catalysts: optionConfig.value.catalysts,
            ingredients: optionConfig.value.ingredients,
            essences: optionConfig.value.essences
        });
        const option = new DefaultSerializableOption({
            id: requirementOption.id,
            name: requirementOption.name,
            value
        });
        this._requirementOptions.set(option);

    }

    private isRequirementOptionConfig(requirementOption: any): requirementOption is RequirementOptionConfig {
        return requirementOption
            && requirementOption.name
            && !("value" in requirementOption);
    }

    deleteResultOptionById(id: string) {
        this._resultOptions.remove(id);
    }

    deleteRequirementOptionById(id: string) {
        this._requirementOptions.remove(id);
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
            resultOptions: this._resultOptions.clone((resultOption) =>
                resultOption.clone({
                    substituteComponentIds
                })
            ),
            requirementOptions: this._requirementOptions.clone((requirementOption) =>
                requirementOption.clone({
                    substituteComponentIds,
                    substituteEssenceIds
                })
            )
        });
    }

    getUniqueReferencedComponents(): ComponentReference[] {
        const componentsFromResults = this.resultOptions.all
            .map(resultOption => resultOption.value.products)
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, DefaultCombination.EMPTY<ComponentReference>());
        const componentFromRequirements = this.requirementOptions.all
            .map(requirementOption => requirementOption.value.ingredients.combineWith(requirementOption.value.catalysts))
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, DefaultCombination.EMPTY<ComponentReference>());
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
            resultOptions: this._resultOptions.all
                .map(option => ({
                    id: option.id,
                    name: option.name,
                    results: option.value.products.toJson()
                }))
                .reduce((previousValue, currentValue) => {
                    previousValue[currentValue.id] = currentValue;
                    return previousValue;
                }, <RecipeResultOptionJson>{}),
            requirementOptions: this._requirementOptions.all
                .map(option => ({
                    id: option.id,
                    name: option.name,
                    catalysts: option.value.catalysts.toJson(),
                    ingredients: option.value.ingredients.toJson(),
                    essences: option.value.essences.toJson()
                }))
                .reduce((previousValue, currentValue) => {
                    previousValue[currentValue.id] = currentValue;
                    return previousValue;
                }, <RecipeRequirementOptionJson>{})
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
        return this._requirementOptions.all.some(option => !option.value.essences.isEmpty());
    }

    hasComponent(componentId: string): boolean {
        const inRequirements = this.requirementOptions.all
            .map(option => option.value.ingredients.has(componentId) || option.value.catalysts.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);

        if (inRequirements) {
            return true;
        }

        return this.resultOptions.all
            .map(option => option.value.products.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);
    }

    removeComponent(componentId: string) {
        this._requirementOptions = this._requirementOptions
            .clone((requirement) => {
                const catalysts = requirement.catalysts.without(componentId);
                const ingredients = requirement.ingredients.without(componentId);
                return new Requirement({
                    essences: requirement.essences,
                    catalysts,
                    ingredients
                });
            });
    }

    removeEssence(essenceIdToRemove: string) {
        this._requirementOptions = this._requirementOptions
            .clone((requirement) => {
                const essences = requirement.essences.without(essenceIdToRemove);
                return new Requirement({
                    essences,
                    catalysts: requirement.catalysts,
                    ingredients: requirement.ingredients
                });
            });
    }

    hasEssence(essenceId: string) {
        return this.getUniqueReferencedEssences().some(essence => essence.id === essenceId);
    }

    getUniqueReferencedEssences(): EssenceReference[] {
        return this.requirementOptions.all
            .flatMap(option => option.value.essences.members)
            .filter((essence, index, array) => array.findIndex(other => other.id === essence.id) === index);
    }

    static fromJson(recipeJson: RecipeJson) {
        const resultOptions = new DefaultSerializableOptions<ResultJson, Result>(
            Object.entries(recipeJson.resultOptions)
                .map(([id, resultOptionJson]) => {
                    return new DefaultSerializableOption({
                        id,
                        name: resultOptionJson.name,
                        value: Result.fromJson({
                            products: resultOptionJson.results
                        })
                    });
                })
        );
        const requirementOptions = new DefaultSerializableOptions<RequirementJson, Requirement>(
            Object.entries(recipeJson.requirementOptions)
                .map(([id, requirementOptionJson]) => {
                    return new DefaultSerializableOption({
                        id,
                        name: requirementOptionJson.name,
                        value: Requirement.fromJson({
                            catalysts: requirementOptionJson.catalysts,
                            ingredients: requirementOptionJson.ingredients,
                            essences: requirementOptionJson.essences
                        })
                    });
                })
        );
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