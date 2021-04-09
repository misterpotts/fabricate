import {BaseCraftingInventory, Inventory} from "./Inventory";
import {Combination} from "./Combination";
import {CraftingComponent} from "./CraftingComponent";

class Inventory5e extends BaseCraftingInventory<Item5e.Data.Data, Actor5e> {

    constructor(builder: Inventory5e.Builder) {
        super(builder);
    }

    public static builder(): Inventory5e.Builder {
        return new Inventory5e.Builder();
    }

    createFrom(actor: Actor5e, ownedComponents: Combination<CraftingComponent>): Inventory<Item5e.Data.Data, Actor5e> {
        return Inventory5e.builder()
            .withActor(actor)
            .withOwnedComponents(ownedComponents)
            .build();
    }

    getOwnedItems(actor: Actor5e): Item<Item.Data<Item5e.Data.Data>>[] {
        return actor.items.entries();
    }

    getQuantityFor(item: Item5e): number {
        return item.data.data.quantity;
    }

    setQuantityFor(itemData: Item5e.Data, quantity: number): Item.Data<Item5e.Data.Data> {
        itemData.data.quantity = quantity;
        return itemData;
    }

}

namespace Inventory5e {

    export class Builder extends BaseCraftingInventory.Builder<Item5e.Data.Data, Actor5e> {

        public build(): Inventory5e {
            return new Inventory5e(this);
        }

    }

}

export {Inventory5e}