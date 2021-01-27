class CraftingResult {
    constructor(builder) {
        this._item = builder.item;
        this._quantity = builder.quantity;
        this._action = builder.action;
    }
    static builder() {
        return new CraftingResult.Builder();
    }
    get item() {
        return this._item;
    }
    get quantity() {
        return this._quantity;
    }
}
(function (CraftingResult) {
    class Builder {
        withItem(value) {
            this.item = value;
            return this;
        }
        withQuantity(value) {
            this.quantity = value;
            return this;
        }
        withAction(value) {
            this.action = value;
            return this;
        }
        build() {
            return new CraftingResult(this);
        }
    }
    CraftingResult.Builder = Builder;
})(CraftingResult || (CraftingResult = {}));
export { CraftingResult };
