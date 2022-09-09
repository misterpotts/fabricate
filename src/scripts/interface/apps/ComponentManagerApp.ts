import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";

class ComponentManagerApp extends FormApplication {

    private _itemId: string;

    constructor(itemId?: string) {
        super(null);
        this._itemId = itemId;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.ComponentManagerApp.title`),
            id: `${Properties.module.id}-component-manager`,
            template: Properties.module.templates.ComponentManagerApp,
            width: 500,
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
            gameItem: {
                systemId: "",
                partId: this._itemId,
                compendiumId: "",
                imageUrl: "",
                name: "",
            },
            salvage: {},
            essences: {}
        };
    }

}

export { ComponentManagerApp }