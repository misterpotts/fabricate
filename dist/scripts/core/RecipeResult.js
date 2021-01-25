class RecipeResult {
    constructor(builder) {
        this._item = builder.item;
        this._quantity = builder.quantity;
    }
    static builder() {
        return new RecipeResult.Builder();
    }
    get item() {
        return this._item;
    }
    get quantity() {
        return this._quantity;
    }
}
(function (RecipeResult) {
    class Builder {
        withItem(value) {
            this.item = value;
            return this;
        }
        withQuantity(value) {
            this.quantity = value;
            return this;
        }
        build() {
            return new RecipeResult(this);
        }
    }
    RecipeResult.Builder = Builder;
})(RecipeResult || (RecipeResult = {}));
export { RecipeResult };
