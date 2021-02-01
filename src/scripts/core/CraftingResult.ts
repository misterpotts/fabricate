import {CraftingComponent} from "./CraftingComponent";
import {ActionType} from "./ActionType";

class CraftingResult {
    private readonly _item: CraftingComponent;
    private readonly _quantity: number;
    private readonly _action: ActionType;

    constructor(builder: CraftingResult.Builder) {
        this._item = builder.item;
        this._quantity = builder.quantity;
        this._action = builder.action;
    }

    public static builder(): CraftingResult.Builder {
        return new CraftingResult.Builder();
    }

    get item(): CraftingComponent {
        return this._item;
    }

    get quantity(): number {
        return this._quantity;
    }

    get action(): ActionType {
        return this._action;
    }
}

namespace CraftingResult {
    export class Builder {
        public item!: CraftingComponent;
        public quantity!: number;
        public action!: ActionType;

        public withItem(value: CraftingComponent): Builder {
            this.item = value;
            return this;
        }

        public withQuantity(value: number): Builder {
            this.quantity = value;
            return this;
        }

        public withAction(value: ActionType): Builder {
            this.action = value;
            return this;
        }

        public build(): CraftingResult {
            return new CraftingResult(this);
        }
    }
}

export {CraftingResult}