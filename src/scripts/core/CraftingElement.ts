class CraftingElement {
    private readonly _name: string;
    private readonly _itemId: string;

    constructor(builder: CraftingElement.Builder) {
        this._name = builder.name;
        this._itemId = builder.itemId;
    }

    get name(): string {
        return this._name;
    }

    get itemId(): string {
        return this._itemId;
    }

    public static builder() {
        return new CraftingElement.Builder();
    }
}

namespace CraftingElement {
    export class Builder {
        public name: string;
        public itemId: string;

        public withName(value: string) {
            this.name = value;
            return this;
        }

        withItemId(value: string) {
            this.itemId = value;
            return this;
        }

        public build() {
            return new CraftingElement(this);
        }
    }
}

export {CraftingElement}