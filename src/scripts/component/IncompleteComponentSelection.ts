import {ComponentSelection} from "./ComponentSelection";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

class IncompleteComponentSelection implements ComponentSelection<CraftingComponent> {

    constructor() {
    }

    isSufficient(): boolean {
        return false;
    }

    get components(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

}

export {IncompleteComponentSelection}