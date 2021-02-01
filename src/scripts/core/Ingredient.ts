import {CraftingComponent} from "./CraftingComponent";

class Ingredient {
    private readonly _componentType: CraftingComponent;
    private readonly _quantity: number;
    private readonly _consumed: boolean;

    constructor(builder: Ingredient.Builder) {
        this._componentType = builder.ingredient;
        this._quantity = builder.quantity;
        this._consumed = builder.consumed;
    }

    public static builder() {
        return new Ingredient.Builder();
    }

    get componentType(): CraftingComponent {
        return this._componentType;
    }

    get quantity(): number {
        return this._quantity;
    }

    get consumed(): boolean {
        return this._consumed;
    }

    public matchesType(other: Ingredient): boolean {
        return other.componentType.equals(this._componentType);
    }

    public is(other: Ingredient): boolean {
        return this._componentType.equals(other.componentType)
            && (this._quantity === other.quantity)
            && (this._consumed === other.consumed);
    }
}

namespace Ingredient {
    export class Builder {
        public ingredient!: CraftingComponent;
        public quantity!: number;
        public consumed!: boolean;

        public withIngredient(value: CraftingComponent) {
            this.ingredient = value;
            return this;
        }

        public withQuantity(value: number) {
            this.quantity = value;
            return this;
        }

        public isConsumed(value: boolean) {
            this.consumed = value;
            return this;
        }

        public build() {
            return new Ingredient(this);
        }
    }
}

export { Ingredient };