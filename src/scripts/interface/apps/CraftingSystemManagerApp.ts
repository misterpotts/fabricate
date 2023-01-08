import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystem} from "../../system/CraftingSystem";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {SystemRegistry} from "../../registries/SystemRegistry";
import {DefaultDocumentManager} from "../../foundry/DocumentManager";
import FabricateApplication from "../FabricateApplication";
import {Recipe} from "../../crafting/Recipe";
import ComponentManagerAppFactory from "./ComponentManagerApp";
import RecipeManagerAppFactory from "./RecipeManagerApp";
import EditEssenceDialogFactory from "./EditEssenceDialog";
import EditCraftingSystemDetailDialogFactory from "./EditCraftingSystemDetailDialog";
import {
    ActionData,
    ApplicationWindow,
    DefaultClickHandler,
    DefaultDropHandler,
    StateManager
} from "./core/Applications";
import {Essence} from "../../common/Essence";

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
        const systems = Array.from(craftingSystems.values())
            .sort((left,right) => Number(right.locked) - Number(left.locked));
        if (!this._selectedSystem) {
            return {
                craftingSystems: systems
            }
        }
        return {
            craftingSystems: systems,
            selectedSystem: {
                id: this._selectedSystem.id,
                name: this._selectedSystem.details.name,
                author: this._selectedSystem.details.author,
                description: this._selectedSystem.details.description,
                summary: this._selectedSystem.details.summary,
                enabled: this._selectedSystem.enabled,
                locked: this._selectedSystem.locked,
                essences: await this._selectedSystem.getEssences(),
                components: await this._selectedSystem.getComponents(),
                recipes: await this._selectedSystem.getRecipes()
            }
        };
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
            // case "toggleSystemEnabled":
            //     const checked = event.target.checked;
            //     if (this._selectedSystem.enabled === checked) {
            //         return;
            //     }
            //     await this.systemRegistry.saveCraftingSystem(
            //         this._selectedSystem.setEnabled(checked)
            //     );
            //     await this.render();
            //     break;
            case "selectCraftingSystem":
                const systemToSelect = await this.systemRegistry.getCraftingSystemById(systemId);
                if (!systemToSelect) {
                    throw new Error(`Cannot select system. Crafting system with ID "${systemId}" not found. `);
                }
                this._selectedSystem = systemToSelect;
                await this.render();
                break;
            case "removeComponent": // todo: confirm dialog and remove references to the component from all recipes and items on delete
                const componentIdToDelete = event?.target?.dataset?.componentId;
                if (!componentIdToDelete) {
                    throw new Error("Cannot delete component. No ID was provided. ");
                }
                await this._selectedSystem.deleteComponentById(componentIdToDelete);
                await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                break;
            case "deleteRecipe":
                const recipeIdToDelete = event?.target?.dataset?.recipeId;
                if (!recipeIdToDelete) {
                    throw new Error("Cannot delete recipe. No ID was provided. ");
                }
                await this._selectedSystem.deleteRecipeById(recipeIdToDelete);
                await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                break;
            case "editComponent":
                const componentIdToEdit = event?.target?.dataset?.componentId;
                const componentToEdit = await this._selectedSystem.getComponentById(componentIdToEdit);
                if (!componentToEdit) {
                    throw new Error(`Cannot edit component. Component with ID "${componentIdToEdit}" not found. `);
                }
                const componentManagerApp = await ComponentManagerAppFactory.make(componentToEdit, this._selectedSystem);
                componentManagerApp.render();
                break;
            case "editRecipe":
                const recipeIdToEdit = event?.target?.dataset?.recipeId;
                const recipeToEdit = await this._selectedSystem.getRecipeById(recipeIdToEdit);
                if (!recipeToEdit) {
                    throw new Error(`Cannot edit recipe. Recipe with ID "${recipeIdToEdit}" not found. `);
                }
                const recipeManagerApp = await RecipeManagerAppFactory.make(recipeToEdit, this._selectedSystem);
                recipeManagerApp.render();
                break;
            case "createRecipe":
                try {
                    const data: any = JSON.parse(event.dataTransfer?.getData("text/plain"));
                    if (Properties.module.documents.supportedTypes.indexOf(data.type) < 0) {
                        return;
                    }
                    const document: any = await new DefaultDocumentManager().getDocumentByUuid(data.uuid);
                    if (!this._selectedSystem.hasRecipe(document.uuid)) {
                        const recipe = new Recipe({
                            id: document.uuid,
                            name: document.name,
                            imageUrl: document.img
                        });
                        await this._selectedSystem.editRecipe(recipe);
                        await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    }
                } catch (e: any) {
                    console.warn(`Something was dropped onto a Fabricate drop zone, 
                        but the drop event was not able to be processed. 
                        Caused by: ${e.message ?? e}`);
                }
                break;
            case "createComponent":
                try {
                    const data: any = JSON.parse(event.dataTransfer?.getData("text/plain"));
                    if (Properties.module.documents.supportedTypes.indexOf(data.type) < 0) {
                        return;
                    }
                    const document: any = await new DefaultDocumentManager().getDocumentByUuid(data.uuid);
                    if (!this._selectedSystem.hasComponent(document.uuid)) {
                        const craftingComponent = new CraftingComponent({
                            id: document.uuid,
                            name: document.name,
                            imageUrl: document.img,
                            essences: Combination.EMPTY(),
                            salvage: Combination.EMPTY()
                        });
                        await this._selectedSystem.editComponent(craftingComponent);
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
                if (!this._selectedSystem.hasEssence(essenceIdToEdit)) {
                    throw new Error(`Essence with ID "${essenceIdToEdit}" does not exist.`);
                }
                const essenceToEdit = await this._selectedSystem.getEssenceById(essenceIdToEdit);
                EditEssenceDialogFactory.make(this._selectedSystem, essenceToEdit).render();
                break;
            case "deleteEssence": // todo: confirm dialog and remove references to the essence from all recipes and items on delete
                const essenceIdToDelete = event?.target?.dataset?.essenceId;
                await this._selectedSystem.deleteEssenceById(essenceIdToDelete);
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

interface SystemManagerView {

    selectedSystem: {
        id: string,
        name: string,
        summary: string,
        description: string,
        author: string
        enabled: boolean,
        locked: boolean,
        essences: Essence[],
        components: CraftingComponent[],
        recipes: Recipe[]
    };
    craftingSystems: CraftingSystem[];

}

interface LoadedSystem {
    system: CraftingSystem;
    parts: {
        components: CraftingComponent[],
        recipes: Recipe[],
        essences: Essence[]
    };
}

class SystemManagerModel {

    private _selected?: LoadedSystem;
    private readonly _embeddedSystems: Map<string, CraftingSystem>;
    private readonly _userDefinedSystems: Map<string, CraftingSystem>;

    constructor({
        selectedSystem,
        embeddedSystems,
        userDefinedSystems
    } :{
        selectedSystem?: LoadedSystem,
        embeddedSystems: Map<string, CraftingSystem>;
        userDefinedSystems: Map<string, CraftingSystem>;
    }) {
        this._selected = selectedSystem;
        this._embeddedSystems = embeddedSystems;
        this._userDefinedSystems = userDefinedSystems;
    }

    get selected(): LoadedSystem {
        return this._selected;
    }

    get embeddedSystems(): Map<string, CraftingSystem> {
        return this._embeddedSystems;
    }

    get userDefinedSystems(): Map<string, CraftingSystem> {
        return this._userDefinedSystems;
    }

    get craftingSystems(): CraftingSystem[] {
        return Array.from(this._embeddedSystems.values())
            .concat(Array.from(this._userDefinedSystems.values()))
            .sort((left,right) => Number(right.locked) - Number(left.locked));
    }

    async selectSystem(systemId?: string): Promise<SystemManagerModel> {
        const allCraftingSystems = new Map(this.craftingSystems.map(craftingSystem => [craftingSystem.id, craftingSystem]));
        if (systemId && !allCraftingSystems.has(systemId)) {
            throw new Error(`Cannot select crafting system with ID "${systemId}" as it does not exist! `);
        }
        if (allCraftingSystems.size === 0) {
            this._selected = null;
            return this;
        }
        const craftingSystem = systemId ? allCraftingSystems.get(systemId) : this.craftingSystems[0];
        this._selected = {
            system: craftingSystem,
            parts: {
                components: await craftingSystem.getComponents(),
                essences: await craftingSystem.getEssences(),
                recipes: await craftingSystem.getRecipes()
            }
        };
        return this;
    }

    hasSelectedSystem() {
        return !!this._selected;
    }

    enableSelectedSystem(): SystemManagerModel {
        const selectedSystem = this._selected?.system;
        if (!selectedSystem) {
            throw new Error("Cannot enable selected system: No crafting system was selected");
        }
        selectedSystem.enable();
        return this;
    }

    disableSelectedSystem(): SystemManagerModel {
        const selectedSystem = this._selected?.system;
        if (!selectedSystem) {
            throw new Error("Cannot enable selected system: No crafting system was selected");
        }
        selectedSystem.disable();
        return this;
    }

    async removeComponentFromSelectedSystem(componentId: string): Promise<SystemManagerModel> {
        await this._selected.system.deleteComponentById(componentId);
        return this;
    }

    deleteSystemById(systemId: string): SystemManagerModel {
        if (!this.userDefinedSystems.has(systemId)) {
            throw new Error(`Cannot delete Crafting System "${systemId}". It was not found! `);
        }
        this.userDefinedSystems.delete(systemId);
        return this;
    }

    cloneCraftingSystemById(systemId: string): SystemManagerModel {
        const sourceCraftingSystem = this.craftingSystems.find(system => system.id === systemId);
        if (!sourceCraftingSystem) {
            throw new Error(`Cannot clone Crafting System "${systemId}". It was not found! `);
        }
        const clonedCraftingSystem = sourceCraftingSystem.clone({
            id: randomID(),
            name: `${sourceCraftingSystem.name} (copy)`,
            locked: false
        });
        this._userDefinedSystems.set(clonedCraftingSystem.id, clonedCraftingSystem);
        return this;
    }
}

class SystemStateManager implements StateManager<SystemManagerView, SystemManagerModel> {

    private _model: SystemManagerModel;
    private readonly _systemRegistry: SystemRegistry;

    constructor({model, systemRegistry}: {model: SystemManagerModel; systemRegistry?: SystemRegistry}) {
        this._model = model;
        this._systemRegistry = systemRegistry ?? FabricateApplication.systemRegistry;
    }

    getModelState(): SystemManagerModel {
        return this._model;
    }

    getViewData(): SystemManagerView {
        if (!this._model.hasSelectedSystem()) {
            return {
                craftingSystems: this._model.craftingSystems,
                selectedSystem: null
            };
        }
        return {
            craftingSystems: this._model.craftingSystems,
            selectedSystem: {
                id: this._model.selected.system.id,
                name: this._model.selected.system.details.name,
                summary: this._model.selected.system.details.summary,
                description: this._model.selected.system.details.description,
                author: this._model.selected.system.details.author,
                enabled: this._model.selected.system.enabled,
                locked: this._model.selected.system.locked,
                essences: this._model.selected.parts.essences,
                components: this._model.selected.parts.components,
                recipes: this._model.selected.parts.recipes
            }
        };
    }

    async load(): Promise<SystemManagerModel> {
        const userDefinedSystems = await this._systemRegistry.getUserDefinedSystems();
        const embeddedSystems = await this._systemRegistry.getEmbeddedSystems();
        const loadedModelState = new SystemManagerModel({
            embeddedSystems,
            userDefinedSystems
        });
        const selectedSystemId = this._model.selected?.system?.id;
        await loadedModelState.selectSystem(selectedSystemId);
        this._model = loadedModelState;
        return loadedModelState;
    }

    async save(model: SystemManagerModel): Promise<SystemManagerModel> {
        await this._systemRegistry.saveCraftingSystems(model.userDefinedSystems);
        return this.getModelState();
    }

}

class CraftingSystemManagerAppFactory {

    public async make({
        embeddedSystems,
        userDefinedSystems
    }: {
        embeddedSystems: Map<string, CraftingSystem>,
        userDefinedSystems: Map<string, CraftingSystem>
    }): Promise<ApplicationWindow<SystemManagerView, SystemManagerModel>> {
        const model = new SystemManagerModel({embeddedSystems, userDefinedSystems});
        const systemStateManager = new SystemStateManager({model});
        await systemStateManager.load();
        const gameObject = new GameProvider().globalGameObject();
        return new ApplicationWindow({
            stateManager: systemStateManager,
            dropHandler: new DefaultDropHandler({
                actions: new Map([
                    ["createComponent", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const document: any = await new DefaultDocumentManager().getDocumentByUuid(actionData.document.uuid);
                        if (!currentState.selected.system.hasComponent(document.uuid)) {
                            const craftingComponent = new CraftingComponent({
                                id: document.uuid,
                                name: document.name,
                                imageUrl: document.img,
                                essences: Combination.EMPTY(),
                                salvage: Combination.EMPTY()
                            });
                            await currentState.selected.system.editComponent(craftingComponent);
                            return currentState;
                        }
                    }]
                ])
            }),
            clickHandler: new DefaultClickHandler({
                dataKeys: ["systemId", "componentId"],
                actions: new Map([
                    ["selectCraftingSystem", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        await currentState.selectSystem(actionData.data.get("systemId"));
                        return null;
                    }],
                    ["editDetails", async (_actionData: ActionData, currentState: SystemManagerModel) => {
                        EditCraftingSystemDetailDialogFactory.make(currentState.selected.system).render();
                        return currentState;
                    }],
                    ["createCraftingSystem", async (_actionData: ActionData, currentState: SystemManagerModel) => {
                        EditCraftingSystemDetailDialogFactory.make().render();
                        return currentState;
                    }],
                    ["toggleSystemEnabled", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        if (actionData.checked) {
                            return currentState.enableSelectedSystem()
                        }
                        return currentState.disableSelectedSystem();
                    }],
                    ["importCraftingSystem", async (_actionData: ActionData, _currentState: SystemManagerModel) => {
                        throw new Error("Import is not implemented. ");
                    }],
                    ["removeComponent", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        if (!currentState.selected.system.hasComponent(componentId)) {
                            throw new Error(`Cannot delete Component with ID ${componentId}. It was not found in the System "${currentState.selected.system.name}". `);
                        }
                        const component = await currentState.selected.system.getComponentById(componentId);
                        const doDelete = await Dialog.confirm({
                            title: gameObject.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.prompts.removeComponent.title`, {name: component.name}),
                            content: `<p>${gameObject.i18n.localize(Properties.module.id + ".CraftingSystemManagerApp.prompts.removeComponent.content")}</p>`,
                        });
                        if (doDelete) {
                            await currentState.removeComponentFromSelectedSystem(componentId);
                        }
                        return currentState;
                    }],
                    //["name", async (_actionData: ActionData, currentState: SystemManagerModel) => { return currentState; }],
                    //             case "removeComponent": // todo: confirm dialog and remove references to the component from all recipes and items on delete
                    //                 const componentIdToDelete = event?.target?.dataset?.componentId;
                    //                 if (!componentIdToDelete) {
                    //                     throw new Error("Cannot delete component. No ID was provided. ");
                    //                 }
                    //                 await this._selectedSystem.deleteComponentById(componentIdToDelete);
                    //                 await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    //                 break;
                    //             case "deleteRecipe":
                    //                 const recipeIdToDelete = event?.target?.dataset?.recipeId;
                    //                 if (!recipeIdToDelete) {
                    //                     throw new Error("Cannot delete recipe. No ID was provided. ");
                    //                 }
                    //                 await this._selectedSystem.deleteRecipeById(recipeIdToDelete);
                    //                 await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    //                 break;
                    //             case "editComponent":
                    //                 const componentIdToEdit = event?.target?.dataset?.componentId;
                    //                 const componentToEdit = await this._selectedSystem.getComponentById(componentIdToEdit);
                    //                 if (!componentToEdit) {
                    //                     throw new Error(`Cannot edit component. Component with ID "${componentIdToEdit}" not found. `);
                    //                 }
                    //                 const componentManagerApp = await ComponentManagerAppFactory.make(componentToEdit, this._selectedSystem);
                    //                 componentManagerApp.render();
                    //                 break;
                    //             case "editRecipe":
                    //                 const recipeIdToEdit = event?.target?.dataset?.recipeId;
                    //                 const recipeToEdit = await this._selectedSystem.getRecipeById(recipeIdToEdit);
                    //                 if (!recipeToEdit) {
                    //                     throw new Error(`Cannot edit recipe. Recipe with ID "${recipeIdToEdit}" not found. `);
                    //                 }
                    //                 const recipeManagerApp = await RecipeManagerAppFactory.make(recipeToEdit, this._selectedSystem);
                    //                 recipeManagerApp.render();
                    //                 break;
                    //             case "createRecipe":
                    //                 try {
                    //                     const data: any = JSON.parse(event.dataTransfer?.getData("text/plain"));
                    //                     if (Properties.module.documents.supportedTypes.indexOf(data.type) < 0) {
                    //                         return;
                    //                     }
                    //                     const document: any = await new DefaultDocumentManager().getDocumentByUuid(data.uuid);
                    //                     if (!this._selectedSystem.hasRecipe(document.uuid)) {
                    //                         const recipe = new Recipe({
                    //                             id: document.uuid,
                    //                             name: document.name,
                    //                             imageUrl: document.img
                    //                         });
                    //                         await this._selectedSystem.editRecipe(recipe);
                    //                         await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    //                     }
                    //                 } catch (e: any) {
                    //                     console.warn(`Something was dropped onto a Fabricate drop zone,
                    //                         but the drop event was not able to be processed.
                    //                         Caused by: ${e.message ?? e}`);
                    //                 }
                    //                 break;
                    //             case "createComponent":
                    //                 try {
                    //                     const data: any = JSON.parse(event.dataTransfer?.getData("text/plain"));
                    //                     if (Properties.module.documents.supportedTypes.indexOf(data.type) < 0) {
                    //                         return;
                    //                     }
                    //                     const document: any = await new DefaultDocumentManager().getDocumentByUuid(data.uuid);
                    //                     if (!this._selectedSystem.hasComponent(document.uuid)) {
                    //                         const craftingComponent = new CraftingComponent({
                    //                             id: document.uuid,
                    //                             name: document.name,
                    //                             imageUrl: document.img,
                    //                             essences: Combination.EMPTY(),
                    //                             salvage: Combination.EMPTY()
                    //                         });
                    //                         await this._selectedSystem.editComponent(craftingComponent);
                    //                         await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    //                     }
                    //                 } catch (e: any) {
                    //                     console.warn(`Something was dropped onto a Fabricate drop zone,
                    //                         but the drop event was not able to be processed.
                    //                         Caused by: ${e.message ?? e}`);
                    //                 }
                    //                 break;
                    //             case "createEssence":
                    //                 EditEssenceDialogFactory.make(this._selectedSystem).render();
                    //                 break;
                    //             case "editEssence":
                    //                 const essenceIdToEdit = event?.target?.dataset?.essenceId;
                    //                 if (!this._selectedSystem.hasEssence(essenceIdToEdit)) {
                    //                     throw new Error(`Essence with ID "${essenceIdToEdit}" does not exist.`);
                    //                 }
                    //                 const essenceToEdit = await this._selectedSystem.getEssenceById(essenceIdToEdit);
                    //                 EditEssenceDialogFactory.make(this._selectedSystem, essenceToEdit).render();
                    //                 break;
                    //             case "deleteEssence": // todo: confirm dialog and remove references to the essence from all recipes and items on delete
                    //                 const essenceIdToDelete = event?.target?.dataset?.essenceId;
                    //                 await this._selectedSystem.deleteEssenceById(essenceIdToDelete);
                    //                 await this.systemRegistry.saveCraftingSystem(this._selectedSystem);
                    //                 break;
                ])
            }),
            contextMenuDefinitions: [{
                selector: ".fabricate-crafting-system",
                entries: [
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
                            const systemToDelete = systemStateManager.getModelState().userDefinedSystems.get(systemId);
                            if (!systemToDelete) {
                                console.error(`Could not find system ${systemId}`);
                                return;
                            }
                            const GAME = gameProvider.globalGameObject();
                            await Dialog.confirm({
                                title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.deleteSystemConfirm.title`),
                                content: `<p>${GAME.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.deleteSystemConfirm.content", {systemName: systemToDelete.name})}</p>`,
                                yes: () => {
                                    const model = systemStateManager.getModelState().deleteSystemById(systemId);
                                    model.selectSystem();
                                    systemStateManager.save(model);
                                }
                            });
                            return;
                        }
                    },
                    {
                        name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.duplicate`,
                        icon: `<i class="fa-solid fa-paste"></i>`,
                        callback: async (element: JQuery) => {
                            const systemId = element.data()["systemId"] as string;
                            const model = systemStateManager.getModelState().cloneCraftingSystemById(systemId);
                            return systemStateManager.save(model);
                        }
                    }
                ]
            }],
            options: {
                title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
                id: `${Properties.module.id}-crafting-system-manager`,
                classes: ["sheet", "journal-sheet", "journal-entry"],
                template: Properties.module.templates.craftingSystemManagementApp,
                resizable: true,
                width: 920,
                height: 740,
                tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "components"}],
                dragDrop: [{dragSelector: ".fabricate-draggable", dropSelector: ".fabricate-drop-zone"}]
            }
        });
    }

}

export { CraftingSystemManagerApp, CraftingSystemManagerAppFactory }