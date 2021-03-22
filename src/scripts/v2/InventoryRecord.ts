import {AbstractFabricateItem, FabricateItem} from "./FabricateItem";

interface InventoryRecord<I extends Item> extends FabricateItem {
    totalQuantity: number;
    indexedItems: I[];
    readOnly(adjustQuantity?: number): ReadOnlyInventoryRecord<I>;
}

class DefaultInventoryRecord<I extends Item> extends AbstractFabricateItem implements InventoryRecord<I> {

    private readonly _indexedItems: I[];
    private readonly _totalQuantity: number;

    constructor(builder: InventoryRecord.Builder<I>) {
        super(builder);
        this._indexedItems = builder.indexedItems;
        this._totalQuantity = builder.totalQuantity;
    }

    public static builder<I extends Item>() {
        return new InventoryRecord.Builder<I>();
    }

    get indexedItems(): I[] {
        return this._indexedItems;
    }

    get totalQuantity(): number {
        return this._totalQuantity;
    }

    readOnly(adjustQuantity?: number): ReadOnlyInventoryRecord<I> {
        return new ReadOnlyInventoryRecord<I>(this, adjustQuantity);
    }

}

class ReadOnlyInventoryRecord<I extends Item> implements InventoryRecord<I> {

    private readonly _source: InventoryRecord<I>;
    private readonly _adjustedQuantity: number;

    constructor(source: InventoryRecord<I>, adjustQuantity: number = 0) {
        this._source = source;
        this._adjustedQuantity = source.totalQuantity + adjustQuantity;
    }

    readOnly(adjustQuantity?: number): ReadOnlyInventoryRecord<I> {
        return new ReadOnlyInventoryRecord<I>(this, adjustQuantity);
    }

    get indexedItems(): I[] {
        return this._source.indexedItems;
    }

    get totalQuantity(): number {
        return this._adjustedQuantity;
    }

    get imageUrl(): string {
        return this._source.imageUrl;
    }

    get systemId(): string {
        return this._source.systemId;
    }

    get partId(): string {
        return this._source.partId;
    }

    get name(): string {
        return this._source.name;
    }

}

namespace InventoryRecord {

    export class Builder<I extends Item> extends FabricateItem.Builder {

        public indexedItems: I[] = [];
        public totalQuantity: number;

        public build(): DefaultInventoryRecord<I> {
            return new DefaultInventoryRecord<I>(this);
        }

        public withIndexedItems(value: I[]) {
            this.indexedItems = value;
            return this;
        }

        public withTotalQuantity(value: number) {
            this.totalQuantity = value;
            return this;
        }

    }

}

export {InventoryRecord, DefaultInventoryRecord, ReadOnlyInventoryRecord}