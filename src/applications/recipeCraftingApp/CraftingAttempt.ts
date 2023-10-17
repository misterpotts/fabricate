import {Option} from "../../scripts/common/Options";
import {Requirement} from "../../scripts/crafting/recipe/Requirement";
import {Result} from "../../scripts/crafting/recipe/Result";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {Combination} from "../../scripts/common/Combination";
import {Component} from "../../scripts/crafting/component/Component";
import {ComponentSelection} from "../../scripts/component/ComponentSelection";

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
                }: {
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

export {DefaultCraftingAttempt};
export {CraftingAttempt};