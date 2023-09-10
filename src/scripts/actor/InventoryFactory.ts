import {CraftingInventory, Inventory} from "./Inventory";
import {DefaultObjectUtility, ObjectUtility} from "../foundry/ObjectUtility";
import {Component} from "../crafting/component/Component";
import {ItemDataManager, PropertyPathAwareItemDataManager, SingletonItemDataManager} from "./ItemDataManager";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";

interface InventoryFactory {

    make(gameSystemId: string,
         actor: BaseActor,
         knownComponents: Component[],
    ): Inventory;

    registerGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): void;

}

class DefaultInventoryFactory implements InventoryFactory {

    private static readonly _KNOWN_GAME_SYSTEM_ITEM_QUANTITY_PROPERTY_PATHS: Map<string, string> = new Map([
        ["dnd5e", "system.quantity"],
        ["pf2e", "system.quantity"],
    ]);

    private readonly _localizationService: LocalizationService;
    private readonly _objectUtility: ObjectUtility;
    private readonly _gameSystemItemQuantityPropertyPaths: Map<string, string>;

    constructor({
        localizationService,
        objectUtility = new DefaultObjectUtility(),
        gameSystemItemQuantityPropertyPaths = DefaultInventoryFactory._KNOWN_GAME_SYSTEM_ITEM_QUANTITY_PROPERTY_PATHS,
    }: {
        localizationService: LocalizationService;
        objectUtility?: ObjectUtility;
        gameSystemItemQuantityPropertyPaths?: Map<string, string>;
    }) {
        this._localizationService = localizationService;
        this._objectUtility = objectUtility;
        this._gameSystemItemQuantityPropertyPaths = gameSystemItemQuantityPropertyPaths;
    }

    registerGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): [string, string][] {
        this._gameSystemItemQuantityPropertyPaths.set(gameSystem, propertyPath);
        return Array.from(this._gameSystemItemQuantityPropertyPaths.entries());
    }

    make(gameSystemId: string,
         actor: BaseActor,
         knownComponents: Component[],
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
            localization: this._localizationService,
            itemDataManager,
            knownComponents,
       });

    }

}

export { InventoryFactory, DefaultInventoryFactory }
