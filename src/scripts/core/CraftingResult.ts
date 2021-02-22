import {CraftingComponent} from "./CraftingComponent";
import {ActionType} from "./ActionType";
import {FabricateResultFlags} from "../game/CompendiumData";
import {FabricateItem} from "./FabricateItem";

class CraftingResult extends FabricateItem {
    private readonly _item: CraftingComponent;
    private readonly _quantity: number;
    private readonly _action: ActionType;
    private readonly _customData: any;

    constructor(builder: CraftingResult.Builder) {
        super(builder.item.systemId, builder.item.partId);
        this._item = builder.item;
        this._quantity = builder.quantity;
        this._action = builder.action;
        this._customData = builder.customData;
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

    get customData(): any {
        return this._customData;
    }

    public static fromFlags(flags: FabricateResultFlags, systemId: string): CraftingResult {
        return this.builder()
            .withAction(flags.action)
            .withQuantity(flags.quantity)
            .withItem(CraftingComponent.builder()
                .withSystemId(systemId)
                .withPartId(flags.partId)
                .build())
            .build();
    }

    public static manyFromFlags(flags: FabricateResultFlags[], systemId: string): CraftingResult[] {
        return flags.map((flagData) => CraftingResult.fromFlags(flagData, systemId));
    }

    isValid(): boolean {
        return (this.quantity != null && this.quantity > 0)
            && (this.action != null)
            && (this.action == ActionType.ADD || this.action == ActionType.REMOVE)
            && this.item.isValid()
            && super.isValid();
    }
}

namespace CraftingResult {
    export class Builder {
        public item!: CraftingComponent;
        public quantity!: number;
        public action!: ActionType;
        public customData: any;

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

        withCustomData(value: any) {
            this.customData = value;
            return this;
        }
    }
}

export {CraftingResult}