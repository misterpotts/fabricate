import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystem} from "../../system/CraftingSystem";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {SystemRegistry} from "../../registries/SystemRegistry";
import {DefaultDocumentManager} from "../../foundry/DocumentManager";
import FabricateApplication from "../FabricateApplication";
import {Recipe} from "../../crafting/Recipe";
import {PartDictionary} from "../../system/PartDictionary";
import EditComponentDialogFactory from "./EditComponentDialog";
import EditEssenceDialogFactory from "./EditEssenceDialog";
import EditCraftingSystemDetailDialogFactory from "./EditCraftingSystemDetailDialogFactory";

class CraftingSystemManagerApp extends FormApplication {

    private readonly systemRegistry: SystemRegistry;

    private _selectedSystem: CraftingSystem;
    private _activeTab: string;
    private _defaultTab: string = "components";

    constructor() {
        super(null);
        this.systemRegistry = FabricateApplication.systemRegistry;
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
            width: 920,
            height: 740,
            dragDrop: [{ dragSelector: <string> null, dropSelector: <string> null }],
        };
    }

    protected async _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        console.log("update object");
        await this.render();
        return undefined;
    }

    async render(force: boolean = true) {
        if (this._selectedSystem?.id) {
            this._selectedSystem = await this.systemRegistry.getCraftingSystemById(this._selectedSystem.id);
            await this._selectedSystem?.loadPartDictionary();
        }
        super.render(force);
    }

    async getData(): Promise<any> {
        const craftingSystems = await this.systemRegistry.getAllCraftingSystems();
        if (!this._selectedSystem && craftingSystems.size > 0) {
            this._selectedSystem = Array.from(craftingSystems.values())[0];
        }
        await this._selectedSystem?.loadPartDictionary();
        return {
            craftingSystems: Array.from(craftingSystems.values()),
            selectedSystem: {
                id: this._selectedSystem.id,
                name: this._selectedSystem.details.name,
                author: this._selectedSystem.details.author,
                description: this._selectedSystem.details.description,
                summary: this._selectedSystem.details.summary,
                enabled: this._selectedSystem.enabled,
                locked: this._selectedSystem.locked,
                essences: this._selectedSystem.essences,
                components: this._selectedSystem.components.map(component => this.buildComponentViewData(component, this._selectedSystem.partDictionary)),
                recipes: this._selectedSystem.recipes.map(recipe => this.buildRecipeViewData(recipe, this._selectedSystem.partDictionary))
            }
        };
    }

    private buildComponentViewData(component: CraftingComponent, partDictionary: PartDictionary) {
        return {
            id: component.id,
            name: component.name,
            imageUrl: component.imageUrl,
            essences: component.essences.toUnits().map(unit => { return { part: partDictionary.getEssence(unit.part.elementId), quantity: unit.quantity } }),
            salvage: component.salvage.toUnits().map(unit => { return { part: partDictionary.getComponent(unit.part.elementId), quantity: unit.quantity } })
        }
    }

    private buildRecipeViewData(recipe: Recipe, partDictionary: PartDictionary) {
        return {
            id: recipe.id,
            name: recipe.name,
            imageUrl: recipe.imageUrl,
            catalysts: recipe.catalysts.toUnits().map(unit => { return { part: partDictionary.getComponent(unit.part.elementId), quantity: unit.quantity } }),
            essences: recipe.essences.toUnits().map(unit => { return { part: partDictionary.getEssence(unit.part.elementId), quantity: unit.quantity } }),
            ingredientGroups: recipe.ingredientGroups.map(group => group.members.toUnits().map(unit => { return { part: partDictionary.getComponent(unit.part.elementId), quantity: unit.quantity } })),
            resultGroups: recipe.ingredientGroups.map(group => group.members.toUnits().map(unit => { return { part: partDictionary.getComponent(unit.part.elementId), quantity: unit.quantity } }))
        }
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
        switch (action) {
            case "editDetails":
                EditCraftingSystemDetailDialogFactory.make(this._selectedSystem).render();
                break;
            case "importCraftingSystem":
                console.log(event);
                break;
            case "createCraftingSystem":
                EditCraftingSystemDetailDialogFactory.make().render();
                break;
            case "toggleSystemEnabled":
                const checked = event.target.checked;
                if (this._selectedSystem.enabled === checked) {
                    return;
                }
                await this.systemRegistry.saveCraftingSystem(
                    this._selectedSystem.setEnabled(checked)
                );
                await this.render();
                break;
            case "selectCraftingSystem":
                const systemToSelect = await this.systemRegistry.getCraftingSystemById(systemId);
                if (!systemToSelect) {
                    throw new Error(`Cannot select system. Crafting system with ID "${systemId}" not found. `);
                }
                this._selectedSystem = systemToSelect;
                await this.render();
                break;
            case "removeComponent":
                const componentIdToDelete = event?.target?.dataset?.componentId;
                if (!componentIdToDelete) {
                    throw new Error("Cannot delete component. No ID was provided. ");
                }
                this._selectedSystem.partDictionary.deleteComponentById(componentIdToDelete);
                await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                break;
            case "editComponent":
                const componentIdToEdit = event?.target?.dataset?.componentId;
                const componentToEdit = this._selectedSystem.partDictionary.getComponent(componentIdToEdit);
                if (!componentToEdit) {
                    throw new Error(`Cannot edit component. Component with ID "${componentIdToEdit}" not found. `);
                }
                EditComponentDialogFactory.make(componentToEdit, this._selectedSystem).render();
                break;
            case "createComponent":
                try {
                    const data: any = JSON.parse(event.dataTransfer?.getData("text/plain"));
                    if (Properties.module.documents.supportedTypes.indexOf(data.type) < 0) {
                        return;
                    }
                    const document: any = await new DefaultDocumentManager().getDocumentByUuid(data.uuid);
                    if (!this._selectedSystem.partDictionary.hasComponent(document.uuid)) {
                        const craftingComponent = new CraftingComponent({
                            id: document.uuid,
                            name: document.name,
                            imageUrl: document.img,
                            essences: Combination.EMPTY(),
                            salvage: Combination.EMPTY()
                        });
                        this._selectedSystem.partDictionary.addComponent(craftingComponent);
                        await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    }
                } catch (e: any) {
                    console.warn(`Something was dropped onto a Fabricate drop zone, 
                        but the drop event was not able to be processed. 
                        Caused by: ${e.message ?? e}`);
                }
                break;
            case "createEssence":
                EditEssenceDialogFactory.make(this._selectedSystem).render();
                break;
            case "editEssence":
                const essenceIdToEdit = event?.target?.dataset?.essenceId;
                const essenceToEdit = this._selectedSystem.essences.find(essence => essence.id === essenceIdToEdit);
                if (!essenceToEdit) {
                    throw new Error(`Essence with ID "${essenceIdToEdit}" does not exist.`);
                }
                EditEssenceDialogFactory.make(this._selectedSystem, essenceToEdit).render();
                break;
            case "deleteEssence":
                const essenceIdToDelete = event?.target?.dataset?.essenceId;
                this._selectedSystem.partDictionary.deleteEssenceById(essenceIdToDelete);
                await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
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
                    const locked = element.data()["locked"] as boolean;
                    return !locked;
                },
                callback: async (element: JQuery) => {
                    const systemId = element.data()["systemId"] as string;
                    if (!systemId) {
                        console.error("Cannot delete system: no ID was provided. ");
                        return;
                    }
                    const gameProvider = new GameProvider();
                    const systemToDelete = await craftingSystemManagerApp.systemRegistry.getCraftingSystemById(systemId);
                    if (!systemToDelete) {
                        console.error(`Could not find system ${systemId}`);
                        return;
                    }
                    const GAME = gameProvider.globalGameObject();
                    Dialog.confirm({
                        title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.deleteSystemConfirm.title`),
                        content: `<p>${GAME.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.deleteSystemConfirm.content", {systemName: systemToDelete.name})}</p>`,
                        yes: () => {
                            craftingSystemManagerApp.systemRegistry.deleteCraftingSystemById(systemId);
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
                    await craftingSystemManagerApp.systemRegistry.cloneCraftingSystemById(systemId)
                    return;
                }
            }
        ]);
    }

}

export { CraftingSystemManagerApp }