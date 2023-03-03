import {SvelteApplication} from "../SvelteApplication";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";
import {GameProvider} from "../../scripts/foundry/GameProvider";
import Properties from "../../scripts/Properties";
import ComponentSalvageApp from "./ComponentSalvageApp.svelte";
import {CraftingInventory} from "../../scripts/actor/Inventory";
import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
import {ObjectUtility} from "../../scripts/foundry/ObjectUtility";
import {
    AlwaysOneItemQuantityReader,
    DnD5EItemQuantityReader,
    DnD5EItemQuantityWriter,
    ItemQuantityReader,
    ItemQuantityWriter,
    NoItemQuantityWriter
} from "../../scripts/actor/ItemQuantity";
import {Combination} from "../../scripts/common/Combination";
import {DefaultLocalizationService} from "../common/LocalizationService";

interface ComponentSalvageAppFactory {

    make(craftingComponent: CraftingComponent, craftingSystem: CraftingSystem, actor: Actor, appId: string): SvelteApplication;

}

class DefaultComponentSalvageAppFactory implements ComponentSalvageAppFactory {

    private static readonly _itemQuantityIoByGameSystem: Map<string, { reader: ItemQuantityReader, writer: ItemQuantityWriter }> = new Map([
        ["dnd5e", {
            reader: new DnD5EItemQuantityReader(),
            writer: new DnD5EItemQuantityWriter()
        }]
    ]);

    make(craftingComponent: CraftingComponent, craftingSystem: CraftingSystem, actor: any, appId: string): SvelteApplication {

        const gameProvider = new GameProvider();
        const GAME = gameProvider.globalGameObject();

        const applicationOptions = {
            title: GAME.i18n.format(`${Properties.module.id}.ComponentSalvageApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 540,
            height: 514
        }

        const itemQuantityIo = DefaultComponentSalvageAppFactory._itemQuantityIoByGameSystem.get(GAME.system.id);
        const itemQuantityReader = itemQuantityIo ? itemQuantityIo.reader : new AlwaysOneItemQuantityReader();
        const itemQuantityWriter = itemQuantityIo ? itemQuantityIo.writer : new NoItemQuantityWriter();

        const inventory = new CraftingInventory({
            actor,
            documentManager: new DefaultDocumentManager(),
            objectUtils: new ObjectUtility(),
            gameProvider,
            craftingSystem,
            itemQuantityReader,
            itemQuantityWriter
        });

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        craftingComponent,
                        inventory,
                        localization: new DefaultLocalizationService(gameProvider),
                        ownedComponentsOfType: Combination.EMPTY(),
                        closeHook: async () => {
                            const svelteApplication: SvelteApplication = <SvelteApplication>Object.values(ui.windows)
                                .find(w => w.id == appId);
                            await svelteApplication.close();
                        }
                    }
                },
                componentType: ComponentSalvageApp
            }
        });
    }

}

export { ComponentSalvageAppFactory, DefaultComponentSalvageAppFactory }