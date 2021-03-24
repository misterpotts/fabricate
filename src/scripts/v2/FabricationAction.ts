class FabricationAction {

    private readonly _property: any;

    constructor(builder: FabricationAction.Builder) {
        this._property = builder.property;
    }

    public static builder() {
        return new FabricationAction.Builder();
    }

    get property(): any {
        return this._property;
    }

}

namespace FabricationAction {

    export class Builder {

        public property: any;

        public build(): FabricationAction {
            return new FabricationAction(this);
        }

        public withProperty(value: any) {
            this.property = value;
            return this;
        }

    }

}

export {FabricationAction}