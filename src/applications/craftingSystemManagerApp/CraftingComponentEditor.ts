import {CraftingSystemEditor} from "./CraftingSystemEditor";
import {DropEventParser} from "../common/DropEventParser";
import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
import Properties from "../../scripts/Properties";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";
import {LocalizationService} from "../common/LocalizationService";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";

class CraftingComponentEditor {

    private readonly _craftingSystemEditor: CraftingSystemEditor;
    private readonly _localizationService: LocalizationService;
    private readonly  _localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.components`;

    constructor({
        craftingSystemEditor,
        localizationService
    }: {
        craftingSystemEditor: CraftingSystemEditor;
        localizationService: LocalizationService;
    }) {
        this._craftingSystemEditor = craftingSystemEditor;
        this._localizationService = localizationService;
    }

    public async importComponent(event: any, selectedSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localizationService,
            documentManager: new DefaultDocumentManager(),
            partType: this._localizationService.localize(`${Properties.module.id}.typeNames.component.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        const itemData = dropData.itemData;
        if (selectedSystem.includesComponentByItemUuid(itemData.uuid)) {
            const existingComponent = selectedSystem.getComponentByItemUuid(itemData.uuid);
            const message = this._localizationService.format(
                `${this._localizationPath}.errors.import.itemAlreadyIncluded`,
                {
                    itemUuid: itemData.uuid,
                    componentName: existingComponent.name,
                    systemName: selectedSystem.name
                }
            );
            ui.notifications.warn(message);
            return;
        }
        const craftingComponent = new CraftingComponent({
            id: randomID(),
            itemData: itemData
        });
        selectedSystem.editComponent(craftingComponent);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        const message = this._localizationService.format(
            `${this._localizationPath}.component.imported`,
            {
                componentName: craftingComponent.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
    }

    public async deleteComponent(event: any, component: CraftingComponent, selectedSystem: CraftingSystem) {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: this._localizationService.format(
                    `${this._localizationPath}.prompts.delete.title`,
                    {
                        componentName: component.name
                    }
                ),
                content: this._localizationService.format(
                    `${this._localizationPath}.prompts.delete.content`,
                    {
                        componentName: component.name,
                        systemName: selectedSystem.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        selectedSystem.deleteComponentById(component.id);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        const message = this._localizationService.format(
            `${this._localizationPath}.component.deleted`,
            {
                componentName: component.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
    }

    public async saveComponent(craftingComponent: CraftingComponent, selectedSystem: CraftingSystem) {
        selectedSystem.editComponent(craftingComponent);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
    }

    public async duplicateComponent(craftingComponent: CraftingComponent, selectedSystem: CraftingSystem): Promise<CraftingComponent> {
        const clonedComponent = craftingComponent.clone(randomID());
        selectedSystem.editComponent(clonedComponent);
        await this._craftingSystemEditor.saveCraftingSystem(selectedSystem);
        return clonedComponent;
    }

}

export { CraftingComponentEditor }