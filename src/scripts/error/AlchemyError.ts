import {CraftingError} from "./CraftingError";
import {CraftingComponent} from "../core/CraftingComponent";

class AlchemyError extends CraftingError {

    private readonly _componentMix: CraftingComponent[];

    constructor(message: string, componentMix: CraftingComponent[], componentsConsumed: boolean) {
        super(message, componentsConsumed);
        this._componentMix = componentMix;
    }

    get componentMix(): CraftingComponent[] {
        return this._componentMix;
    }

}

export {AlchemyError}