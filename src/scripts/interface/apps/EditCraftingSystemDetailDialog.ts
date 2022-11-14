import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystem, CraftingSystemJson} from "../../system/CraftingSystem";
import FabricateApplication from "../FabricateApplication";
import {CraftingSystemDetails} from "../../system/CraftingSystemDetails";

class EditCraftingSystemDetailDialog extends FormApplication {

    private readonly _craftingSystem: CraftingSystem;

    constructor(craftingSystem?: CraftingSystem) {
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
        console.log("Update object");
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        super.render(force);
    }

    async getData(): Promise<any> {
        const GAME = new GameProvider().globalGameObject();
        return {
            name: this._craftingSystem?.name ?? "",
            summary: this._craftingSystem?.summary ?? "",
            description: this._craftingSystem?.description ?? "",
            author: this._craftingSystem?.author ?? GAME.user.name
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

    private async editCraftingSystemDetails(editedDetails: { name: string, summary: string, description: string, author: string }) {
        this._craftingSystem.setDetails(new CraftingSystemDetails(editedDetails));
        await FabricateApplication.systemRegistry.saveCraftingSystem(this._craftingSystem);
    }

    private async createCraftingSystem({ name, summary, description, author}: {name: string, summary: string, description: string, author: string}) {
        const gameProvider = new GameProvider();
        // todo: add more detail;s for checks and alchemy as those are defined in the UI with macros
        const systemDefinition: CraftingSystemJson = {
            id: randomID(),
            details: {
                name,
                summary,
                description,
                author: author ?? gameProvider.globalGameObject().user.name,
            },
            locked: false,
            enabled: true,
            parts: {
                essences: {},
                components: {},
                recipes: {}
            }
        };
        await FabricateApplication.systemRegistry.createCraftingSystem(systemDefinition);
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
        const GAME = new GameProvider().globalGameObject();
        const localizationPath = `${Properties.module.id}.ui.notifications.submissionError.prefix`
        return `${Properties.module.label} | ${GAME.i18n.localize(localizationPath)}: ${errorDetail}`
    }

}

export { EditCraftingSystemDetailDialog }