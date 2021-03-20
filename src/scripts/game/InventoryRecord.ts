import {FabricateItemType} from "./CompendiumData";
import {FabricateItem} from "../core/FabricateItem";

// todo - inventory records don't care about the inner workings of the fabricate items they describe and nor does the inventory.
//  Push the first generic parameter down to the property as 'Fabricate' and rework Fabricate items to stop storing components in duplicate
class InventoryRecord<F extends FabricateItem, I extends Item> {
    private readonly _actor: Actor;
    private _itemsOfType: I[];
    private readonly _fabricateItem: F;
    private readonly _fabricateItemType: FabricateItemType;
    private _totalQuantity: number;

    constructor(builder: InventoryRecord.Builder<F, I>) {
        this._actor = builder.actor;
        this._itemsOfType = builder.itemsOfType;
        this._totalQuantity = builder.totalQuantity;
        this._fabricateItem = builder.fabricateItem;
        this._fabricateItemType = builder.fabricateItemType;
    }

    public static builder<F extends FabricateItem, I extends Item>(): InventoryRecord.Builder<F, I> {
        return new InventoryRecord.Builder<F, I>();
    }

    public combineWith(other: InventoryRecord<F, I>): InventoryRecord<F, I> {
        if (!this.fabricateItem.sharesType(other.fabricateItem)) {
            throw new Error(`Unable to combine Inventory Records for different Fabricate Item types: ${this.fabricateItem.partId} | ${other.fabricateItem.partId}`);
        }
        if (this.actor.id !== other.actor.id) {
            throw new Error(`Unable to combine inventory records from different Actors: ${this.actor.id} | ${other.actor.id}`);
        }
        return InventoryRecord.builder<F, I>()
            .withFabricateItem(this.fabricateItem)
            .withFabricateItemType(this.fabricateItemType)
            .withActor(this.actor)
            .withItems(this.itemsOfType)
            .withItems(other.itemsOfType)
            .withTotalQuantity(this.totalQuantity + other.totalQuantity)
            .build();
    }

    get actor(): Actor {
        return this._actor;
    }

    get itemsOfType(): I[] {
        return this._itemsOfType;
    }

    set itemsOfType(value: I[]) {
        this._itemsOfType = value;
    }

    get totalQuantity(): number {
        return this._totalQuantity;
    }

    set totalQuantity(value: number) {
        this._totalQuantity = value;
    }

    get fabricateItem(): F {
        return this._fabricateItem;
    }

    get fabricateItemType(): FabricateItemType {
        return this._fabricateItemType;
    }
}

namespace InventoryRecord {
    export class Builder<F extends FabricateItem, I extends Item> {
        public actor!: Actor;
        public itemsOfType: I[] = [];
        public fabricateItem!: F;
        public totalQuantity!: number;
        public fabricateItemType: FabricateItemType;

        public withActor(value: Actor): Builder<F, I> {
            this.actor = value;
            return this;
        }

        public withItem(value: I): Builder<F, I> {
            this.itemsOfType.push(value);
            return this;
        }

        public withItems(value: I[]): Builder<F, I> {
            this.itemsOfType.push(...value);
            return this;
        }

        public withFabricateItem(value: F): Builder<F, I> {
            this.fabricateItem = value;
            return this;
        }

        public withTotalQuantity(value: number): Builder<F, I> {
            this.totalQuantity = value;
            return this;
        }

        public withFabricateItemType(value: FabricateItemType): Builder<F, I> {
            this.fabricateItemType = value;
            return this;
        }

        public build(): InventoryRecord<F, I> {
            return new InventoryRecord(this);
        }

    }
}

export {InventoryRecord}