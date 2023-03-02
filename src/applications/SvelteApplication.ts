import {ComponentConstructorOptions, SvelteComponent} from "svelte";
import Properties from "../scripts/Properties";

interface SvelteComponentConstructor {
    new (options: ComponentConstructorOptions): SvelteComponent;
}

interface SvelteComponentConfig {

    componentType: SvelteComponentConstructor;
    options: Omit<ComponentConstructorOptions, "target">;

}

class SvelteApplication extends Application {

    private static readonly _template = `modules/${Properties.module.id}/templates/application.html`;
    private static readonly _defaultClasses = ["fab-application-window", "fab-fabricate-theme"];

    private readonly _svelteConfig: SvelteComponentConfig;

    private _component: SvelteComponent;

    constructor({
        applicationOptions,
        svelteConfig
    }: {
        applicationOptions: Partial<ApplicationOptions>;
        svelteConfig: SvelteComponentConfig;
    }) {
        applicationOptions.template = SvelteApplication._template;
        applicationOptions.classes = applicationOptions.classes ? applicationOptions.classes.concat(SvelteApplication._defaultClasses) : SvelteApplication._defaultClasses;
        super(applicationOptions);
        this._svelteConfig = svelteConfig;
    }

    activateListeners(html: JQuery) {
        const target = html.get(0);
        const options: ComponentConstructorOptions = { ...this._svelteConfig.options, target}
        this._component = new this._svelteConfig.componentType(options);
    }


    get component(): SvelteComponent {
        return this._component;
    }

    async close(): Promise<void> {
        await super.close();
        this._component.$destroy();
    }

}

export { SvelteApplication, SvelteComponentConfig, SvelteComponentConstructor }