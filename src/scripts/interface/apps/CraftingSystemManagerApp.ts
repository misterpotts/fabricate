import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystemDefinition} from "../../system_definitions/CraftingSystemDefinition";
import {EditCraftingSystemDetailDialog} from "./EditCraftingSystemDetailDialog";
import {ComponentManagerApp} from "./ComponentManagerApp";

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
        console.log("update object");
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
        const tabs = new Tabs({
            navSelector: ".fabricate-crafting-system-navigation",
            contentSelector: ".fabricate-crafting-system-body",
            initial: "components",
            callback: () => {}
        });
        tabs.bind(rootElement);
    }

    _onDrop(event: any) {
        if (!event.target.classList.contains("fabricate-drop-zone")) {
            return;
        }
        const action = event?.target?.dataset?.action;
        if (!action) {
            return;
        }
        const systemId = event?.target?.dataset?.systemId as string;
        return this.handleUserAction(systemId, action, event);
    }

    async _onClick(event: any) {
        const action = event?.target?.dataset?.action || event?.target?.parentElement?.dataset?.action as string;
        if(!action) {
            return;
        }
        const systemId = event?.target?.dataset?.systemId || event?.target?.parentElement?.dataset?.systemId as string;
        return this.handleUserAction(systemId, action, event);
    }

    private async handleUserAction(systemId: string, action: string, event: any) {
        const GAME = new GameProvider().globalGameObject();
        const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
        const targetSystem = craftingSystems.find(system => system.id === systemId);
        switch (action) {
            case "editDetails":
                if (!targetSystem) {
                    console.error(`The crafting system "${systemId}" was not found`);
                }
                new EditCraftingSystemDetailDialog(targetSystem).render();
                break;
            case "importCraftingSystem":
                console.log(event);
                break;
            case "createCraftingSystem":
                new EditCraftingSystemDetailDialog().render();
                break;
            case "toggleSystemEnabled":
                if (!targetSystem) {
                    console.error(`The crafting system "${systemId}" was not found`);
                }
                const isEnabled = event.target.checked;
                if (targetSystem.enabled === isEnabled) {
                    return;
                }
                targetSystem.enabled = isEnabled;
                const updatedSystems = craftingSystems.map(system => {
                    if (system.id !== systemId) {
                        return system;
                    }
                    return targetSystem;
                });
                await GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, updatedSystems);
                this.render();
                break;
            case "selectCraftingSystem":
                if (!targetSystem) {
                    console.error(`The crafting system "${systemId}" was not found`);
                }
                this._selectedSystem = targetSystem;
                this.render();
                break;
            case "createComponent":
                if (event instanceof PointerEvent) {
                    new ComponentManagerApp().render();
                    return;
                }
                try {
                    const data: any = JSON.parse(event.dataTransfer?.getData("text/plain"));
                    if (Properties.module.documents.supportedTypes.indexOf(data.type) < 0) {
                        return;
                    }
                    new ComponentManagerApp(data.uuid).render();
                } catch (e: any) {
                    console.warn(`Something was dropped onto a Fabricate drop zone, 
                        but the drop event was not able to be processed. 
                        Caused by: ${e.message ?? e}`);
                }
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
                            const survivingSystems = craftingSystems.filter(system => system.id !== systemId || system.locked);
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