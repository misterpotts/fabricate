import {CraftingError} from "./CraftingError";
import {CraftingComponent} from "../core/CraftingComponent";

class AlchemyError extends CraftingError {

    private readonly _componentMix: CraftingComponent[];
    private readonly _componentsConsumed: boolean;

    constructor(message: string, componentMix: CraftingComponent[], componentsConsumed: boolean) {
        super(message);
        this._componentMix = componentMix;
        this._componentsConsumed = componentsConsumed;
    }

    get componentMix(): CraftingComponent[] {
        return this._componentMix;
    }

    get componentsConsumed(): boolean {
        return this._componentsConsumed;
    }

    get message(): string {
        const componentNames = this._componentMix.map((component: CraftingComponent) => component.name).join(', ');
        return `${this.message} ${componentNames}`;
    }

}

export {AlchemyError}