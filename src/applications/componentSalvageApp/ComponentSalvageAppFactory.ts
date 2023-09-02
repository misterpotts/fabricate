import {SvelteApplication} from "../SvelteApplication";
import {Component} from "../../scripts/crafting/component/Component";
import Properties from "../../scripts/Properties";
import ComponentSalvageApp from "./ComponentSalvageApp.svelte";
import {LocalizationService} from "../common/LocalizationService";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";
import {ComponentAPI} from "../../scripts/api/ComponentAPI";

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
            height: 514
        };

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                componentType: ComponentSalvageApp,
                options: {
                    props: {
                        actor,
                        component,
                        craftingAPI: this.craftingAPI,
                        componentAPI: this.componentAPI,
                        localization: this.localizationService,
                        closeApplication: async () => {
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