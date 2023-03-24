import {ComponentSalvageAppFactory} from "./ComponentSalvageAppFactory";
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Component} from "../../scripts/common/Component";
import {SvelteApplication} from "../SvelteApplication";

interface ComponentSalvageAppCatalog {
    load(craftingComponent: Component, craftingSystem: CraftingSystem, actor: Actor): Promise<SvelteApplication>;
}

class DefaultComponentSalvageAppCatalog implements ComponentSalvageAppCatalog {

    private readonly _componentSalvageAppFactory: ComponentSalvageAppFactory;
    private readonly _systemRegistry: SystemRegistry;

    private readonly _appIndex: Map<string, SvelteApplication> = new Map();

    constructor({
        componentSalvageAppFactory,
        systemRegistry,
        appIndex = new Map()
    }: {
        componentSalvageAppFactory: ComponentSalvageAppFactory;
        systemRegistry: SystemRegistry;
        appIndex?: Map<string, SvelteApplication>;
    }) {
        this._componentSalvageAppFactory = componentSalvageAppFactory;
        this._systemRegistry = systemRegistry;
        this._appIndex = appIndex;
    }

    async load(craftingComponent: Component, craftingSystem: CraftingSystem, actor: Actor): Promise<SvelteApplication> {
        const appId = `fabricate-component-salvage-app-${craftingComponent.id}`;
        if (this._appIndex.has(appId)) {
            const svelteApplication = this._appIndex.get(appId);
            if (svelteApplication.rendered) {
                await svelteApplication.close();
            }
            this._appIndex.delete(appId);
            craftingSystem = await this._systemRegistry.getCraftingSystemById(craftingSystem.id);
            await craftingSystem.loadPartDictionary();
            craftingComponent = craftingSystem.getComponentById(craftingComponent.id);
        }

        const app = this._componentSalvageAppFactory.make(craftingComponent, craftingSystem, actor, appId);
        this._appIndex.set(appId, app);
        return app;
    }

}

export { ComponentSalvageAppCatalog, DefaultComponentSalvageAppCatalog }