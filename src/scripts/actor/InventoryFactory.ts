import {CraftingInventory, Inventory} from "./Inventory";
import {
    AlwaysOneItemQuantityReader,
    DnD5EItemQuantityReader,
    DnD5EItemQuantityWriter,
    ItemQuantityReader,
    ItemQuantityWriter, NoItemQuantityWriter
} from "./ItemQuantity";
import {DefaultDocumentManager} from "../foundry/DocumentManager";
import {DefaultObjectUtility} from "../foundry/ObjectUtility";
import {GameProvider} from "../foundry/GameProvider";
import {CraftingSystem} from "../system/CraftingSystem";

interface InventoryFactory {

    make(actor: any, craftingSystem: CraftingSystem): Inventory;

}
class DefaultInventoryFactory implements InventoryFactory {

    private static readonly _itemQuantityIoByGameSystem: Map<string, { reader: ItemQuantityReader, writer: ItemQuantityWriter }> = new Map([
        ["dnd5e", {
            reader: new DnD5EItemQuantityReader(),
            writer: new DnD5EItemQuantityWriter()
        }]
    ]);

    private readonly _gameProvider: GameProvider;

    constructor(gameProvider: GameProvider) {
        this._gameProvider = gameProvider;
    }

    public static registerItemReader(gameSystem: string, itemQuantityReader: ItemQuantityReader) {
        if (!DefaultInventoryFactory._itemQuantityIoByGameSystem.has(gameSystem)) {
            DefaultInventoryFactory._itemQuantityIoByGameSystem.set(gameSystem, { writer: null, reader: null });
        }
        DefaultInventoryFactory._itemQuantityIoByGameSystem.get(gameSystem).reader = itemQuantityReader;
    }

    public static registerItemWriter(gameSystem: string, itemQuantityWriter: ItemQuantityWriter) {
        if (!DefaultInventoryFactory._itemQuantityIoByGameSystem.has(gameSystem)) {
            DefaultInventoryFactory._itemQuantityIoByGameSystem.set(gameSystem, { writer: null, reader: null });
        }
        DefaultInventoryFactory._itemQuantityIoByGameSystem.get(gameSystem).writer = itemQuantityWriter;
    }

    make(actor: any, craftingSystem: CraftingSystem): Inventory {
        const GAME = this._gameProvider.get();

        const itemQuantityIo = DefaultInventoryFactory._itemQuantityIoByGameSystem.get(GAME.system.id);
        const itemQuantityReader = itemQuantityIo ? itemQuantityIo.reader : new AlwaysOneItemQuantityReader();
        const itemQuantityWriter = itemQuantityIo ? itemQuantityIo.writer : new NoItemQuantityWriter();

       return new CraftingInventory({
            actor,
            documentManager: new DefaultDocumentManager(),
            objectUtils: new DefaultObjectUtility(),
            gameProvider: this._gameProvider,
            knownComponentsByItemUuid: craftingSystem.craftingComponentsByItemUuid,
            itemQuantityReader,
            itemQuantityWriter
        });

    }

}

export { InventoryFactory, DefaultInventoryFactory }
