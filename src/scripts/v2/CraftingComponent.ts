import {AbstractFabricateItem, FabricateItem} from "./FabricateItem";

class Ingredient {

    private readonly _component: CraftingComponent;
    private readonly _quantity: number;

    constructor(component: CraftingComponent, quantity: number) {
        this._component = component;
        this._quantity = quantity;
    }

    get component(): CraftingComponent {
        return this._component;
    }

    get quantity(): number {
        return this._quantity;
    }

}

class CraftingComponent extends AbstractFabricateItem {

    private readonly _property: any;

    constructor(builder: CraftingComponent.Builder) {
        super(builder);
        this._property = builder.property;
    }

    public static builder() {
        return new CraftingComponent.Builder();
    }

    get property(): any {
        return this._property;
    }

}

namespace CraftingComponent {

    export class Builder extends FabricateItem.Builder{

        public property: any;

        public build(): CraftingComponent {
            return new CraftingComponent(this);
        }

        public withProperty(value: any) {
            this.property = value;
            return this;
        }

    }

}

export {CraftingComponent, Ingredient}