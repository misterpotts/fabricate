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

    async removeRecipeFromSelectedSystem(recipeId: string): Promise<SystemManagerModel> {
        await this._selected.system.deleteRecipeById(recipeId);
        return this;
    }

    async removeEssenceFromSelectedSystem(essenceId: string): Promise<SystemManagerModel> {
        await this._selected.system.deleteEssenceById(essenceId);
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
        const GAME = new GameProvider().globalGameObject();
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
                    }],
                    ["createRecipe", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const document: any = await new DefaultDocumentManager().getDocumentByUuid(actionData.document.uuid);
                        if (!currentState.selected.system.hasRecipe(document.uuid)) {
                            const recipe = new Recipe({
                                id: document.uuid,
                                name: document.name,
                                imageUrl: document.img
                            });
                            await currentState.selected.system.editRecipe(recipe);
                            return currentState;
                        }
                        return currentState;
                    }]
                ])
            }),
            clickHandler: new DefaultClickHandler({
                dataKeys: [
                    "systemId",
                    "componentId",
                    "recipeId",
                    "essenceId"
                ],
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
                        const craftingSystemTypeName = GAME.i18n.localize(`${Properties.module.id}.partTypes.system`);
                        const importActionHint = GAME.i18n.localize(`${Properties.module.id}.ImportCraftingSystemDialog.hintText`);
                        const content = await renderTemplate("templates/apps/import-data.html", {
                            hint1: GAME.i18n.format("DOCUMENT.ImportDataHint1", {document: craftingSystemTypeName}),
                            hint2: GAME.i18n.format("DOCUMENT.ImportDataHint2", {name: importActionHint})
                        });
                        new Dialog({
                            title: GAME.i18n.localize(`${Properties.module.id}.ImportCraftingSystemDialog.title`),
                            content: content,
                            default: "import",
                            buttons: {
                                import: {
                                    icon: '<i class="fas fa-file-import"></i>',
                                    label: GAME.i18n.localize(`${Properties.module.id}.ImportCraftingSystemDialog.buttons.import.label`),
                                    callback: async (html) => {
                                        // @ts-ignore
                                        const form = html.find("form")[0];
                                        if (!form.data.files.length) {
                                            const message = GAME.i18n.localize(`${Properties.module.id}.ImportCraftingSystemDialog.errors.noFileUploaded`);
                                            ui.notifications.error(message);
                                            throw new Error(message);
                                        }
                                        const fileData = await readTextFromFile(form.data.files[0]);
                                        try {
                                            const craftingSystemJson = JSON.parse(fileData);
                                            if (!craftingSystemJson.id) {
                                                craftingSystemJson.id = randomID();
                                            }
                                            const craftingSystem = await FabricateApplication.systemRegistry.createCraftingSystem(craftingSystemJson);
                                            const message = GAME.i18n.format(`${Properties.module.id}.ImportCraftingSystemDialog.info.success`, { systemName: craftingSystem.name});
                                            ui.notifications.info(message);
                                        } catch (e: any) {
                                            const message = GAME.i18n.localize(`${Properties.module.id}.ImportCraftingSystemDialog.errors.couldNotParseFile`);
                                            ui.notifications.error(message);
                                            throw new Error(message);
                                        }
                                    }
                                },
                                no: {
                                    icon: '<i class="fas fa-times"></i>',
                                    label: GAME.i18n.localize(`${Properties.module.id}.ImportCraftingSystemDialog.buttons.no.label`)
                                }
                            }
                        }, {
                            width: 400
                        }).render(true);
                    }],
                    ["removeComponent", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        if (!currentState.selected.system.hasComponent(componentId)) {
                            throw new Error(`Cannot delete Component with ID ${componentId}. It was not found in the System "${currentState.selected.system.name}". `);
                        }
                        const component = await currentState.selected.system.getComponentById(componentId);
                        if (actionData.keys.shift) {
                            await currentState.removeComponentFromSelectedSystem(componentId);
                            return currentState;
                        }
                        const doDelete = await Dialog.confirm({
                            title: GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.prompts.removeComponent.title`, {name: component.name}),
                            content: `<p>${GAME.i18n.localize(Properties.module.id + ".CraftingSystemManagerApp.prompts.removeComponent.content")}</p>`,
                        });
                        if (doDelete) {
                            await currentState.removeComponentFromSelectedSystem(componentId);
                        }
                        return currentState;
                    }],
                    ["deleteRecipe", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const recipeId = actionData.data.get("recipeId");
                        if (!currentState.selected.system.hasRecipe(recipeId)) {
                            throw new Error(`Cannot delete Recipe with ID ${recipeId}. It was not found in the System "${currentState.selected.system.name}". `);
                        }
                        const recipe = await currentState.selected.system.getRecipeById(recipeId);
                        if (actionData.keys.shift) {
                            await currentState.removeRecipeFromSelectedSystem(recipeId);
                            return currentState;
                        }
                        const doDelete = await Dialog.confirm({
                            title: GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.prompts.removeRecipe.title`, {name: recipe.name}),
                            content: `<p>${GAME.i18n.localize(Properties.module.id + ".CraftingSystemManagerApp.prompts.removeRecipe.content")}</p>`,
                        });
                        if (doDelete) {
                            await currentState.removeRecipeFromSelectedSystem(recipeId);
                        }
                        return currentState;
                    }],
                    ["editComponent", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        const component = await currentState.selected.system.getComponentById(componentId);
                        const componentManagerApp = await ComponentManagerAppFactory.make(component, currentState.selected.system);
                        await componentManagerApp.render();
                        return null;
                    }],
                    ["editRecipe", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const recipeId = actionData.data.get("recipeId");
                        const recipe = await currentState.selected.system.getRecipeById(recipeId);
                        const recipeManagerApp = await RecipeManagerAppFactory.make(recipe, currentState.selected.system);
                        await recipeManagerApp.render();
                        return null;
                    }],
                    ["createEssence", async (_actionData: ActionData, currentState: SystemManagerModel) => {
                        EditEssenceDialogFactory.make(currentState.selected.system).render();
                        return null;
                    }],
                    ["editEssence", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const essenceId = actionData.data.get("essenceId");
                        const essence = await currentState.selected.system.getEssenceById(essenceId);
                        EditEssenceDialogFactory.make(currentState.selected.system, essence).render();
                        return currentState;
                    }],
                    ["deleteEssence", async (actionData: ActionData, currentState: SystemManagerModel) => {
                        const essenceId = actionData.data.get("essenceId");
                        if (!currentState.selected.system.hasEssence(essenceId)) {
                            throw new Error(`Cannot delete Essence with ID ${essenceId}. It was not found in the System "${currentState.selected.system.name}". `);
                        }
                        const essence = await currentState.selected.system.getEssenceById(essenceId);
                        if (actionData.keys.shift) {
                            await currentState.removeEssenceFromSelectedSystem(essenceId);
                            return currentState;
                        }
                        const doDelete = await Dialog.confirm({
                            title: GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.prompts.removeEssence.title`, {name: essence.name}),
                            content: `<p>${GAME.i18n.localize(Properties.module.id + ".CraftingSystemManagerApp.prompts.removeEssence.content")}</p>`,
                        });
                        if (doDelete) {
                            await currentState.removeEssenceFromSelectedSystem(essenceId);
                        }
                        return currentState;
                    }]
                ])
            }),
            contextMenuDefinitions: [{
                selector: ".fabricate-crafting-system",
                entries: [
                    {
                        name: `${Properties.module.id}.CraftingSystemManagerApp.contextMenu.export`,
                        icon: `<i class="fa-solid fa-file-export"></i>`,
                        condition: (element: JQuery) => {
                            const locked = element.data()["locked"] as boolean;
                            return !locked;
                        },
                        callback: async (element: JQuery) => {
                            const systemId = element.data()["systemId"];
                            const GAME = new GameProvider().globalGameObject();
                            if (!systemId) {
                                const message = GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.errors.export.noIdProvided`);
                                ui.notifications.error(message);
                                throw new Error(message);
                            }
                            const craftingSystem = await FabricateApplication.systemRegistry.getCraftingSystemById(systemId);
                            if (!craftingSystem) {
                                const message = GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.errors.export.systemNotFound`, { systemId: systemId });
                                ui.notifications.error(message);
                                throw new Error(message);
                            }
                            const exportData = JSON.stringify(craftingSystem.toJson(), null, 2);
                            const fileName = `fabricate-crafting-system-${craftingSystem.name.slugify()}.json`
                            saveDataToFile(exportData, "application/json", fileName);
                            ui.notifications.info(GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.info.export.success`, { systemName: craftingSystem.name, fileName }))
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

export default new CraftingSystemManagerAppFactory();