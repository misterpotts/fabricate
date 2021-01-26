class ItemRegistry {
    constructor() {
        if (ItemRegistry.instance) {
            throw new Error('ItemRegistry is a singleton. Use `ItemRegistry.getInstance()` instead. ');
        }
    }
    static getInstance() {
        return ItemRegistry.instance;
    }
    static register(id, item) {
        ItemRegistry.itemsById.set(id, item);
    }
    static get(id) {
        if (ItemRegistry.itemsById.has(id)) {
            return ItemRegistry.itemsById.get(id);
        }
        throw new Error(`No Item is registered with Fabricate with the ID ${id}`);
    }
}
ItemRegistry.instance = new ItemRegistry();
ItemRegistry.itemsById = new Map();
export { ItemRegistry };
