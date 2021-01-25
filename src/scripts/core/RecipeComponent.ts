import {CraftingElement} from "./CraftingElement.js";

class RecipeComponent {
    private readonly _ingredient: CraftingElement;
    private readonly _quantity: Number;
    private readonly _consumed: boolean;

    constructor(builder: RecipeComponent.Builder) {
        this._ingredient = builder.ingredient;
        this._quantity = builder.quantity;
        this._consumed = builder.consumed;
    }


    get ingredient(): CraftingElement {
        return this._ingredient;
    }

    get quantity(): Number {
        return this._quantity;
    }

    get isConsumed(): boolean {
        return this._consumed;
    }

    public static builder() {
        return new RecipeComponent.Builder();
    }
}

namespace RecipeComponent {
    export class Builder {
        public ingredient: CraftingElement;
        public quantity: Number;
        public consumed: boolean;

        public withIngredient(value: CraftingElement) {
            this.ingredient = value;
            return this;
        }

        public withQuantity(value: Number) {
            this.quantity = value;
            return this;
        }

        public isConsumed(value: boolean) {
            this.consumed = value;
            return this;
        }

        public build() {
            return new RecipeComponent(this);
        }
    }
}

export { RecipeComponent };