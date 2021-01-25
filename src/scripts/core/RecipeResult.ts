import {CraftingElement} from "./CraftingElement";

class RecipeResult {
    private readonly _item: CraftingElement;
    private readonly _quantity: number;

    constructor(builder: RecipeResult.Builder) {
        this._item = builder.item;
        this._quantity = builder.quantity;
    }

    public static builder(): RecipeResult.Builder {
        return new RecipeResult.Builder();
    }

    get item(): CraftingElement {
        return this._item;
    }

    get quantity(): number {
        return this._quantity;
    }
}

namespace RecipeResult {
    export class Builder {
        public item: CraftingElement;
        public quantity: number;

        public withItem(value: CraftingElement): Builder {
            this.item = value;
            return this;
        }

        public withQuantity(value: number): Builder {
            this.quantity = value;
            return this;
        }

        public build(): RecipeResult {
            return new RecipeResult(this);
        }
    }
}

export {RecipeResult}