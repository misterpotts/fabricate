import {CraftingSystem} from "../system/CraftingSystem";
import FabricateApplication from "./FabricateApplication";
import {EssenceDefinition} from "../common/EssenceDefinition";
import {CraftingTab} from "../interface/CraftingTab";
import {ItemRecipeTab} from "../interface/ItemRecipeTab";
import {CraftingSystemDefinition} from "../registries/system_definitions/interface/CraftingSystemDefinition";
import Properties from "../Properties";


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

        const convertEssenceSlugToIconMarkup = (essenceSlug: string, systemId: string) => {
            const system: CraftingSystem = FabricateApplication.systems.getSystemById(systemId);
            const essenceDefinition: EssenceDefinition = system.getEssenceBySlug(essenceSlug);
            if (essenceDefinition) {
                return essenceDefinition.icon;
            }
            return essenceSlug;
        };

        Handlebars.registerHelper('essenceIcon', function(arg1, arg2) {
            return convertEssenceSlugToIconMarkup(arg1, arg2);
        });

        // @ts-ignore
        Handlebars.registerHelper('essenceIconSeries', function(arg1, arg2) {
            return arg1.map((essence: string) => convertEssenceSlugToIconMarkup(essence, arg2)).join(', ');
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

    }

    public static registerCraftingSystemSettings(systemSpec: CraftingSystemDefinition) {
        const globalGameObject = new GameProvider().globalGameObject();
        globalGameObject.settings.register(Properties.module.name, Properties.settingsKeys.craftingSystem.enabled(systemSpec.id), {
            name: systemSpec.name,
            hint: systemSpec.summary,
            scope: "world",
            type: Boolean,
            default: true,
            config: true,
            onChange: (enabled: boolean) => {FabricateApplication.systems.getSystemById(systemSpec.id).enabled = enabled; }
        });
    }
}

export {FabricateLifecycle}