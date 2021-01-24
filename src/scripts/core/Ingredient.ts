class Ingredient {
    private readonly _name: String;

    constructor(builder: Ingredient.Builder) {
        this._name = builder.name;
    }

    get name(): String {
        return this._name;
    }

    public static builder() {
        return new Ingredient.Builder();
    }
}

namespace Ingredient {
    export class Builder {
        public name: String;

        public withName(value: String) {
            this.name = value;
            return this;
        }

        public build() {
            return new Ingredient(this);
        }
    }
}

export { Ingredient };