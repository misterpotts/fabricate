import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {EditCraftingSystemDetailDialog} from "./EditCraftingSystemDetailDialog";
import {ComponentManagerApp} from "./ComponentManagerApp";
import {EditEssenceDialog} from "./EditEssenceDialog";
import {FabricateRegistry} from "../../registries/FabricateRegistry";
import {CraftingSystem} from "../../system/CraftingSystem";

class CraftingSystemManagerApp extends FormApplication {

    private _selectedSystem: CraftingSystem;
    private _activeTab: string;
    private _defaultTab: string = "components";

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
            width: 980,
            height: 840,
            dragDrop: [{ dragSelector: <string> null, dropSelector: <string> null }],
        };
    }

    protected async _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        console.log("update object");
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        if (this._selectedSystem?.id) {
            const fabricateRegistry = new FabricateRegistry(new GameProvider());
            this._selectedSystem = fabricateRegistry.getCraftingSystemById(this._selectedSystem.id);
        }
        super.render(force);
    }

    async getData(): Promise<any> {
        const fabricateRegistry = new FabricateRegistry(new GameProvider());
        const craftingSystems = fabricateRegistry.getAllCraftingSystems();
        if (!this._selectedSystem && craftingSystems.length > 0) {
            this._selectedSystem = craftingSystems[0];
        }
        return { craftingSystems: craftingSystems, selectedSystem: this._selectedSystem };
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);
        this._contextMenu(html);
        const rootElement = html[0];
        rootElement.addEventListener("click", this._onClick.bind(this));
        const tabs = new Tabs({
            navSelector: ".fabricate-crafting-system-navigation",
            contentSelector: ".fabricate-crafting-system-body",
            initial: this._activeTab ?? this._defaultTab,
            callback: () => {
                this._activeTab = tabs.active;
            }
        });
        tabs.bind(rootElement);
    }

    _onDrop(event: any) {
        if (!event.target.classList.contains("fabricate-drop-zone")) {
            return;
        }
        const dropTrigger = event?.target?.dataset?.dropTrigger;
        if (!dropTrigger) {
            return;
        }
        const systemId = event?.target?.dataset?.systemId as string;
        return this.handleUserAction(systemId, dropTrigger, event);
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
        const fabricateRegistry = new FabricateRegistry(new GameProvider());
        const targetSystem = fabricateRegistry.getCraftingSystemById(systemId); // todo: just use this._selectedSystem !
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
                await fabricateRegistry.saveCraftingSystem(targetSystem.mutate({enabled: true}));
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
            case "createEssence":
                new EditEssenceDialog(targetSystem).render();
                break;
            case "editEssence":
                const essenceIdToEdit = event?.target?.dataset?.essenceId;
                const essenceToEdit = targetSystem.essences.find(essence => essence.id === essenceIdToEdit);
                if (!essenceToEdit) {
                    throw new Error(`Essence with ID "${essenceIdToEdit}" does not exist.`);
                }
                new EditEssenceDialog(targetSystem, essenceToEdit.toEssenceDefinition()).render(); // todo: second arg can be essence, not essencedef
                break;
            case "deleteEssence":
                const essenceIdToDelete = event?.target?.dataset?.essenceId;
                const essenceToDelete = targetSystem.essences.find(essence => essence.id === essenceIdToDelete);
                if (!essenceToDelete) {
                    throw new Error(`Essence with ID "${essenceToDelete}" does not exist.`);
                }
                const craftingSystemDefinition = targetSystem.toSystemDefinition();
                delete craftingSystemDefinition.essences[essenceIdToDelete];
                await fabricateRegistry.defineCraftingSystem(craftingSystemDefinition);
                break;
            default:
                console.error(`An unrecognised action ("${action}") was triggered on the Fabricate Crafting System Manager Form Application.`);
        }
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
                    const fabricateRegistry = new FabricateRegistry(new GameProvider());
                    const systemToDelete = fabricateRegistry.getCraftingSystemById(systemId);
                    return systemToDelete && !systemToDelete.locked;
                },
                callback: async (element: JQuery) => {
                    const systemId = element.data()["systemId"] as string;
                    if (!systemId) {
                        console.error("Cannot delete system: no ID was provided. ");
                        return;
                    }
                    const gameProvider = new GameProvider();
                    const fabricateRegistry = new FabricateRegistry(gameProvider);
                    const systemToDelete = fabricateRegistry.getCraftingSystemById(systemId);
                    if (!systemToDelete) {
                        console.error(`Could not find system ${systemId}`);
                        return;
                    }
                    const GAME = gameProvider.globalGameObject();
                    Dialog.confirm({
                        title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.deleteSystemConfirm.title`),
                        content: `<p>${GAME.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.deleteSystemConfirm.content", {systemName: systemToDelete.name})}</p>`,
                        yes: () => {
                            fabricateRegistry.deleteSystem(systemId);
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
                    const fabricateRegistry = new FabricateRegistry(new GameProvider());
                    await fabricateRegistry.cloneSystem(systemId);
                    return;
                }
            }
        ]);
    }

}

export { CraftingSystemManagerApp }