class Template {

    private readonly _property: any;

    constructor(builder: Template.Builder) {
        this._property = builder.property;
    }

    public static builder() {
        return new Template.Builder();
    }

    get property(): any {
        return this._property;
    }

}

namespace Template {

    export class Builder {

        public property: any;

        public build(): Template {
            return new Template(this);
        }

        public withProperty(value: any) {
            this.property = value;
            return this;
        }

    }

}

export {Template}