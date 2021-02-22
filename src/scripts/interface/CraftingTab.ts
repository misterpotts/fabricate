import Properties from "../Properties";
import {Inventory} from "../game/Inventory";
import {Inventory5E} from "../dnd5e/Inventory5E";
import {InventoryRegistry} from "../registries/InventoryRegistry";
import {CraftingTabDTO} from "./CraftingTabDTO";
import {CraftingSystemRegistry} from "../registries/CraftingSystemRegistry";
import {CraftingComponent} from "../core/CraftingComponent";
import {CraftingSystem} from "../core/CraftingSystem";
import {InventoryRecordData} from "./InterfaceDataTypes";

class CraftingTab {
    private static readonly tabs: Map<string, CraftingTab> = new Map();

    private _sheetApplication: any;
    private _sheetHtml: any;
    private readonly _inventory: Inventory;
    private _suppressedInNav: boolean = false;
    private readonly _actor: Actor;
    private static tabKey: string = 'fabricate-crafting';

    public static bind(actorApplication: any, sheetHtml: HTMLElement, eventData: any): void {
        const actor: Actor = game.actors.get(eventData.actor._id);
        if (!game.user.isGM || !actor.owner ) {
            return;
        }
        let tab: CraftingTab = CraftingTab.tabs.get(actorApplication.id);
        if (!tab) {
            tab = new CraftingTab(actorApplication, actor);
            CraftingTab.tabs.set(actorApplication.id, tab);
        }
        tab.init(sheetHtml);
    }

    constructor(actorApplication: any, actor: Actor) {
        this._sheetApplication = actorApplication;
        this._actor = actor;
        let inventory = InventoryRegistry.getFor(actor.id);
        if (inventory) {
            this._inventory = inventory;
        } else {
            inventory = new Inventory5E(actor);
            InventoryRegistry.addFor(actor.id, inventory);
            this._inventory = inventory;
        }
    }

    private init(sheetHtml: any) {
        this._sheetHtml = sheetHtml;
        this.addTabToCharacterSheet(sheetHtml);
        this.render();
    }

    private async render(): Promise<void> {
        const craftingTabDTO = new CraftingTabDTO(CraftingSystemRegistry.getAllSystems(), this._inventory, this._actor);
        await craftingTabDTO.init();
        let template: HTMLElement = await renderTemplate(Properties.module.templates.craftingTab, craftingTabDTO);
        let element = this._sheetHtml.find('.crafting-tab-content');
        if (element && element.length) {
            element.replaceWith(template);
        } else {
            this._sheetHtml.find('.tab.fabricate-crafting').append(template);
        }

        this.handleActorSheetEvents(craftingTabDTO);

        if (this._suppressedInNav && !this.isActiveInNav()) {
            this._sheetApplication._tabs[0].activate(CraftingTab.tabKey);
            this._suppressedInNav = false;
        }

    }

    private addTabToCharacterSheet(sheetHtml: any): void {
        const tabs = sheetHtml.find(`.tabs[data-group="primary"]`);
        tabs.append($(
            '<a class="item fabricate-crafting" data-tab="fabricate-crafting">Crafting</a>'
        ));

        $(sheetHtml.find(`.sheet-body`)).append($(
            '<div class="tab fabricate-crafting" data-group="primary" data-tab="fabricate-crafting"></div>'
        ));
    }

    private handleActorSheetEvents(craftingTabDTO: CraftingTabDTO): void {

        this._sheetHtml.find('.add-crafting-component').click(async (event: any) => {

            const componentId = event.currentTarget.getAttribute('data-component-id');
            const craftingSystemId: string = craftingTabDTO.crafting.selectedSystemId;

            let hopperContentsForSystem: InventoryRecordData[] = this._actor.getFlag(Properties.module.name, `crafting.${craftingSystemId}.hopper`);
            if (!hopperContentsForSystem) {
                hopperContentsForSystem = [];
            }
            const component = hopperContentsForSystem.find((item: InventoryRecordData) => item.entryId === componentId);
            if (!component) {
                const component: CraftingComponent = CraftingSystemRegistry.getSystemByCompendiumPackKey(craftingSystemId).getComponentByPartId(componentId);
                hopperContentsForSystem.push({name: component.name, quantity: 1, imageUrl: component.imageUrl, entryId: component.partId})
            } else {
                component.quantity = component.quantity + 1;
            }

            this._actor.setFlag(Properties.module.name, `crafting.${craftingSystemId}.hopper`, hopperContentsForSystem);

            this._suppressedInNav = true;
            await this.render();

        });

        this._sheetHtml.find('.remove-crafting-component').click(async (event: any) => {

            const componentId = event.currentTarget.getAttribute('data-component-id');
            const craftingSystemId: string = craftingTabDTO.crafting.selectedSystemId;

            let hopperContentsForSystem: InventoryRecordData[] = this._actor.getFlag(Properties.module.name, `crafting.${craftingSystemId}.hopper`);
            const matchingRecord = hopperContentsForSystem.find((recordData: InventoryRecordData) => recordData.entryId === componentId);
            matchingRecord.quantity = matchingRecord.quantity - 1;
            const nonZeroRecords = hopperContentsForSystem.filter((recordData: InventoryRecordData) => recordData.quantity > 0);

            this._actor.setFlag(Properties.module.name, `crafting.${craftingSystemId}.hopper`, nonZeroRecords);

            this._suppressedInNav = true;
            await this.render();

        });

        this._sheetHtml.find('.clear-components.craft-button').click(async () => {
            const craftingSystemId: string = craftingTabDTO.crafting.selectedSystemId;
            await this._actor.unsetFlag(Properties.module.name, `crafting.${craftingSystemId}.hopper`);

            this._suppressedInNav = true;
            await this.render();
        });

        this._sheetHtml.find('.craft-from-components.craft-button').click(async () => {
            const craftingSystemId: string = craftingTabDTO.crafting.selectedSystemId;
            const hopperContents: InventoryRecordData[] = craftingTabDTO.inventory.preparedComponents;

            if (!hopperContents || hopperContents.length === 0) {
                return;
            }

            console.log(`Craft for system ${craftingSystemId} with ${hopperContents.length} components`);

            const craftingSystem: CraftingSystem = CraftingSystemRegistry.getSystemByCompendiumPackKey(craftingSystemId);
            const craftingComponents = hopperContents.map((hopperItem: InventoryRecordData) => craftingSystem.getComponentByPartId(hopperItem.entryId));

            await this._actor.unsetFlag(Properties.module.name, `crafting.${craftingSystemId}.hopper`);
            await craftingSystem.craftWithComponents(this._actor.id, craftingComponents);

            this._suppressedInNav = true;
            await this.render();
        });

        this._sheetHtml.find('select[name="fabricate.crafting.selectedSystem"]').change(async (event: any) => {
            const systemIdToActivate: string = event.target.value;
            await this._actor.setFlag(Properties.module.name, 'crafting.selectedSystemId', systemIdToActivate);

            this._suppressedInNav = true;
            await this.render();
        });

    }

    private isActiveInNav(): boolean {
        return $(this._sheetHtml).find(`a.fabricate-crafting[data-tab="${CraftingTab.tabKey}"]`).hasClass('active');
    }
}

export {CraftingTab}