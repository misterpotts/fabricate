import type { FabricateItemType } from '../compendium/CompendiumData';
import type { FabricateItem } from '../common/FabricateItem';

class InventoryRecord<T extends FabricateItem> {
  private readonly _actor: Actor;
  private _itemsOfType: Item[];
  private readonly _fabricateItem: T;
  private readonly _fabricateItemType: FabricateItemType;
  private _totalQuantity: number;

  constructor(builder: InventoryRecord.Builder<T>) {
    this._actor = builder.actor;
    this._itemsOfType = builder.itemsOfType;
    this._totalQuantity = builder.totalQuantity;
    this._fabricateItem = builder.fabricateItem;
    this._fabricateItemType = builder.fabricateItemType;
  }

  public static builder<T extends FabricateItem>(): InventoryRecord.Builder<T> {
    return new InventoryRecord.Builder<T>();
  }

  public combineWith(other: InventoryRecord<T>): InventoryRecord<T> {
    if (!this.fabricateItem.sharesType(other.fabricateItem)) {
      throw new Error(
        `Unable to combine Inventory Records for different Fabricate Item types: ${this.fabricateItem.partId} | ${other.fabricateItem.partId}`,
      );
    }
    if (this.actor.id !== other.actor.id) {
      throw new Error(
        `Unable to combine inventory records from different Actors: ${this.actor.id} | ${other.actor.id}`,
      );
    }
    return InventoryRecord.builder<T>()
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

  get itemsOfType(): Item[] {
    return this._itemsOfType;
  }

  set itemsOfType(value: Item[]) {
    this._itemsOfType = value;
  }

  get totalQuantity(): number {
    return this._totalQuantity;
  }

  set totalQuantity(value: number) {
    this._totalQuantity = value;
  }

  get fabricateItem(): T {
    return this._fabricateItem;
  }

  get fabricateItemType(): FabricateItemType {
    return this._fabricateItemType;
  }
}

namespace InventoryRecord {
  export class Builder<T extends FabricateItem> {
    public actor!: Actor;
    public itemsOfType: Item[] = [];
    public fabricateItem!: T;
    public totalQuantity!: number;
    public fabricateItemType: FabricateItemType;

    public withActor(value: Actor): Builder<T> {
      this.actor = value;
      return this;
    }

    public withItem(value: Item): Builder<T> {
      this.itemsOfType.push(value);
      return this;
    }

    public withItems(value: Item[]): Builder<T> {
      this.itemsOfType.push(...value);
      return this;
    }

    public withFabricateItem(value: T): Builder<T> {
      this.fabricateItem = value;
      return this;
    }

    public withTotalQuantity(value: number): Builder<T> {
      this.totalQuantity = value;
      return this;
    }

    public withFabricateItemType(value: FabricateItemType): Builder<T> {
      this.fabricateItemType = value;
      return this;
    }

    public build(): InventoryRecord<T> {
      return new InventoryRecord(this);
    }
  }
}

export { InventoryRecord };
