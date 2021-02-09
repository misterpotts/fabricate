import {ItemRecipeTab} from "./ItemRecipeTab";
import {CraftingTab} from "./CraftingTab";
import {InventoryRegistry} from "../systems/InventoryRegistry";
import {Inventory} from "../core/Inventory";
import {EssenceTypeIconConverter} from "../core/EssenceType";

class Registrar {

    public static init() {
        this.registerHandlebarsHelperFunctions();
        this.registerItemRecipeTab();
        this.registerActorCraftingTab();
        this.registerApplicationListeners()
    }

    private static registerHandlebarsHelperFunctions() {

        Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            // @ts-ignore
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });

        // @ts-ignore
        Handlebars.registerHelper('essenceIcon', function(arg1, arg2, options) {
            // @ts-ignore
            return EssenceTypeIconConverter.convertToIconMarkup(arg1);
        });

        // @ts-ignore
        Handlebars.registerHelper('essenceIconSeries', function(arg1, arg2, options) {
            // @ts-ignore
            return EssenceTypeIconConverter.convertSeriesToIconMarkup(arg1);
        });

    }

    private static registerActorCraftingTab() {

        Hooks.on('renderActorSheet5e', (sheetData: ItemSheet, sheetHtml: any, eventData: any) => {
            CraftingTab.bind(sheetData, sheetHtml, eventData);
        });

    }

    private static registerItemRecipeTab() {

        Hooks.on('renderItemSheet5e', (sheetData: ItemSheet, sheetHtml: any) => {
            ItemRecipeTab.bind(sheetData, sheetHtml);
        });

    }

    private static registerApplicationListeners() {

        Hooks.on('createOwnedItem', (actor: any) => {
            const inventory = InventoryRegistry.getFor(actor.id);
            if (inventory) {
                inventory.update();
            }
        });

        Hooks.on('deleteOwnedItem', (actor: any) => {
            const inventory = InventoryRegistry.getFor(actor.id);
            if (inventory) {
                inventory.update();
            }
        });

        Hooks.on('updateOwnedItem', async (actor: any, item: any, update: any) => {
            const inventory: Inventory = InventoryRegistry.getFor(actor.id);
            if (inventory) {
                if (typeof update.data !== 'undefined') {
                    await inventory.updateQuantityFor(item);
                }
            }
        });

    }
}

export {Registrar}