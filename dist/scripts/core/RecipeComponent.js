class RecipeComponent {
    constructor(builder) {
        this._ingredient = builder.ingredient;
        this._quantity = builder.quantity;
        this._consumed = builder.consumed;
    }
    get ingredient() {
        return this._ingredient;
    }
    get quantity() {
        return this._quantity;
    }
    get isConsumed() {
        return this._consumed;
    }
    static builder() {
        return new RecipeComponent.Builder();
    }
}
(function (RecipeComponent) {
    class Builder {
        withIngredient(value) {
            this.ingredient = value;
            return this;
        }
        withQuantity(value) {
            this.quantity = value;
            return this;
        }
        isConsumed(value) {
            this.consumed = value;
            return this;
        }
        build() {
            return new RecipeComponent(this);
        }
    }
    RecipeComponent.Builder = Builder;
})(RecipeComponent || (RecipeComponent = {}));
export { RecipeComponent };
