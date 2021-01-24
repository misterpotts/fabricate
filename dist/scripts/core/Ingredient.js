class Ingredient {
    constructor(builder) {
        this._name = builder.name;
    }
    get name() {
        return this._name;
    }
    static builder() {
        return new Ingredient.Builder();
    }
}
(function (Ingredient) {
    class Builder {
        withName(value) {
            this.name = value;
            return this;
        }
        build() {
            return new Ingredient(this);
        }
    }
    Ingredient.Builder = Builder;
})(Ingredient || (Ingredient = {}));
export { Ingredient };
