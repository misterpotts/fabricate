class ItemRegistry {
    private static instance: ItemRegistry = new ItemRegistry();

    private static itemsById: Map<string, Item> = new Map<string, Item>();

    constructor() {
        if (ItemRegistry.instance) {
            throw new Error('ItemRegistry is a singleton. Use `ItemRegistry.getInstance()` instead. ');
        }
    }

    public static getInstance(): ItemRegistry {
        return ItemRegistry.instance;
    }

    public static register(id:string, item: Item) {
        ItemRegistry.itemsById.set(id, item);
    }

    public static get(id:string): Item {
        if (ItemRegistry.itemsById.has(id)) {
            return ItemRegistry.itemsById.get(id);
        }
        throw new Error(`No Item is registered with Fabricate with the ID ${id}`);
    }

}

export {ItemRegistry}