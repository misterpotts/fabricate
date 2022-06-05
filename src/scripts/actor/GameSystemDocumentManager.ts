interface GameSystemDocumentManager<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {

    listActorItems(actor: A): Item<Item.Data<D>>[];

    readQuantity(item: Item<Item.Data<D>>): number;

    writeQuantity(itemData: Item.Data<D>, quantity: number): Item.Data<D>;

}

export {GameSystemDocumentManager}