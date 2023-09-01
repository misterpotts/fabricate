import {CraftingInventory, Inventory} from "./Inventory";
import {DefaultObjectUtility, ObjectUtility} from "../foundry/ObjectUtility";
import {Component} from "../crafting/component/Component";
import {ItemDataManager, PropertyPathAwareItemDataManager, SingletonItemDataManager} from "./ItemDataManager";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";

interface InventoryFactory {

    make(gameSystemId: string,
         actor: BaseActor,
         knownComponentsBySourceItemUuid: Map<string, Component>,
    ): Inventory;

}

class DefaultInventoryFactory implements InventoryFactory {

    private static readonly _KNOWN_GAME_SYSTEM_ITEM_QUANTITY_PROPERTY_PATHS: Map<string, string> = new Map([
        ["dnd5e", "system.quantity"]
    ]);

    private readonly _localization: LocalizationService;
    private readonly _objectUtility: ObjectUtility;
    private readonly _gameSystemItemQuantityPropertyPaths: Map<string, string>;

    constructor({
        localization,
        objectUtility = new DefaultObjectUtility(),
        gameSystemItemQuantityPropertyPaths = DefaultInventoryFactory._KNOWN_GAME_SYSTEM_ITEM_QUANTITY_PROPERTY_PATHS,
    }: {
        localization: LocalizationService;
        objectUtility?: ObjectUtility;
        gameSystemItemQuantityPropertyPaths?: Map<string, string>;
    }) {
        this._localization = localization;
        this._objectUtility = objectUtility;
        this._gameSystemItemQuantityPropertyPaths = gameSystemItemQuantityPropertyPaths;
    }

    public registerGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string) {
        this._gameSystemItemQuantityPropertyPaths.set(gameSystem, propertyPath);
    }

    make(gameSystemId: string,
         actor: BaseActor,
         knownComponentsBySourceItemUuid: Map<string, Component>,
    ): Inventory {

        let itemDataManager: ItemDataManager;
        if (this._gameSystemItemQuantityPropertyPaths.has(gameSystemId)) {
            itemDataManager = new PropertyPathAwareItemDataManager({
                objectUtils: this._objectUtility,
                propertyPath: this._gameSystemItemQuantityPropertyPaths.get(gameSystemId),
            });
        } else {
            itemDataManager = new SingletonItemDataManager({ objectUtils: this._objectUtility } );
        }

        return new CraftingInventory({
            actor,
            localization: this._localization,
            itemDataManager,
            knownComponentsBySourceItemUuid,
       });

    }

}

export { InventoryFactory, DefaultInventoryFactory }
