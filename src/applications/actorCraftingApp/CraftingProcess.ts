import {Requirement} from "../../scripts/crafting/recipe/Requirement";
import {DefaultOption, Option} from "../../scripts/common/Options";
import {ComponentSelection} from "../../scripts/component/ComponentSelection";
import {Result} from "../../scripts/crafting/recipe/Result";

interface CraftingProcess {

    readonly isReady: boolean;

    readonly recipeName: string;

    readonly selectedRequirementOption: Option<Requirement>;

}

export { CraftingProcess };

class DefaultCraftingProcess implements CraftingProcess {

    private readonly _recipeName: string;
    private readonly _componentSelection: ComponentSelection;
    private readonly _selectedRequirementOption: Option<Requirement>;
    private readonly _selectedResultOption: Option<Result>;

    constructor({
        recipeName,
        componentSelection,
        selectedResultOption,
        selectedRequirementOption,
    }: {
        recipeName: string;
        componentSelection: ComponentSelection;
        selectedResultOption: Option<Result>;
        selectedRequirementOption: Option<Requirement>;
    }) {
        this._recipeName = recipeName;
        this._componentSelection = componentSelection;
        this._selectedResultOption = selectedResultOption;
        this._selectedRequirementOption = selectedRequirementOption;
    }

    get recipeName(): string {
        return this._recipeName;
    }

    get isReady(): boolean {
        return true;
    }

    get selectedResultOption(): Option<Result> {
        return this._selectedResultOption;
    }

    get selectedRequirementOption(): Option<Requirement> {
        return this._selectedRequirementOption;
    }

    get componentSelection(): ComponentSelection {
        return this._componentSelection;
    }
}

export { DefaultCraftingProcess };

class NoCraftingProcess implements CraftingProcess {

    get recipeName(): string {
        return "No Recipe";
    }

    get isReady(): boolean {
        return false;
    }

    get selectedRequirementOption(): Option<Requirement> {
        return new DefaultOption({ id: "1", name: "No Requirements", value: Requirement.EMPTY })
    }

}

export { NoCraftingProcess };