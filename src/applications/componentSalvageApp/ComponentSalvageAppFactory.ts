import {SvelteApplication} from "../SvelteApplication";
import {Component} from "../../scripts/crafting/component/Component";
import Properties from "../../scripts/Properties";
import ComponentSalvageApp from "./ComponentSalvageApp.svelte";
import {Combination} from "../../scripts/common/Combination";
import {LocalizationService} from "../common/LocalizationService";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";

interface ComponentSalvageAppFactory {

    make(component: Component, actor: any, appId: string): SvelteApplication;

}

class DefaultComponentSalvageAppFactory implements ComponentSalvageAppFactory {

    private readonly localizationService: LocalizationService;
    private readonly craftingAPI: CraftingAPI;

    constructor({
        craftingAPI,
        localizationService,
    }: {
        localizationService: LocalizationService;
        craftingAPI: CraftingAPI;
    }) {
        this.craftingAPI = craftingAPI;
        this.localizationService = localizationService;
    }

    make(component: Component, actor: any, appId: string): SvelteApplication {

        const applicationOptions = {
            title: this.localizationService.format(`${Properties.module.id}.ComponentSalvageApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 540,
            height: 514
        };

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        component,
                        craftingAPI: this.craftingAPI,
                        localization: this.localizationService,
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