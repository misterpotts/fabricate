class EssenceDefinition {

    private readonly _property: any;

    constructor(builder: EssenceDefinition.Builder) {
        this._property = builder.property;
    }

    public static builder() {
        return new EssenceDefinition.Builder();
    }

    get property(): any {
        return this._property;
    }

}

class EssenceUnit {

    private readonly _essence: EssenceDefinition;
    private readonly _quantity: number;

    constructor(essence: EssenceDefinition, quantity: number) {
        this._essence = essence;
        this._quantity = quantity;
    }

    get essence(): EssenceDefinition {
        return this._essence;
    }

    get quantity(): number {
        return this._quantity;
    }

}

namespace EssenceDefinition {

    export class Builder {

        public property: any;

        public build(): EssenceDefinition {
            return new EssenceDefinition(this);
        }

        public withProperty(value: any) {
            this.property = value;
            return this;
        }

    }

}

export {EssenceDefinition, EssenceUnit}