import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {CraftingSystem} from "../../system/CraftingSystem";

class EditComponentDialog extends FormApplication {

    private readonly _item: any;
    private readonly _craftingSystem: CraftingSystem;

    constructor(item: any, selectedSystem: CraftingSystem) {
        super(null);
        this._item = item;
        this._craftingSystem = selectedSystem;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.EditComponentDialog.title`),
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
            system: {
                id: this._craftingSystem.id,
                essences: this._craftingSystem.essences,
                components: this._craftingSystem.components.filter(component => component.id !== this._item.id)
            },
            item: {
                id: this._item.id,
                compendiumId: this._item.compendium,
                imageUrl: this._item.img,
                name: this._item.name,
            },
            salvage: {},
            essences: {}
        };
    }

}

export { EditComponentDialog }