import Properties from "../Properties";
import {Inventory} from "../core/Inventory";
import {Inventory5E} from "../dnd5e/Inventory5E";
import {InventoryRegistry} from "../registries/InventoryRegistry";

class CraftingTab {
    private static readonly tabs: Map<string, CraftingTab> = new Map();

    private _sheetHtml: any;
    private _inventory: Inventory;
    private _suppressedInNav: boolean = false;

    public static bind(itemSheet: ItemSheet, sheetHtml: HTMLElement, eventData: any): void {
        const actor: any = game.actors.get(eventData.actor._id);
        if (!game.user.isGM || !actor.owner ) {
            return;
        }
        let tab: CraftingTab = CraftingTab.tabs.get(itemSheet.id);
        if (!tab) {
            tab = new CraftingTab();
            CraftingTab.tabs.set(itemSheet.id, tab);
        }
        tab.init(sheetHtml, actor);
    }

    private init(sheetHtml: any, actor: any) {
        let inventory = InventoryRegistry.getFor(actor.id);
        if (inventory) {
            this._inventory = inventory;
        } else {
            inventory = new Inventory5E(actor);
            InventoryRegistry.addFor(actor.id, inventory);
            this._inventory = inventory;
        }
        this._sheetHtml = sheetHtml;
        this.addTabToCharacterSheet(sheetHtml);
        this.render();
    }

    private async render(): Promise<void> {
        let template: HTMLElement = await renderTemplate(Properties.module.templates.craftingTab, {inventory: this._inventory});
        let element = this._sheetHtml.find('.recipe-tab-content');
        if (element && element.length) {
            element.replaceWith(template);
        } else {
            this._sheetHtml.find('.tab.fabricate-crafting').append(template);
        }
        if (this._suppressedInNav && !this.isActiveInNav()) {
            this._sheetHtml.find('.item[data-tab="fabricate-crafting"]').addClass('active');
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

    private isActiveInNav(): boolean {
        return $(this._sheetHtml).find('a.fabricate-item[data-tab="magicitems"]').hasClass('active');
    }
}

export {CraftingTab}