import {CraftingComponent} from "./CraftingComponent";
import {FabricateIngredientFlags} from "../game/CompendiumData";
import {FabricateItem} from "./FabricateItem";

class Ingredient extends FabricateItem {
    private readonly _component: CraftingComponent;
    private readonly _quantity: number;
    private readonly _consumed: boolean;

    constructor(builder: Ingredient.Builder) {
        super(builder.component.systemId, builder.component.partId, builder.component.imageUrl, builder.component.name);
        this._component = builder.component;
        this._quantity = builder.quantity;
        this._consumed = builder.consumed;
    }

    public static builder() {
        return new Ingredient.Builder();
    }

    get component(): CraftingComponent {
        return this._component;
    }

    get quantity(): number {
        return this._quantity;
    }

    get consumed(): boolean {
        return this._consumed;
    }

    public equals(other: Ingredient): boolean {
        if (!other) {
            return false;
        }
        return this.sharesType(other)
            && (this.quantity === other.quantity)
            && (this.consumed === other.consumed);
    }

    public static fromFlags(flags: FabricateIngredientFlags, systemId: string): Ingredient {
        return this.builder()
            .isConsumed(flags.consumed)
            .withQuantity(flags.quantity)
            .withComponent(CraftingComponent.builder()
                .withSystemId(systemId)
                .withPartId(flags.partId)
                .build())
            .build();
    }

    public static manyFromFlags(flags: FabricateIngredientFlags[], systemId: string): Ingredient[] {
        return flags.map((flagData) => Ingredient.fromFlags(flagData, systemId));
    }

    isValid(): boolean {
        return (this.quantity!= null && this.quantity > 0)
        && this.component.isValid();
    }
}

namespace Ingredient {
    export class Builder {
        public component!: CraftingComponent;
        public quantity!: number;
        public consumed!: boolean;

        public withComponent(value: CraftingComponent) {
            this.component = value;
            return this;
        }

        public withQuantity(value: number) {
            this.quantity = value;
            return this;
        }

        public isConsumed(value: boolean) {
            this.consumed = value;
            return this;
        }

        public build() {
            return new Ingredient(this);
        }
    }
}

export { Ingredient };