import Properties from "../Properties";
import {Inventory} from "../core/Inventory";
import {Inventory5E} from "../dnd5e/Inventory5E";
import {CraftingSystemRegistry} from "../systems/CraftingSystemRegistry";

class CraftingTab {
    private static readonly tabs: Map<string, CraftingTab> = new Map();

    private _sheetHtml: any;
    private _inventory: Inventory;

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
        let inventory = CraftingSystemRegistry.getManagedInventoryForActor(actor.id);
        if (inventory) {
            this._inventory = inventory;
        } else {
            inventory = new Inventory5E(actor);
            CraftingSystemRegistry.addManagedInventoryForActor(actor.id, inventory);
        }
        this._inventory = inventory;
        this._inventory = new Inventory5E(actor);
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
            this._sheetHtml.find('.tab.fabricate-recipe').append(template);
        }
    }

    private addTabToCharacterSheet(sheetHtml: any): void {
        let tabs = sheetHtml.find(`form nav.sheet-navigation.tabs`);
        tabs.append($(
            '<a class="item" data-tab="fabricate">Crafting</a>'
        ));

        $(sheetHtml.find(`.sheet-body`)).append($(
            '<div class="tab fabricate-recipe" data-group="primary" data-tab="fabricate"></div>'
        ));
    }
}

export {CraftingTab}