import {FabricateItem, FabricateItem} from "./FabricateItem";
import {Combination} from "./Combination";
import {EssenceDefinition} from "./EssenceDefinition";

class CraftingComponent extends FabricateItem {

    private readonly _essences: Combination<EssenceDefinition>;
    private readonly _salvage: Combination<CraftingComponent>;

    constructor(builder: CraftingComponent.Builder) {
        super(builder);
        this._essences = builder.essences;
        this._salvage = builder.salvage;
    }

    public static builder() {
        return new CraftingComponent.Builder();
    }

    get essences(): Combination<EssenceDefinition> {
        return this._essences;
    }

    get salvage(): CraftingComponent[] {
        return this._salvage;
    }
}

namespace CraftingComponent {

    export class Builder extends FabricateItem.Builder{

        public essences: Combination<EssenceDefinition>;
        public salvage: Combination<CraftingComponent>;

        public build(): CraftingComponent {
            return new CraftingComponent(this);
        }

        public withEssences(value: Combination<EssenceDefinition>) {
            this.essences = value;
            return this;
        }

        public withSalvage(value: Combination<CraftingComponent>) {
            this.salvage = value;
            return this;
        }

    }

}

export {CraftingComponent}