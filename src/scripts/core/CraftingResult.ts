import {CraftingComponent} from "./CraftingComponent";
import {ActionType} from "./ActionType";
import {ResultFlags} from "./FabricateFlags";

class CraftingResult {
    private readonly _item: CraftingComponent;
    private readonly _quantity: number;
    private readonly _action: ActionType;

    constructor(builder: CraftingResult.Builder) {
        this._item = builder.item;
        this._quantity = builder.quantity;
        this._action = builder.action;
    }

    public static builder(): CraftingResult.Builder {
        return new CraftingResult.Builder();
    }

    get item(): CraftingComponent {
        return this._item;
    }

    get quantity(): number {
        return this._quantity;
    }

    get action(): ActionType {
        return this._action;
    }

    public static fromFlags(flags: ResultFlags): CraftingResult {
        return this.builder()
            .withAction(flags.action)
            .withQuantity(flags.quantity)
            .withItem(CraftingComponent.builder()
                .withName(flags.item.name)
                .withCompendiumEntry(flags.item.compendiumEntry.compendiumKey, flags.item.compendiumEntry.entryId)
                .build())
            .build();
    }

    public static manyFromFlags(flags: ResultFlags[]): CraftingResult[] {
        return flags.map((flagData) => CraftingResult.fromFlags(flagData));
    }

    isValid(): boolean {
        return (this.quantity != null && this.quantity > 0)
            && (this.action != null)
            && (this.action == ActionType.ADD || this.action == ActionType.REMOVE)
            && this.item.isValid();
    }
}

namespace CraftingResult {
    export class Builder {
        public item!: CraftingComponent;
        public quantity!: number;
        public action!: ActionType;

        public withItem(value: CraftingComponent): Builder {
            this.item = value;
            return this;
        }

        public withQuantity(value: number): Builder {
            this.quantity = value;
            return this;
        }

        public withAction(value: ActionType): Builder {
            this.action = value;
            return this;
        }

        public build(): CraftingResult {
            return new CraftingResult(this);
        }
    }
}

export {CraftingResult}