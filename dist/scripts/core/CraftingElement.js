class CraftingElement {
    constructor(builder) {
        this._name = builder.name;
        this._itemId = builder.itemId;
    }
    get name() {
        return this._name;
    }
    get itemId() {
        return this._itemId;
    }
    static builder() {
        return new CraftingElement.Builder();
    }
}
(function (CraftingElement) {
    class Builder {
        withName(value) {
            this.name = value;
            return this;
        }
        withItemId(value) {
            this.itemId = value;
            return this;
        }
        build() {
            return new CraftingElement(this);
        }
    }
    CraftingElement.Builder = Builder;
})(CraftingElement || (CraftingElement = {}));
export { CraftingElement };
