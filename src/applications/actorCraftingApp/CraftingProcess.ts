import {Requirement} from "../../scripts/crafting/recipe/Requirement";
import {Option} from "../../scripts/common/Options";

interface CraftingProcess {

    readonly isReady: boolean;

    readonly recipeName: string;

    readonly selectedRequirementOption: Option<Requirement>;

}

export { CraftingProcess };

class DefaultCraftingProcess implements CraftingProcess {

    private readonly _recipeName: string;
    private readonly _selectedRequirementOption: Option<Requirement>;

    constructor({
        recipeName,
        selectedRequirementOption,
    }: {
        recipeName: string;
        selectedRequirementOption: Option<Requirement>;
    }) {
        this._recipeName = recipeName;
        this._selectedRequirementOption = selectedRequirementOption;
    }

    get recipeName(): string {
        return this._recipeName;
    }

    get isReady(): boolean {
        return true;
    }

    get selectedRequirementOption(): Option<Requirement> {
        return this._selectedRequirementOption;
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
        throw new Error("No recipe selected");
    }

}

export { NoCraftingProcess };