import Hello from "../templates/hello.svelte"
import Properties from "../scripts/Properties";

class HelloApp extends Application {
    private _component: Hello;

    constructor(options: Partial<ApplicationOptions>) {
        super(options);
    }

    activateListeners(html: JQuery) {
        this._component = new Hello({
            target: html.get(0),
            props: {
                name: "Foundry"
            }
        });
    }

    get component(): Hello {
        return this._component;
    }

}

Hooks.once("ready", () => {
    const options = {
        title: "Hello",
        id: `${Properties.module.id}-hello`,
        width: 500,
        height: 500,
        template: `modules/${Properties.module.id}/templates/application.html`,
        classes: ["fabricate"]
    }
    const helloApp = new HelloApp(options);
    console.log(helloApp.render(true));
});
