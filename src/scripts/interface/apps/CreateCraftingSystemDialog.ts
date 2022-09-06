import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystemDefinition} from "../../system_definitions/CraftingSystemDefinition";
import {CraftingSystemDefinitionValidator} from "../../system_definitions/CraftingSystemDefinitionValidator";

class CreateCraftingSystemDialog extends FormApplication {

    constructor() {
        super(null);
    }
    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.CreateCraftingSystemDialog.title`),
            id: `${Properties.module.id}-create-crafting-system-dialog`,
            template: Properties.module.templates.CreateCraftingSystemDialog,
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
            id: "",
            name: "",
            summary: "",
            description: ""
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
        const GAME = new GameProvider().globalGameObject();
        const craftingSystems = GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as CraftingSystemDefinition[];
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
        const validationResult = CraftingSystemDefinitionValidator.validate(systemDefinition);
        if (!validationResult.isValid) {
            console.error(`Crafting system validation errors: ${validationResult.errors}`);
            const message = GAME.i18n.localize(`${Properties.module.id}.CreateCraftingSystemDialog.errors.invalidSystemDefinition`);
            ui.notifications.error(message);
            return;
        }
        craftingSystems.push(systemDefinition);
        await GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, craftingSystems);
        await this.close();
        return formData;
    }

    validate(formData: any): Array<string> {
        const GAME = new GameProvider().globalGameObject();
        const errors: Array<string> = [];
        if (!formData.name || formData.name.length === 0) {
            errors.push(GAME.i18n.localize(`${Properties.module.id}.CreateCraftingSystemDialog.errors.nameRequired`))
        }
        if (!formData.summary || formData.summary.length === 0) {
            errors.push(GAME.i18n.localize(`${Properties.module.id}.CreateCraftingSystemDialog.errors.summaryRequired`))
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

export { CreateCraftingSystemDialog }