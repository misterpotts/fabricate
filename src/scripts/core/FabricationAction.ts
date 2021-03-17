import {CraftingComponent} from "./CraftingComponent";
import {FabricateResultFlags} from "../game/CompendiumData";
import {FabricateItem} from "./FabricateItem";

enum FabricationActionType {
    ADD = 'ADD',
    REMOVE = 'REMOVE'
}

class FabricationAction<T extends Item.Data> extends FabricateItem {
    private readonly _itemType: FabricateItem;
    private readonly _quantity: number;
    private readonly _actionType: FabricationActionType;
    private readonly _customItemData: T;

    constructor(builder: FabricationAction.Builder<T>) {
        super(builder.itemType.systemId, builder.itemType.partId, builder.itemType.imageUrl, builder.itemType.name);
        this._itemType = builder.itemType;
        this._quantity = builder.quantity;
        this._actionType = builder.actionType;
        this._customItemData = builder.customItemData;
    }

    public static builder<T extends Item.Data>(): FabricationAction.Builder<T> {
        return new FabricationAction.Builder<T>();
    }

    get itemType(): FabricateItem {
        return this._itemType;
    }

    get quantity(): number {
        return this._quantity;
    }

    get actionType(): FabricationActionType {
        return this._actionType;
    }

    get customItemData(): Item.Data {
        return this._customItemData;
    }

    public static fromFlags<T extends Item.Data>(flags: FabricateResultFlags, systemId: string): FabricationAction<T> {
        return this.builder<T>()
            .withActionType(flags.action)
            .withQuantity(flags.quantity)
            .withItemType(CraftingComponent.builder()
                .withSystemId(systemId)
                .withPartId(flags.partId)
                .build())
            .build();
    }

    public static manyFromFlags<T extends Item.Data>(flags: FabricateResultFlags[], systemId: string): FabricationAction<T>[] {
        return flags.map((flagData) => FabricationAction.fromFlags<T>(flagData, systemId));
    }

    isValid(): boolean {
        return (this.quantity != null && this.quantity > 0)
            && (this.actionType != null)
            && (this.actionType == FabricationActionType.ADD || this.actionType == FabricationActionType.REMOVE)
            && this.itemType.isValid()
            && super.isValid();
    }
}

namespace FabricationAction {

    export class Builder<T extends Item.Data> {

        public itemType!: FabricateItem;
        public quantity!: number;
        public actionType!: FabricationActionType;
        public customItemData: T;

        public build(): FabricationAction<T> {
            return new FabricationAction(this);
        }

        public withItemType(value: FabricateItem): Builder<T> {
            this.itemType = value;
            return this;
        }

        public withQuantity(value: number): Builder<T> {
            this.quantity = value;
            return this;
        }

        public withActionType(value: FabricationActionType): Builder<T> {
            this.actionType = value;
            return this;
        }

        withCustomItemData(value: T) {
            this.customItemData = value;
            return this;
        }

    }
}

export {FabricationAction, FabricationActionType}