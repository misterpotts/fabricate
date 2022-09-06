import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystemDefinition} from "../../system_definitions/CraftingSystemDefinition";
import {CraftingSystemDefinitionValidator} from "../../system_definitions/CraftingSystemDefinitionValidator";

class EditCraftingSystemDetailDialog extends FormApplication {

    private readonly _craftingSystem: CraftingSystemDefinition;

    constructor(craftingSystem?: CraftingSystemDefinition) {
        super(null);
        this._craftingSystem = craftingSystem;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.title`),
            id: `${Properties.module.id}-create-crafting-system-dialog`,
            template: Properties.module.templates.EditCraftingSystemDetailDialog,
            width: 400,
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
        return {
            name: this._craftingSystem?.name ?? "",
            summary: this._craftingSystem?.summary ?? "",
            description: this._craftingSystem?.description ?? ""
        };
    }

    async _onSubmit(event: Event, options: FormApplication.OnSubmitOptions): Promise<any> {
        event.preventDefault();
        const formData = foundry.utils.expandObject(this._getSubmitData(options?.updateData));
        const errors = this.validate(formData);
        if (errors.length > 0) {
            ui.notifications.error(this.formatErrorMessage(errors));
            return;
        }
        if (!this._craftingSystem) {
            await this.createCraftingSystem(formData);
        } else {
            await this.editCraftingSystemDetails(formData);
        }
        await this.close();
        return formData;
    }

    private editCraftingSystemDetails(formData: any) {
        this._craftingSystem.name = formData.name;
        this._craftingSystem.summary = formData.summary;
        this._craftingSystem.description = formData.description;
        return this.saveCraftingSystem(this._craftingSystem);
    }

    private async createCraftingSystem(formData: any) {
        const GAME = new GameProvider().globalGameObject();
        const systemDefinition: CraftingSystemDefinition = {
            id: randomID(),
            name: formData.name,
            summary: formData.summary,
            description: formData.description,
            locked: false,
            gameSystem: "NONE",
            compendia: [],
            author: GAME.user.name,
            enabled: true,
            essences: [],
            hasCraftingChecks: false
        };
        return this.saveCraftingSystem(systemDefinition);
    }

    async saveCraftingSystem(systemDefinition: CraftingSystemDefinition) {
        const GAME = new GameProvider().globalGameObject();
        const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
        const validationResult = CraftingSystemDefinitionValidator.validate(systemDefinition);
        if (!validationResult.isValid) {
            console.error(`Crafting system validation errors: ${validationResult.errors}`);
            const message = GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.errors.invalidSystemDefinition`);
            ui.notifications.error(message);
            return;
        }
        if (!craftingSystems.find(system => system.id === systemDefinition.id)) {
            craftingSystems.push(systemDefinition);
            return GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, craftingSystems);
        }
        const updatedCraftingSystems = craftingSystems.filter(system => system.id !== systemDefinition.id);
        updatedCraftingSystems.push(systemDefinition);
        return GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, updatedCraftingSystems);
    }

    validate(formData: any): Array<string> {
        const GAME = new GameProvider().globalGameObject();
        const errors: Array<string> = [];
        if (!formData.name || formData.name.length === 0) {
            errors.push(GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.errors.nameRequired`))
        }
        if (!formData.summary || formData.summary.length === 0) {
            errors.push(GAME.i18n.localize(`${Properties.module.id}.EditCraftingSystemDetailDialog.errors.summaryRequired`))
        }
        return errors;
    }

    formatErrorMessage(errors: Array<string>): string {
        if (errors.length === 1) {
            return `${Properties.module.label} | ${errors[0]}`;
        }
        const errorDetail = errors.map((error, index) => `${index + 1}) ${error}`)
            .join(", ");
        return `${Properties.module.label} | There were some problems with your form: ${errorDetail}`
    }

}

export { EditCraftingSystemDetailDialog }