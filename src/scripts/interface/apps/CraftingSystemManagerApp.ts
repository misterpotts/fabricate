import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";

class CraftingSystemManagerApp extends FormApplication {

    // @ts-ignore
    private _craftingSystemContextMenu: ContextMenu;

    constructor() {
        super(null);
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
            key: `${Properties.module.id}-crafting-system-manager-app`,
            classes: ["sheet", "journal-sheet", "journal-entry"],
            template: Properties.module.templates.craftingSystemManagementApp,
            resizable: true,
            width: 800,
            height: 680,
            dragDrop: [{ dragSelector: <string> null, dropSelector: <string> null }],
        };
    }

    protected async _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        super.render(force);
    }

    async getData(): Promise<any> {
        const GAME = new GameProvider().globalGameObject();
        const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key);
        return { craftingSystems };
    }

    _contextMenu(html: JQuery) {
        this._craftingSystemContextMenu = new ContextMenu(html, Properties.ui.apps.craftingSystemManager.contextMenu.selector, [
            {
                name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.create`,
                icon: `<i class="fas fa-plus"></i>`,
                callback: async (_element: JQuery) => {
                    console.log("Clickety");
                }
            }
        ]);
    }

}

export { CraftingSystemManagerApp }