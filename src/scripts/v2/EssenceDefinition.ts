class EssenceDefinition {

    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string;
    private readonly _tooltip: string;
    private readonly _iconCode: string;

    constructor(builder: EssenceDefinition.Builder) {
        this._name = builder.name;
        this._slug = builder.name.toLowerCase().replace(' ', '-');
        this._description = builder.description;
        this._tooltip = builder.tooltip;
        this._iconCode = builder.iconCode;
    }

    public static builder() {
        return new EssenceDefinition.Builder();
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get tooltip(): string {
        return this._tooltip;
    }

    get iconCode(): string {
        return this._iconCode;
    }

    get icon(): string {
        if (this.iconCode) {
            return `<i class="fas fa-${this._iconCode}" title="${this.description}"></i>`;
        }
        return this.name;
    }

    get slug(): string {
        return this._slug;
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

        public name: string;
        public description: string;
        public tooltip: string;
        public iconCode: string;

        public build(): EssenceDefinition {
            return new EssenceDefinition(this);
        }

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        public withDescription(value: string): Builder {
            this.description = value;
            return this;
        }

        public withTooltip(value: string) {
            this.tooltip = value;
            return this;
        }

        public withIconCode(value: any): Builder {
            this.iconCode = value;
            return this;
        }

    }

}

export {EssenceDefinition, EssenceUnit}