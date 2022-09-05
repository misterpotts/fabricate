import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystemDefinition} from "../../system_definitions/CraftingSystemDefinition";
import {CreateCraftingSystemDialog} from "./CreateCraftingSystemDialog";

class CraftingSystemManagerApp extends FormApplication {

    private _selectedSystem: CraftingSystemDefinition;

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
        const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
        if (!this._selectedSystem && craftingSystems.length > 0) {
            this._selectedSystem = craftingSystems[0];
        }
        return { craftingSystems, selectedSystem: this._selectedSystem };
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);
        this._contextMenu(html);
        const rootElement = html[0];
        rootElement.addEventListener("click", this._onClick.bind(this));
    }

    async _onClick(event: any) {
        const action = event?.target?.dataset?.action || event?.target?.parentElement?.dataset?.action as string;
        if(!action) return;
        switch (action) {
            case "importCraftingSystem":
                console.log(event);
            break;
            case "createCraftingSystem":
                console.log(event);
                new CreateCraftingSystemDialog().render();
            break;
            case "selectCraftingSystem":
                console.log(event);
                break;
            default:
                console.error("An unrecognised action was triggered on the Fabricate Crafting System Manager App.");
        }
    }

    protected _contextMenu(html: JQuery) {
        new ContextMenu(html, ".fabricate-crafting-system", [
            {
                name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.export`,
                icon: `<i class="fa-solid fa-file-export"></i>`,
                callback: async (element: JQuery) => {
                    console.log(element.data()["systemId"]);
                }
            },
            {
                name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.delete`,
                icon: `<i class="fa-solid fa-trash"></i>`,
                callback: async (element: JQuery) => {
                    console.log(element.data()["systemId"]);
                }
            },
            {
                name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.duplicate`,
                icon: `<i class="fa-solid fa-paste"></i>`,
                callback: async (element: JQuery) => {
                    console.log(element.data()["systemId"]);
                }
            }
        ]);
    }

}

export { CraftingSystemManagerApp }