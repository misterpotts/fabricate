import {CraftingError} from "./CraftingError";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";


class AlchemyError extends CraftingError {

    private readonly _components: Combination<CraftingComponent>;

    constructor(message: string, components: Combination<CraftingComponent>, isWastage: boolean) {
        super(message, isWastage);
        this._components = components;
    }

    get components(): Combination<CraftingComponent> {
        return this._components;
    }

}

export {AlchemyError}