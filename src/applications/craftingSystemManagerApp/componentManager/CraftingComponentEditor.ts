import {DropEventParser} from "../../common/DropEventParser";
import {DefaultDocumentManager, FabricateItemData} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {Component, SalvageConfig} from "../../../scripts/crafting/component/Component";
import {LocalizationService} from "../../common/LocalizationService";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {FabricateAPI} from "../../../scripts/api/FabricateAPI";
import {ComponentsStore} from "../../stores/ComponentsStore";

class CraftingComponentEditor {

    private readonly _fabricateAPI: FabricateAPI;
    private readonly _components: ComponentsStore;
    private readonly _localization: LocalizationService;
    private readonly  _localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.components`;

    constructor({
        localization,
        fabricateAPI,
        components
    }: {
        localization: LocalizationService;
        fabricateAPI: FabricateAPI;
        components: ComponentsStore;
    }) {
        this._localization = localization;
        this._fabricateAPI = fabricateAPI;
        this._components = components;
    }

    public async importComponent(event: any, selectedSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.component.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        if (!dropData.hasItemData) {
            return;
        }
        await this.createComponent(dropData.itemData, selectedSystem);
    }

    public async createComponent(itemData: FabricateItemData, selectedSystem: CraftingSystem): Promise<Component> {
        const component = await this._fabricateAPI.components.create({
            craftingSystemId: selectedSystem.id,
            itemUuid: itemData.uuid
        });
        this._components.insert(component);
        return component;
    }

    public async deleteComponent(event: any, component: Component, selectedSystem: CraftingSystem): Promise<Component | undefined> {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: this._localization.format(
                    `${this._localizationPath}.prompts.delete.title`,
                    {
                        componentName: component.name
                    }
                ),
                content: this._localization.format(
                    `${this._localizationPath}.prompts.delete.content`,
                    {
                        componentName: component.name,
                        systemName: selectedSystem.details.name
                    }
                )
            });
        }
        if (!doDelete) {
            return undefined;
        }
        const deletedComponent = await this._fabricateAPI.components.deleteById(component.id);
        this._components.remove(deletedComponent);
    }

    public async saveComponent(craftingComponent: Component): Promise<Component> {
        const savedComponent = await this._fabricateAPI.components.save(craftingComponent);
        this._components.insert(savedComponent);
        return savedComponent;
    }

    public async duplicateComponent(craftingComponent: Component): Promise<Component> {
        const duplicatedComponent = await this._fabricateAPI.components.cloneById(craftingComponent.id);
        this._components.insert(duplicatedComponent);
        return duplicatedComponent;
    }

    public async replaceItem(event: any, selectedComponent: Component): Promise<Component> {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.component.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        selectedComponent.itemData = dropData.itemData;
        const updatedComponent = await this._fabricateAPI.components.save(selectedComponent);
        this._components.insert(updatedComponent);
        return updatedComponent;
    }

    public async addSalvageOptionComponentAsCatalyst(event: any, selectedComponent: Component): Promise<Component> {
        const component = await this.getComponentFromDropEvent(event);
        selectedComponent.setSalvageOption(<SalvageConfig>{
            name: this.generateOptionName(selectedComponent),
            catalysts: { [ component.id ]: 1 },
            results: {}
        });
        await this.saveComponent(selectedComponent);
        return selectedComponent;
    }

    public async addSalvageOptionComponentAsSalvageResult(event: any, selectedComponent: Component): Promise<Component> {
        const component = await this.getComponentFromDropEvent(event);
        selectedComponent.setSalvageOption(<SalvageConfig>{
            name: this.generateOptionName(selectedComponent),
            catalysts: {},
            results: { [ component.id ]: 1 }
        });
        await this.saveComponent(selectedComponent);
        return selectedComponent;
    }

    // todo: prompt to import unknown items as components
    private async getComponentFromDropEvent(event: any): Promise<Component> {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: this._components.get(),
        });
        const component = (await dropEventParser.parse(event)).component;
        if (!component) {
            throw new Error("No component found in drop data.");
        }
        return component;
    }

    private generateOptionName(component: Component) {
        if (!component.isSalvageable) {
            return this._localization.format(`${Properties.module.id}.typeNames.component.salvageOption.name`, { number: 1 });
        }
        const existingNames = component.salvageOptions.all.map(salvageOption => salvageOption.name);
        let nextOptionNumber = 2;
        let nextOptionName;
        do {
            nextOptionName = this._localization.format(`${Properties.module.id}.typeNames.component.salvageOption.name`, { number: nextOptionNumber });
            nextOptionNumber++;
        } while (existingNames.includes(nextOptionName));
        return nextOptionName;
    }

}

export { CraftingComponentEditor }