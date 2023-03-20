import {SvelteApplication} from "../SvelteApplication";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";
import {DefaultGameProvider} from "../../scripts/foundry/GameProvider";
import Properties from "../../scripts/Properties";
import ComponentSalvageApp from "./ComponentSalvageApp.svelte";
import {Combination} from "../../scripts/common/Combination";
import {DefaultLocalizationService} from "../common/LocalizationService";
import {DefaultInventoryFactory} from "../../scripts/actor/InventoryFactory";

interface ComponentSalvageAppFactory {

    make(craftingComponent: CraftingComponent, craftingSystem: CraftingSystem, actor: Actor, appId: string): SvelteApplication;

}

class DefaultComponentSalvageAppFactory implements ComponentSalvageAppFactory {

    make(craftingComponent: CraftingComponent, craftingSystem: CraftingSystem, actor: any, appId: string): SvelteApplication {

        const gameProvider = new DefaultGameProvider();
        const GAME = gameProvider.get();

        const applicationOptions = {
            title: GAME.i18n.format(`${Properties.module.id}.ComponentSalvageApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 540,
            height: 514
        }

        const inventory = new DefaultInventoryFactory(gameProvider).make(actor, craftingSystem);

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