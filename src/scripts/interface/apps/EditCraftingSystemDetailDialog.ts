import {FormApplicationWindow, FormError, StateManager, SubmissionHandler} from "./core/Applications";
import {CraftingSystem, CraftingSystemJson} from "../../system/CraftingSystem";
import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import FabricateApplication from "../FabricateApplication";
import {CraftingSystemDetails, CraftingSystemDetailsJson} from "../../system/CraftingSystemDetails";
import {CraftingSystemFactory} from "../../system/CraftingSystemFactory";

class CraftingSystemModel {

    private readonly _factory: CraftingSystemFactory;
    private _system: CraftingSystem;

    constructor({
        system,
        factory
    }: {
        system: CraftingSystem;
        factory: CraftingSystemFactory;
    }) {
        this._system = system;
        this._factory = factory;
    }

    get system(): CraftingSystem {
        return this._system;
    }

    set system(value: CraftingSystem) {
        this._system = value;
    }

    public editDetails(value: CraftingSystemDetails): CraftingSystemModel {
        this._system.setDetails(value);
        return this;
    }

    public async createWithDetails(details: CraftingSystemDetailsJson): Promise<CraftingSystemModel> {
        this._system = await this._factory.make({
            id: randomID(),
            details,
            locked: false,
            enabled: true,
            parts: {
                essences: {},
                recipes: {},
                components: {}
            }
        });
        return this;
    }

}

class CraftingSystemStateManager implements StateManager<CraftingSystemJson, CraftingSystemModel> {

    private readonly _model: CraftingSystemModel;

    constructor({
        system,
        factory
    }: {
        system: CraftingSystem;
        factory: CraftingSystemFactory
    }) {
        this._model = new CraftingSystemModel({system, factory});
    }

    getModelState(): CraftingSystemModel {
        return this._model;
    }

    getViewData(): CraftingSystemJson {
        if (this._model.system) {
            return this._model.system.toJson();
        }
        const GAME = new GameProvider().globalGameObject();
        return {
            id: randomID(),
            details: {
                name: "",
                summary: "",
                description: "",
                author: GAME.user.name
            },
            locked: false,
            enabled: true,
            parts: {
                essences: {},
                components: {},
                recipes: {}
            }
        }
    }

    load(): Promise<CraftingSystemModel> {
        return Promise.resolve(undefined);
    }

    async save(model: CraftingSystemModel): Promise<CraftingSystemModel> {
        this._model.system = await FabricateApplication.systemRegistry.saveCraftingSystem(model.system);
        return this._model;
    }

}

class CraftingSystemDetailSubmissionHandler implements SubmissionHandler<CraftingSystemDetailsJson, CraftingSystemModel> {

    async process(formData: CraftingSystemDetailsJson, currentState: CraftingSystemModel): Promise<CraftingSystemModel> {
        if (currentState.system) {
            return currentState.editDetails(new CraftingSystemDetails({
                name: formData.name,
                description: formData.description,
                author: formData.author,
                summary: formData.summary
            }));
        }
        return currentState.createWithDetails(formData);
    }

    validate(formData: CraftingSystemDetailsJson): FormError[] {
                const GAME = new GameProvider().globalGameObject();
        const errors: Array<FormError> = [];
        if (!formData.name || formData.name.length === 0) {
            errors.push({
                detail: GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.errors.nameRequired`),
                field: "Name"
            })
        }
        if (!formData.summary || formData.summary.length === 0) {
            errors.push({
                detail: GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.errors.summaryRequired`),
                field: "Summary"
            })
        }
        return errors;
    }

}

class EditCraftingSystemDetailDialogFactory {

    make(system?: CraftingSystem): FormApplicationWindow<CraftingSystemJson, CraftingSystemModel, CraftingSystemDetailsJson> {
        const GAME = new GameProvider().globalGameObject();
        return new FormApplicationWindow({
            options: {
                title: GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.title`),
                id: `${Properties.module.id}-create-crafting-system-dialog`,
                template: Properties.module.templates.editCraftingSystemDetailDialog,
                width: 400,
            },
            stateManager: new CraftingSystemStateManager({system, factory: new CraftingSystemFactory({})}),
            submissionHandler: new CraftingSystemDetailSubmissionHandler()
        });
    }

}

export default new EditCraftingSystemDetailDialogFactory();