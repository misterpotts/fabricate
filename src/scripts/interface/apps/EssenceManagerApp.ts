import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";

class EssenceManagerApp extends FormApplication {

    private _essenceId: string;

    constructor(essenceId?: string) {
        super(null);
        this._essenceId = essenceId;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.EssenceManagerApp.title`),
            id: `${Properties.module.id}-essence-manager`,
            template: Properties.module.templates.EssenceManagerApp,
            width: 400,
        };
    }

    protected _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        console.log("Update object");
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        super.render(force);
    }

    async getData(): Promise<any> {
        return {
            id: this._essenceId,
            name: "",
            description: "",
            iconCode: "",
            tooltip: ""
        };
    }

}

export { EssenceManagerApp }