import {CraftingElement} from "./CraftingElement";
import {Action} from "./Action";

class CraftingResult {
    private readonly _item: CraftingElement;
    private readonly _quantity: number;
    private readonly _action: Action;

    constructor(builder: CraftingResult.Builder) {
        this._item = builder.item;
        this._quantity = builder.quantity;
        this._action = builder.action;
    }

    public static builder(): CraftingResult.Builder {
        return new CraftingResult.Builder();
    }

    get item(): CraftingElement {
        return this._item;
    }

    get quantity(): number {
        return this._quantity;
    }
}

namespace CraftingResult {
    export class Builder {
        public item: CraftingElement;
        public quantity: number;
        public action: Action;

        public withItem(value: CraftingElement): Builder {
            this.item = value;
            return this;
        }

        public withQuantity(value: number): Builder {
            this.quantity = value;
            return this;
        }

        public withAction(value: Action): Builder {
            this.action = value;
            return this;
        }

        public build(): CraftingResult {
            return new CraftingResult(this);
        }
    }
}

export {CraftingResult}