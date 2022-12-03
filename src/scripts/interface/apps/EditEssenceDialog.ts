import {FormApplicationWindow, FormError, StateManager, SubmissionHandler} from "./core/Applications";
import {CraftingSystem} from "../../system/CraftingSystem";
import {Essence} from "../../common/Essence";
import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import FabricateApplication from "../FabricateApplication";

interface EssenceView {

    name: string;
    description: string;
    iconCode: string;
    tooltip: string;

}

class EssenceModel {

    private readonly _system: CraftingSystem;
    private _essence?: Essence;

    constructor({
        essence,
        system
    }: {
        system: CraftingSystem,
        essence: Essence
    }) {
        this._system = system;
        this._essence = essence;
    }

    get system(): CraftingSystem {
        return this._system;
    }

    get essence(): Essence {
        return this._essence;
    }

    public editEssence(value: Essence): EssenceModel {
        this._essence = value;
        this._system.partDictionary.editEssence(value);
        return this;
    }

}

class EssenceStateManager implements StateManager<EssenceView, EssenceModel> {

    private _model: EssenceModel;

    constructor({
        essence,
        system
    }: {
        essence?: Essence,
        system: CraftingSystem}) {
        this._model = new EssenceModel({essence, system});
    }

    getModelState(): EssenceModel {
        return this._model;
    }

    getViewData(): EssenceView {
        const name: string = this.essence?.name ?? "";
        return {
            name,
            description: this.essence?.description ?? "",
            iconCode: this.essence?.iconCode ? this.essence.iconCode : Properties.ui.defaults.essenceIconCode,
            tooltip: this.essence?.tooltip ? this.essence.tooltip : name
        };
    }

    get essence(): Essence {
        return this._model.essence;
    }

    load(): Promise<EssenceModel> {
        return Promise.resolve(undefined);
    }

    async save(): Promise<EssenceModel> {
        const system = await FabricateApplication.systemRegistry.saveCraftingSystem(this._model.system);
        this._model = new EssenceModel({system, essence: system.getEssenceById(this._model.essence.id)});
        return this._model;
    }

}

class EssenceSubmissionHandler implements SubmissionHandler<EssenceView, EssenceModel> {

    async process(formData: EssenceView, currentState: EssenceModel): Promise<EssenceModel> {
        const modifiedEssence = new Essence({
            name: formData.name,
            description: formData.description,
            tooltip: formData.tooltip ? formData.tooltip : formData.name,
            id: currentState.essence?.id ?? randomID(),
            iconCode: formData.iconCode ? formData.iconCode : Properties.ui.defaults.essenceIconCode
        });
        return currentState.editEssence(modifiedEssence);
    }

    validate(formData: EssenceView): FormError[] {
        const GAME = new GameProvider().globalGameObject();
        const errors: Array<FormError> = [];
        if (!formData.name || formData.name.length === 0) {
            errors.push({
                field: "name",
                detail: GAME.i18n.localize(`${Properties.module.id}.EditEssenceDialog.errors.nameRequired`)
            })
        }
        return errors;
    }

}

class EditEssenceDialogFactory {

    make(system: CraftingSystem, essence?: Essence): FormApplicationWindow<EssenceView, EssenceModel, EssenceView> {
        return new FormApplicationWindow({
            options: {
                title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.EditEssenceDialog.title`),
                id: `${Properties.module.id}-essence-manager`,
                template: Properties.module.templates.editEssenceDialog,
                width: 380,
            },
            stateManager: new EssenceStateManager({essence, system}),
            submissionHandler: new EssenceSubmissionHandler()
        });
    }

}

export default new EditEssenceDialogFactory();