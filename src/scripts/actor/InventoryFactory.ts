import {CraftingInventory, Inventory} from "./Inventory";
import {DefaultObjectUtility, ObjectUtility} from "../foundry/ObjectUtility";
import {Component} from "../crafting/component/Component";
import {
    ItemDataManager,
    OptimisticItemDataManagerFactory,
    PropertyPathAwareItemDataManager
} from "./ItemDataManager";
import {LocalizationService} from "../../applications/common/LocalizationService";

interface InventoryFactory {

    make(gameSystemId: string,
         actor: Actor,
         knownComponents: Component[],
    ): Inventory;

    registerGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): [string, string][];

}

class DefaultInventoryFactory implements InventoryFactory {

    private static readonly _KNOWN_GAME_SYSTEM_ITEM_QUANTITY_PROPERTY_PATHS: Map<string, string> = new Map([
        ["dnd5e", "system.quantity"],
        ["pf2e", "system.quantity"],
    ]);

    private readonly _localizationService: LocalizationService;
    private readonly _objectUtility: ObjectUtility;
    private readonly _gameSystemItemQuantityPropertyPaths: Map<string, string>;
    private readonly _optimisticItemDataManagerFactory: OptimisticItemDataManagerFactory;

    constructor({
        objectUtility = new DefaultObjectUtility(),
        localizationService,
        gameSystemItemQuantityPropertyPaths = DefaultInventoryFactory._KNOWN_GAME_SYSTEM_ITEM_QUANTITY_PROPERTY_PATHS,
        optimisticItemDataManagerFactory = new OptimisticItemDataManagerFactory({ objectUtils: objectUtility }),
    }: {
        objectUtility?: ObjectUtility;
        localizationService: LocalizationService;
        gameSystemItemQuantityPropertyPaths?: Map<string, string>;
        optimisticItemDataManagerFactory?: OptimisticItemDataManagerFactory;
    }) {
        this._objectUtility = objectUtility;
        this._localizationService = localizationService;
        this._optimisticItemDataManagerFactory = optimisticItemDataManagerFactory;
        this._gameSystemItemQuantityPropertyPaths = gameSystemItemQuantityPropertyPaths;
    }

    registerGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): [string, string][] {
        this._gameSystemItemQuantityPropertyPaths.set(gameSystem, propertyPath);
        return Array.from(this._gameSystemItemQuantityPropertyPaths.entries());
    }

    make(gameSystemId: string,
         actor: Actor,
         knownComponents: Component[],
    ): Inventory {

        let itemDataManager: ItemDataManager;
        if (this._gameSystemItemQuantityPropertyPaths.has(gameSystemId)) {
            itemDataManager = new PropertyPathAwareItemDataManager({
                objectUtils: this._objectUtility,
                propertyPath: this._gameSystemItemQuantityPropertyPaths.get(gameSystemId),
            });
        } else {
            itemDataManager = this._optimisticItemDataManagerFactory.make();
        }

        return new CraftingInventory({
            actor,
            localization: this._localizationService,
            itemDataManager,
            knownComponents,
       });

    }

}

export { InventoryFactory, DefaultInventoryFactory }
