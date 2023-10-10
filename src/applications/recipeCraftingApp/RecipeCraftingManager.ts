import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {CraftingResult} from "../../scripts/crafting/result/CraftingResult";
import {Component} from "../../scripts/crafting/component/Component";
import {Combination} from "../../scripts/common/Combination";
import {ComponentSelection} from "../../scripts/component/ComponentSelection";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";
import {DefaultSelectableOptions, SelectableOptions} from "../../scripts/common/SelectableOptions";
import {Requirement} from "../../scripts/crafting/recipe/Requirement";
import {Result} from "../../scripts/crafting/recipe/Result";
import {Option} from "../../scripts/common/Options";

interface CraftingAttempt {

    readonly requirementOption: Option<Requirement>;
    readonly resultOption: Option<Result>;
    readonly isPossible: boolean;
    readonly recipeToCraft: Recipe;
    readonly requiresCatalysts: boolean;
    readonly requiresEssences: boolean;
    readonly requiresIngredients: boolean;
    readonly producedComponents: Combination<Component>;
    readonly selectedComponents: ComponentSelection;

}

export { CraftingAttempt };

class DefaultCraftingAttempt implements CraftingAttempt {

    private readonly _resultOption: Option<Result>;
    private readonly _recipeToCraft: Recipe;
    private readonly _requirementOption: Option<Requirement>;
    private readonly _producedComponents: Combination<Component>;
    private readonly _selectedComponents: ComponentSelection;

    constructor({
        resultOption,
        recipeToCraft,
        requirementOption,
        producedComponents,
        selectedComponents,
    } : {
        resultOption: Option<Result>;
        recipeToCraft: Recipe;
        requirementOption: Option<Requirement>;
        producedComponents: Combination<Component>;
        selectedComponents: ComponentSelection;
    }) {
        this._resultOption = resultOption;
        this._recipeToCraft = recipeToCraft;
        this._requirementOption = requirementOption;
        this._producedComponents = producedComponents;
        this._selectedComponents = selectedComponents;
    }

    get resultOption(): Option<Result> {
        return this._resultOption;
    }

    get recipeToCraft(): Recipe {
        return this._recipeToCraft;
    }

    get requirementOption(): Option<Requirement> {
        return this._requirementOption;
    }

    get producedComponents(): Combination<Component> {
        return this._producedComponents;
    }

    get selectedComponents(): ComponentSelection {
        return this._selectedComponents;
    }

    get isPossible(): boolean {
        return this._selectedComponents.isSufficient;
    }

    get requiresCatalysts(): boolean {
        return !this._selectedComponents.catalysts.target.isEmpty();
    }

    get requiresEssences(): boolean {
        return !this._selectedComponents.essences.target.isEmpty();
    }

    get requiresIngredients(): boolean {
        return !this._selectedComponents.ingredients.target.isEmpty();
    }

}

export { DefaultCraftingAttempt }

interface RecipeCraftingManager {

    readonly recipeToCraft: Recipe;

    readonly sourceActor: Actor;

    readonly targetActor: Actor;

    readonly hasRequirementChoices: boolean;

    readonly hasResultChoices: boolean;

    selectNextRequirementOption(): Promise<CraftingAttempt>;

    selectNextResultOption(): Promise<CraftingAttempt>;

    selectPreviousRequirementOption(): Promise<CraftingAttempt>;

    selectPreviousResultOption(): Promise<CraftingAttempt>;

    getCraftingAttempt(): Promise<CraftingAttempt>;

    doCrafting(craftingAttempt: CraftingAttempt): Promise<CraftingResult>;

}

export { RecipeCraftingManager };

class DefaultRecipeCraftingManager implements RecipeCraftingManager {

    private readonly _sourceActor: Actor;
    private readonly _targetActor: Actor;
    private readonly _craftingAPI: CraftingAPI;
    private readonly _recipeToCraft: Recipe;
    private readonly _allCraftingSystemComponentsById: Map<string, Component>;

    private readonly _selectableRequirementOptions: SelectableOptions<Requirement>;
    private readonly _selectableResultOptions: SelectableOptions<Result>;

    constructor({
        sourceActor,
        targetActor,
        craftingAPI,
        recipeToCraft,
        allCraftingSystemComponentsById,
    }: {
        sourceActor: Actor;
        targetActor: Actor;
        craftingAPI: CraftingAPI;
        recipeToCraft: Recipe;
        allCraftingSystemComponentsById: Map<string, Component>;
    }) {
        this._sourceActor = sourceActor;
        this._targetActor = targetActor;
        this._craftingAPI = craftingAPI;
        this._recipeToCraft = recipeToCraft;
        this._allCraftingSystemComponentsById = allCraftingSystemComponentsById;

        this._selectableRequirementOptions = new DefaultSelectableOptions({
            options: recipeToCraft.requirementOptions.all
        });
        this._selectableResultOptions = new DefaultSelectableOptions({
            options: recipeToCraft.resultOptions.all
        });
    }

    get recipeToCraft(): Recipe {
        return this._recipeToCraft;
    }

    get sourceActor(): Actor {
        return this._sourceActor;
    }

    get targetActor(): Actor {
        return this._targetActor;
    }

    get hasRequirementChoices(): boolean {
        return this._recipeToCraft.hasRequirementChoices;
    }

    get hasResultChoices(): boolean {
        return this._recipeToCraft.hasResultChoices;
    }

    async doCrafting(craftingAttempt: CraftingAttempt): Promise<CraftingResult> {
        return this._craftingAPI.craftRecipe({
            recipeId: this._recipeToCraft.id,
            sourceActorId: this._sourceActor.id,
            targetActorId: this._targetActor.id,
            resultOptionId: craftingAttempt.resultOption.id,
            requirementOptionId: craftingAttempt.requirementOption.id,
            userSelectedComponents: {
                catalysts: craftingAttempt.selectedComponents.catalysts.actual.toJson(),
                essenceSources: craftingAttempt.selectedComponents.essenceSources.toJson(),
                ingredients: craftingAttempt.selectedComponents.ingredients.actual.toJson(),
            }
        });
    }

    async getCraftingAttempt(): Promise<CraftingAttempt> {
        const selectedResultOption = this._selectableResultOptions.selected;
        const selectedRequirementOption = this._selectableRequirementOptions.selected;
        const producedComponents = selectedResultOption
            .value
            .products
            .convertElements(reference => this._allCraftingSystemComponentsById.get(reference.id));
        const selectedComponents = await this._craftingAPI.selectComponents({
            recipeId: this._recipeToCraft.id,
            sourceActorId: this._sourceActor.id,
            requirementOptionId: selectedRequirementOption.id,
        });
        return new DefaultCraftingAttempt({
            resultOption: selectedResultOption,
            requirementOption: selectedRequirementOption,
            recipeToCraft: this._recipeToCraft,
            producedComponents,
            selectedComponents,
        });
    }

    selectNextRequirementOption(): Promise<CraftingAttempt> {
        this._selectableRequirementOptions.selectNext();
        return this.getCraftingAttempt();
    }

    selectNextResultOption(): Promise<CraftingAttempt> {
        this._selectableResultOptions.selectNext();
        return this.getCraftingAttempt();
    }

    selectPreviousRequirementOption(): Promise<CraftingAttempt> {
        this._selectableRequirementOptions.selectPrevious();
        return this.getCraftingAttempt();
    }

    selectPreviousResultOption(): Promise<CraftingAttempt> {
        this._selectableResultOptions.selectPrevious();
        return this.getCraftingAttempt();
    }

}

export { DefaultRecipeCraftingManager };