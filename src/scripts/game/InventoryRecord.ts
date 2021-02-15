import {CraftingComponent} from "../core/CraftingComponent";

class InventoryRecord {
    private readonly _actor: Actor;
    private readonly _item: Item;
    private readonly _componentType: CraftingComponent;
    private _quantity: number;

    constructor(builder: InventoryRecord.Builder) {
        this._actor = builder.actor;
        this._item = builder.item;
        this._quantity = builder.quantity;
        this._componentType = builder.craftingComponent;
    }

    public static builder(): InventoryRecord.Builder {
        return new InventoryRecord.Builder();
    }

    get actor(): Actor {
        return this._actor;
    }

    get item(): Item {
        return this._item;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }

    get componentType(): CraftingComponent {
        return this._componentType;
    }
}

namespace InventoryRecord {
    export class Builder {
        public actor!: Actor;
        public item!: Item;
        public craftingComponent!: CraftingComponent;
        public quantity!: number;

        public withActor(value: Actor): Builder {
            this.actor = value;
            return this;
        }
        public withItem(value: Item): Builder {
            this.item = value;
            return this;
        }

        public withCraftingComponent(value: CraftingComponent): Builder {
            this.craftingComponent = value;
            return this;
        }

        public withQuantity(value: number): Builder {
            this.quantity = value;
            return this;
        }

        public build(): InventoryRecord {
            return new InventoryRecord(this);
        }

    }
}

export {InventoryRecord}