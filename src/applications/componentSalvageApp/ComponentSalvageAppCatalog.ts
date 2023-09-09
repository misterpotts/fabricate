import {ComponentSalvageAppFactory} from "./ComponentSalvageAppFactory";
import {SvelteApplication} from "../SvelteApplication";
import {Component} from "../../scripts/crafting/component/Component";

interface ComponentSalvageAppCatalog {

    load(actor: Actor, component: Component): Promise<SvelteApplication>;

}

class DefaultComponentSalvageAppCatalog implements ComponentSalvageAppCatalog {

    private readonly _appIndex: Map<string, SvelteApplication> = new Map();
    private readonly _componentSalvageAppFactory: ComponentSalvageAppFactory;

    constructor({
        appIndex = new Map(),
        componentSalvageAppFactory,
    }: {
        appIndex?: Map<string, SvelteApplication>;
        componentSalvageAppFactory: ComponentSalvageAppFactory;
    }) {
        this._appIndex = appIndex;
        this._componentSalvageAppFactory = componentSalvageAppFactory;
    }

    async load(actor: Actor, component: Component): Promise<SvelteApplication> {
        const appId = this.getAppId(actor, component);
        if (this._appIndex.has(appId)) {
            const svelteApplication = this._appIndex.get(appId);
            if (svelteApplication.rendered) {
                await svelteApplication.close();
            }
            this._appIndex.delete(appId);
        }
        const app = this._componentSalvageAppFactory.make(component, actor, appId);
        this._appIndex.set(appId, app);
        return app;
    }

    private getAppId(actor: Actor, component: Component) {
        //@ts-ignore
        const actorId = actor.id;
        return `fabricate-component-salvage-app-${component.id}-${actorId}`;
    }
}

export { ComponentSalvageAppCatalog, DefaultComponentSalvageAppCatalog }