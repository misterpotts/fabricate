import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {EssenceDefinition} from "../../common/Essence";
import {FabricateRegistry} from "../../registries/FabricateRegistry";
import {CraftingSystem} from "../../system/CraftingSystem";

class EditEssenceDialog extends FormApplication {

    private readonly _craftingSystem: CraftingSystem;
    private readonly _essenceDefinition: EssenceDefinition;

    constructor(craftingSystem: CraftingSystem, essenceDefinition?: EssenceDefinition) {
        super(null);
        this._craftingSystem = craftingSystem;
        this._essenceDefinition = essenceDefinition;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.EditEssenceDialog.title`),
            id: `${Properties.module.id}-essence-manager`,
            template: Properties.module.templates.EssenceManagerApp,
            width: 500,
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
        await this.modifyEssenceDefinition(formData);
        await this.close();
        return formData;
    }

    modifyEssenceDefinition({
        name, description, iconCode, tooltip
    }: {
        name: string, description?: string, iconCode: string, tooltip?: string
    }) {
        if (!this._craftingSystem) {
            throw new Error(`The crafting system with ID "${this._craftingSystem?.id}" does not exist.`)
        }
        const craftingSystemDefinition = this._craftingSystem.toSystemDefinition();
        const id = this._essenceDefinition?.id ? this._essenceDefinition.id : randomID();
        craftingSystemDefinition.essences[id] = {
            id,
            name,
            description,
            iconCode: iconCode?.length > 0 ? iconCode : Properties.ui.defaults.essenceIconCode,
            tooltip: tooltip?.length > 0 ? tooltip : name
        };
        const fabricateRegistry = new FabricateRegistry(new GameProvider());
        return fabricateRegistry.defineCraftingSystem(craftingSystemDefinition);
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
            name: this._essenceDefinition?.name ?? "",
            description: this._essenceDefinition?.description ?? "",
            iconCode: this._essenceDefinition?.iconCode ?? "",
            tooltip: this._essenceDefinition?.tooltip ??  ""
        };
    }

}

export { EditEssenceDialog }