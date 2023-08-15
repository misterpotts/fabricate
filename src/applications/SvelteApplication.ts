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
    private readonly _onClose: () => void;

    private _component: SvelteComponent;

    constructor({
        applicationOptions,
        svelteConfig,
        onClose = () => {},
    }: {
        applicationOptions: Partial<ApplicationOptions>;
        svelteConfig: SvelteComponentConfig;
        onClose?: () => void;
    }) {
        applicationOptions.template = SvelteApplication._template;
        applicationOptions.classes = applicationOptions.classes ? applicationOptions.classes.concat(SvelteApplication._defaultClasses) : SvelteApplication._defaultClasses;
        super(applicationOptions);
        this._svelteConfig = svelteConfig;
        this._onClose = onClose;
    }

    activateListeners(html: JQuery) {
        const target = html.get(0);
        const options: ComponentConstructorOptions = { ...this._svelteConfig.options, target}
        this._component = new this._svelteConfig.componentType(options);
        console.log(`Fabricate | Rendered Svelte component ${this.options.id}`);
    }

    get component(): SvelteComponent {
        return this._component;
    }

    async close(): Promise<void> {
        await super.close();
        this._component.$destroy();
        this._onClose();
        console.log(`Fabricate | Destroyed Svelte component: ${this.options.id}`);
    }

}

export { SvelteApplication, SvelteComponentConfig, SvelteComponentConstructor }