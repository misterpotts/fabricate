interface GameSystemDocumentManager<D extends Item<Actor.OwnedItemData<Actor.Data>>, A extends Actor<Actor.Data, D>> {

    listActorItems(actor: A): Item.Data<D>[];

    readQuantity(item: Item<Item.Data<D>>): number;

    writeQuantity(itemData: Item.Data<D>, quantity: number): Item.Data<D>;

    customizeItem(compendiumBaseItem: Entity<Entity.Data, Entity.Data>, customItemData: D): Entity.Data;

}

export {GameSystemDocumentManager}