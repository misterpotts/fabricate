import {GameSystemDocumentManager} from "../actor/GameSystemDocumentManager";
import PhysicalItem = Item5e.Templates.PhysicalItem;

class DocumentManager5E implements GameSystemDocumentManager<Item5e, Actor5e>{

    customizeItem(compendiumBaseItem: Item5e, customItemData: Item5e.Data.Data): Entity.Data {
        // const baseItemData: Entity.Data = duplicate(compendiumBaseItem.data);
        // mergeObject(baseItemData.data, alchemyResult.customItemData);
        return undefined;
    }

    listActorItems(actor: Actor5e): Item5e.Data[] {
        return actor.data.items;
    }

    readQuantity(item: Item5e): number {
        const item5eData: Item5e.Data.Data = item.data.data;
        if ('quantity' in item5eData) {
            const physicalItem: PhysicalItem = <PhysicalItem> item5eData;
            return physicalItem.quantity;
        }
        return 0;
    }

    writeQuantity(itemData: Item5e.Data, quantity: number): Item5e.Data {
        const item5eData: Item5e.Data.Data = itemData.data;
        if ('quantity' in item5eData) {
            const physicalItem: PhysicalItem = <PhysicalItem> item5eData;
            physicalItem.quantity = quantity;
            return itemData;
        }
        throw new Error(`Cannot set quantity for "${itemData.name}". It is not a physical item. `);
    }

}

export {DocumentManager5E}