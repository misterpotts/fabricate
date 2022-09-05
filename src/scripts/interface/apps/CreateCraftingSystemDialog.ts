import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";

class CreateCraftingSystemDialog extends FormApplication {

    constructor() {
        super(null);
    }
    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemCreationDialog.title`),
            id: `${Properties.module.id}-create-crafting-system-dialog`,
            template: Properties.module.templates.craftingSystemCreationDialog,
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
            id: randomID(),
            name: "My New Crafting System",
            summary: "A short summary of the new crafting system for the sidebar",
            description: "A more detailed description of the lore and mechanics of your new crafting system"
        };
    }

}

export { CreateCraftingSystemDialog }