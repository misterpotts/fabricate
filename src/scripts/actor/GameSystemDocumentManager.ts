// todo: figure out v10 types

interface GameSystemDocumentManager {

    listActorItems(actor: Actor): any[];

    readQuantity(item: any): number;

    writeQuantity(itemData: any, quantity: number): any;

    customizeItem(compendiumBaseItem: any, customItemData: any): any;

}

export {GameSystemDocumentManager}