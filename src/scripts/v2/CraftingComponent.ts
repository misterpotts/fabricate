import {AbstractFabricateItem, FabricateItem} from "./FabricateItem";
import {EssenceDefinition} from "./EssenceDefinition";

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

    private readonly _essences: EssenceDefinition[];
    private readonly _salvage: CraftingComponent[];

    constructor(builder: CraftingComponent.Builder) {
        super(builder);
        this._essences = builder.essences;
        this._salvage = builder.salvage;
    }

    public static builder() {
        return new CraftingComponent.Builder();
    }

    get essences(): EssenceDefinition[] {
        return this._essences;
    }

    get salvage(): CraftingComponent[] {
        return this._salvage;
    }
}

namespace CraftingComponent {

    export class Builder extends FabricateItem.Builder{

        public essences: EssenceDefinition[];
        public salvage: CraftingComponent[];

        public build(): CraftingComponent {
            return new CraftingComponent(this);
        }

        public withEssences(value: EssenceDefinition[]) {
            this.essences = value;
            return this;
        }

        public withSalvage(value: CraftingComponent[]) {
            this.salvage = value;
            return this;
        }

    }

}

export {CraftingComponent, Ingredient}