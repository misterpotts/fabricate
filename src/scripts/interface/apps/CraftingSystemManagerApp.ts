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
                new CreateCraftingSystemDialog().render();
            break;
            case "selectCraftingSystem":
                const GAME = new GameProvider().globalGameObject();
                const systemId = event?.target?.dataset?.systemId || event?.target?.parentElement?.dataset?.systemId as string;
                const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
                const targetSystem = craftingSystems.find(system => system.id === systemId);
                if (!targetSystem) {
                    console.error(`The crafting system "${systemId}" was not found`);
                }
                this._selectedSystem = targetSystem;
                this.render();
                break;
            default:
                console.error("An unrecognised action was triggered on the Fabricate Crafting System Manager Form Application.");
        }
    }

    _saveState() {
        console.log("Save state");
    }

    _restoreState() {
        console.log("Restore state");
    }

    protected _contextMenu(html: JQuery) {
        const craftingSystemManagerApp = this;
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
                condition: (element: JQuery) => {
                    const systemId = element.data()["systemId"] as string;
                    const GAME = new GameProvider().globalGameObject();
                    const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
                    const systemToDelete = craftingSystems.find(system => system.id === systemId);
                    return systemToDelete && !systemToDelete.locked;
                },
                callback: async (element: JQuery) => {
                    const systemId = element.data()["systemId"] as string;
                    if (!systemId) {
                        console.error("Cannot delete system: no ID was provided. ");
                        return;
                    }
                    const GAME = new GameProvider().globalGameObject();
                    const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
                    const systemToDelete = craftingSystems.find(system => system.id === systemId);
                    if (!systemId) {
                        console.error(`Could not find system ${systemId}`);
                        return;
                    }
                    Dialog.confirm({
                        title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.deleteSystemConfirm.title`),
                        content: `<p>${GAME.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.deleteSystemConfirm.content", {systemName: systemToDelete.name})}</p>`,
                        yes: () => {
                            const survivingSystems = craftingSystems.filter(system => system.id !== systemId && system.locked);
                            GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, survivingSystems);
                        }
                    });
                    craftingSystemManagerApp._selectedSystem = null;
                    if (systemToDelete === this._selectedSystem) {
                        this._selectedSystem = null;
                    }
                    return;
                }
            },
            {
                name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.duplicate`,
                icon: `<i class="fa-solid fa-paste"></i>`,
                callback: async (element: JQuery) => {
                    const systemId = element.data()["systemId"] as string;
                    const GAME = new GameProvider().globalGameObject();
                    const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];

                    const systemToDuplicate = craftingSystems.find(system => system.id === systemId);
                    const duplicatedSystem = foundry.utils.deepClone(systemToDuplicate);
                    duplicatedSystem.id = randomID();
                    duplicatedSystem.name = `${duplicatedSystem.name} (copy)`
                    duplicatedSystem.locked = false;

                    craftingSystems.push(duplicatedSystem);
                    await GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, craftingSystems);
                    return;
                }
            }
        ]);
    }

}

export { CraftingSystemManagerApp }