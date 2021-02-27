import {ItemRecipeTab} from "../interface/ItemRecipeTab";
import {CraftingTab} from "../interface/CraftingTab";
import {Inventory} from "../game/Inventory";
import {EssenceTypeIconConverter} from "../core/EssenceType";
import {CraftingSystemSpecification} from "../core/CraftingSystemSpecification";
import Properties from "../Properties";
import FabricateApplication from "./FabricateApplication";

class FabricateLifecycle {

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
        Handlebars.registerHelper('essenceIcon', function(arg1) {
            // @ts-ignore
            return EssenceTypeIconConverter.convertToIconMarkup(arg1);
        });

        // @ts-ignore
        Handlebars.registerHelper('essenceIconSeries', function(arg1) {
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
            const inventory = FabricateApplication.inventories.getFor(actor.id);
            if (inventory) {
                inventory.update();
            }
        });

        Hooks.on('deleteOwnedItem', (actor: any) => {
            const inventory = FabricateApplication.inventories.getFor(actor.id);
            if (inventory) {
                inventory.update();
            }
        });

        Hooks.on('updateOwnedItem', async (actor: any, item: any, update: any) => {
            const inventory: Inventory = FabricateApplication.inventories.getFor(actor.id);
            if (inventory) {
                if (typeof update.data !== 'undefined') {
                    await inventory.updateQuantityFor(item);
                }
            }
        });

    }

    public static registerCraftingSystemSettings(systemSpec: CraftingSystemSpecification) {
        game.settings.register(Properties.module.name, Properties.settingsKeys.craftingSystem.enabled(systemSpec.compendiumPackKey), {
            name: systemSpec.name,
            hint: systemSpec.enableHint,
            scope: "world",
            type: Boolean,
            default: true,
            config: true,
            onChange: (enabled: boolean) => {FabricateApplication.systems.getSystemByCompendiumPackKey(systemSpec.compendiumPackKey).enabled = enabled; }
        });
    }
}

export {FabricateLifecycle}