import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {CraftingResult} from "../../scripts/crafting/result/CraftingResult";
import {Component} from "../../scripts/crafting/component/Component";
import {Combination} from "../../scripts/common/Combination";
import {ComponentSelection} from "../../scripts/component/ComponentSelection";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";

interface OptionDetails {
    name: string;
    id: string;
}

export { OptionDetails };

interface CraftingAttempt {

    readonly requirementOption: OptionDetails;
    readonly resultOption: OptionDetails;
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

    private readonly _resultOption: OptionDetails;
    private readonly _recipeToCraft: Recipe;
    private readonly _requirementOption: OptionDetails;
    private readonly _producedComponents: Combination<Component>;
    private readonly _selectedComponents: ComponentSelection;

    constructor({
        resultOption,
        recipeToCraft,
        requirementOption,
        producedComponents,
        selectedComponents,
    } : {
        resultOption: OptionDetails;
        recipeToCraft: Recipe;
        requirementOption: OptionDetails;
        producedComponents: Combination<Component>;
        selectedComponents: ComponentSelection;
    }) {
        this._resultOption = resultOption;
        this._recipeToCraft = recipeToCraft;
        this._requirementOption = requirementOption;
        this._producedComponents = producedComponents;
        this._selectedComponents = selectedComponents;
    }

    get resultOption(): OptionDetails {
        return this._resultOption;
    }

    get recipeToCraft(): Recipe {
        return this._recipeToCraft;
    }

    get requirementOption(): OptionDetails {
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

    readonly sourceActor: BaseActor;

    readonly targetActor: BaseActor;

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

    private readonly _sourceActor: BaseActor;
    private readonly _targetActor: BaseActor;
    private readonly _craftingAPI: CraftingAPI;
    private readonly _recipeToCraft: Recipe;
    private readonly _allCraftingSystemComponentsById: Map<string, Component>;

    constructor({
        sourceActor,
        targetActor,
        craftingAPI,
        recipeToCraft,
        allCraftingSystemComponentsById,
    }: {
        sourceActor: BaseActor;
        targetActor: BaseActor;
        craftingAPI: CraftingAPI;
        recipeToCraft: Recipe;
        allCraftingSystemComponentsById: Map<string, Component>;
    }) {
        this._sourceActor = sourceActor;
        this._targetActor = targetActor;
        this._craftingAPI = craftingAPI;
        this._recipeToCraft = recipeToCraft;
        this._allCraftingSystemComponentsById = allCraftingSystemComponentsById;
    }

    get recipeToCraft(): Recipe {
        return this._recipeToCraft;
    }

    get sourceActor(): BaseActor {
        return this._sourceActor;
    }

    get targetActor(): BaseActor {
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
            resultOptionId: this.recipeToCraft.selectedResultOption.id,
            requirementOptionId: this.recipeToCraft.selectedRequirementOption.id,
            userSelectedComponents: {
                catalysts: craftingAttempt.selectedComponents.catalysts.actual.toJson(),
                essenceSources: craftingAttempt.selectedComponents.essenceSources.toJson(),
                ingredients: craftingAttempt.selectedComponents.ingredients.actual.toJson(),
            }
        });
    }

    async getCraftingAttempt(): Promise<CraftingAttempt> {
        const producedComponents = this._recipeToCraft.selectedResultOption.results
            .convertElements(reference => this._allCraftingSystemComponentsById.get(reference.id));
        const selectedComponents = await this._craftingAPI.selectComponents({
            recipeId: this._recipeToCraft.id,
            sourceActorId: this._sourceActor.id,
            requirementOptionId: this._recipeToCraft.selectedRequirementOption.id,
        });
        return new DefaultCraftingAttempt({
            resultOption: {
                id: this._recipeToCraft.selectedResultOption.id,
                name: this._recipeToCraft.selectedResultOption.name,
            },
            requirementOption: {
                id: this._recipeToCraft.selectedRequirementOption.id,
                name: this._recipeToCraft.selectedRequirementOption.name,
            },
            recipeToCraft: this._recipeToCraft,
            producedComponents,
            selectedComponents,
        });
    }

    selectNextRequirementOption(): Promise<CraftingAttempt> {
        return Promise.resolve(undefined);
    }

    selectNextResultOption(): Promise<CraftingAttempt> {
        return Promise.resolve(undefined);
    }

    selectPreviousRequirementOption(): Promise<CraftingAttempt> {
        return Promise.resolve(undefined);
    }

    selectPreviousResultOption(): Promise<CraftingAttempt> {
        return Promise.resolve(undefined);
    }

}

export { DefaultRecipeCraftingManager };