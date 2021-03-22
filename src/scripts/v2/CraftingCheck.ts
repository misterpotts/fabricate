class CraftingCheck {

    private readonly _property: any;

    constructor(builder: CraftingCheck.Builder) {
        this._property = builder.property;
    }

    public static builder() {
        return new CraftingCheck.Builder();
    }

    get property(): any {
        return this._property;
    }

}

namespace CraftingCheck {

    export class Builder {

        public property: any;

        public build(): CraftingCheck {
            return new CraftingCheck(this);
        }

        public withProperty(value: any) {
            this.property = value;
            return this;
        }

    }

}

export {CraftingCheck}