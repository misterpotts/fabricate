import {CraftingComponent} from "../core/CraftingComponent";

class InventoryRecord {
    private readonly _actor: Actor;
    private _itemsOfType: Item[];
    private readonly _componentType: CraftingComponent;
    private _totalQuantity: number;

    constructor(builder: InventoryRecord.Builder) {
        this._actor = builder.actor;
        this._itemsOfType = builder.itemsOfType;
        this._totalQuantity = builder.totalQuantity;
        this._componentType = builder.craftingComponent;
    }

    public static builder(): InventoryRecord.Builder {
        return new InventoryRecord.Builder();
    }

    public combineWith(other: InventoryRecord): InventoryRecord {
        if (!this.componentType.equals(other.componentType)) {
            throw new Error(`Unable to combine inventory records for different Fabricate Item Types: ${this.componentType.compendiumEntry.entryId} | ${other.componentType.compendiumEntry.entryId}`);
        }
        if (this.actor.id !== other.actor.id) {
            throw new Error(`Unable to combine inventory records from different Actors: ${this.actor.id} | ${other.actor.id}`);
        }
        return InventoryRecord.builder()
            .withCraftingComponent(this.componentType)
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

    get componentType(): CraftingComponent {
        return this._componentType;
    }
}

namespace InventoryRecord {
    export class Builder {
        public actor!: Actor;
        public itemsOfType: Item[] = [];
        public craftingComponent!: CraftingComponent;
        public totalQuantity!: number;

        public withActor(value: Actor): Builder {
            this.actor = value;
            return this;
        }

        public withItem(value: Item): Builder {
            this.itemsOfType.push(value);
            return this;
        }

        public withItems(value: Item[]): Builder {
            this.itemsOfType.push(...value);
            return this;
        }

        public withCraftingComponent(value: CraftingComponent): Builder {
            this.craftingComponent = value;
            return this;
        }

        public withTotalQuantity(value: number): Builder {
            this.totalQuantity = value;
            return this;
        }

        public build(): InventoryRecord {
            return new InventoryRecord(this);
        }

    }
}

export {InventoryRecord}