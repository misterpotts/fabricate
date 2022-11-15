import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {Essence} from "../../common/Essence";
import {CraftingSystem} from "../../system/CraftingSystem";
import FabricateApplication from "../FabricateApplication";

class EditEssenceDialog extends FormApplication {

    private readonly _craftingSystem: CraftingSystem;
    private readonly _essence?: Essence;

    constructor(craftingSystem: CraftingSystem, essence?: Essence) {
        super(null);
        this._craftingSystem = craftingSystem;
        this._essence = essence;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.EditEssenceDialog.title`),
            id: `${Properties.module.id}-essence-manager`,
            template: Properties.module.templates.EssenceManagerApp,
            width: 380,
        };
    }

    protected _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        console.log("Update object");
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        super.render(force);
    }

    async _onSubmit(event: Event, options: FormApplication.OnSubmitOptions): Promise<any> {
        event.preventDefault();
        const formData = foundry.utils.expandObject(this._getSubmitData(options?.updateData));

        const errors = this.validate(formData);
        if (errors.length > 0) {
            ui.notifications.error(this.formatErrorMessage(errors));
            return;
        }
        await this.createOrUpdateEssence(formData);
        await this.close();
        return formData;
    }

    async createOrUpdateEssence({
        name,
        description,
        iconCode,
        tooltip
    }: {
        name: string,
        description?: string,
        iconCode: string,
        tooltip?: string
    }): Promise<CraftingSystem> {
        if (!this._craftingSystem) {
            throw new Error(`The crafting system with ID "${this._craftingSystem?.id}" does not exist.`)
        }
        const essence = new Essence({
            name,
            description,
            tooltip,
            id: this._essence?.id ?? randomID(),
            iconCode: iconCode ? iconCode : Properties.ui.defaults.essenceIconCode
        });
        this._craftingSystem.partDictionary.editEssence(essence);
        return FabricateApplication.systemRegistry.saveCraftingSystem(this._craftingSystem);
    }

    validate(formData: any): Array<string> {
        const GAME = new GameProvider().globalGameObject();
        const errors: Array<string> = [];
        if (!formData.name || formData.name.length === 0) {
            errors.push(GAME.i18n.localize(`${Properties.module.id}.EditEssenceDialog.errors.nameRequired`))
        }
        return errors;
    }

    formatErrorMessage(errors: Array<string>): string {
        if (errors.length === 1) {
            return `${Properties.module.label} | ${errors[0]}`;
        }
        const errorDetail = errors.map((error, index) => `${index + 1}) ${error}`)
            .join(", ");
        const GAME = new GameProvider().globalGameObject();
        const localizationPath = `${Properties.module.id}.ui.notifications.submissionError.prefix`
        return `${Properties.module.label} | ${GAME.i18n.localize(localizationPath)}: ${errorDetail}`
    }

    async getData(): Promise<any> {
        return {
            name: this._essence?.name ?? "",
            description: this._essence?.description ?? "",
            iconCode: this._essence?.iconCode ?? "",
            tooltip: this._essence?.tooltip ??  ""
        };
    }

}

export { EditEssenceDialog }