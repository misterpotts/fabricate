import {SvelteApplication} from "../SvelteApplication";
import {Component} from "../../scripts/crafting/component/Component";
import Properties from "../../scripts/Properties";
import ComponentSalvageApp from "./ComponentSalvageApp.svelte";
import {LocalizationService} from "../common/LocalizationService";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";
import {ComponentAPI} from "../../scripts/api/ComponentAPI";
import {DefaultComponentSalvageManager} from "./ComponentSalvageManager";

interface ComponentSalvageAppFactory {

    make(component: Component, actor: any, appId: string): SvelteApplication;

}

class DefaultComponentSalvageAppFactory implements ComponentSalvageAppFactory {

    private readonly localizationService: LocalizationService;
    private readonly craftingAPI: CraftingAPI;
    private readonly componentAPI: ComponentAPI;

    constructor({
        craftingAPI,
        componentAPI,
        localizationService,
    }: {
        craftingAPI: CraftingAPI;
        componentAPI: ComponentAPI;
        localizationService: LocalizationService;
    }) {
        this.craftingAPI = craftingAPI;
        this.componentAPI = componentAPI;
        this.localizationService = localizationService;
    }

    make(component: Component, actor: any, appId: string): SvelteApplication {

        const applicationOptions = {
            title: this.localizationService.format(`${Properties.module.id}.ComponentSalvageApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 540,
            height: 620
        };

        const componentSalvageManager = new DefaultComponentSalvageManager({
            actor,
            craftingAPI: this.craftingAPI,
            componentAPI: this.componentAPI,
            componentToSalvage: component,
        });

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                componentType: ComponentSalvageApp,
                options: {
                    props: {
                        componentSalvageManager,
                        localization: this.localizationService,
                        closeHook: async () => {
                            const svelteApplication: SvelteApplication = <SvelteApplication>Object.values(ui.windows)
                                .find(w => w.id == appId);
                            await svelteApplication.close();
                        }
                    }
                },
            }
        });
    }

}

export { ComponentSalvageAppFactory, DefaultComponentSalvageAppFactory }