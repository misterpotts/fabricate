import Properties from "../Properties";
import FabricateApplication from "../application/FabricateApplication";
import {Document} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import {AnyDocumentData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/data.mjs";
import {CraftingSystem} from "../system/CraftingSystem";
import {Inventory} from "../actor/Inventory";
import {Recipe} from "../crafting/Recipe";
import {FabricateCompendiumData} from "../compendium/CompendiumData";

class ItemRecipeTab {
    private static readonly tabs: Map<string, ItemRecipeTab> = new Map();

    // @ts-ignore
    private _sheetApplication: any;
    private _sheetHtml: any;
    private readonly _item: any;
    private readonly _owned: boolean;
    private readonly _recipe: Recipe;
    private readonly _craftingSystem: CraftingSystem;
    private readonly _inventory: Inventory;
    private readonly  _actor: any;
    private _suppressedInNav: boolean = false;
    private static tabKey: string = 'fabricate-recipe';

    public static bind(itemApplication: any, sheetHtml: any): void {
        if (!itemApplication.item.data.flags.fabricate) {
            return;
        }
        const fabricateFlags: FabricateCompendiumData = itemApplication.item.data.flags.fabricate;
        if (fabricateFlags.type === Properties.types.recipe) {
            let tab: ItemRecipeTab = ItemRecipeTab.tabs.get(itemApplication.id);
            if (!tab) {
                tab = new ItemRecipeTab(itemApplication);
                ItemRecipeTab.tabs.set(itemApplication.id, tab);
            }
            tab.init(sheetHtml);
        }
        if (fabricateFlags.type === Properties.types.component && fabricateFlags.component.essences && fabricateFlags.component.essences.length > 0) {
            const essences: Record<string, number> = fabricateFlags.component.essences;
            const craftingSystem = FabricateApplication.systems.getSystemById(fabricateFlags.identity.systemId);
            const essenceDescription = Object.keys(essences).map((essence: string) => craftingSystem.getEssenceById(essence).icon)
                .join(', ');
            sheetHtml.find('ol.properties-list').append($(`<li>${essenceDescription}</li>`));
        }
    }

    constructor(itemApplication: any) {
        this._sheetApplication = itemApplication;
        this._item = itemApplication.item;
        if (this._item.isOwned) {
            this._owned = true;
            const actorId: string = this._item.actor.id;
            "actors" in game ? this._actor = game.actors.get(actorId) : undefined;
            this._inventory = FabricateApplication.inventories.getFor(this._actor.id);
        } else {
            this._owned = false;
        }
        const partId: string = itemApplication.item.data.flags.fabricate.identity.partId;
        this._craftingSystem = FabricateApplication.systems.getSystemByPartId(partId);
        this._recipe = this._craftingSystem.getRecipeByPartId(partId);
    }

    private init(sheetHtml: any) {
        this._sheetHtml = sheetHtml;
        this.addTabToItemSheet(sheetHtml);
        this.render();
    }

    private async render(): Promise<void> {
        const isCraftable = this._owned;
        const template = await renderTemplate(Properties.module.templates.recipeTab, {recipe: this._recipe, item: this._item, system: this._craftingSystem, isCraftable: isCraftable});
        const element = this._sheetHtml.find('.recipe-tab-content');
        if (element && element.length) {
            element.replaceWith(template);
        } else {
            this._sheetHtml.find('.tab.fabricate-recipe').append(template);
        }

        this.handleItemSheetEvents();

        if (this._suppressedInNav && !this.isActiveInNav()) {
            this._sheetApplication._tabs[0].activate(ItemRecipeTab.tabKey);
            this._suppressedInNav = false;
        }
    }

    private addTabToItemSheet(sheetHtml: any): void {
        const tabs = sheetHtml.find(`.tabs[data-group="primary"]`);
        tabs.append($(
            `<a class="item fabricate-recipe" data-tab="${ItemRecipeTab.tabKey}">Recipe</a>`
        ));

        $(sheetHtml.find(`.sheet-body`)).append($(
            `<div class="tab fabricate-recipe" data-group="primary" data-tab="${ItemRecipeTab.tabKey}"></div>`
        ));
    }

    private handleItemSheetEvents(): void {

        this._sheetHtml.find('.craft-button').click(async () => {
            await this._craftingSystem.craft(this._actor, this._inventory, this._recipe);
            this._suppressedInNav = true;
            await this.render();
        });

        this._sheetHtml.find('.open-compendium-item').click(async (event: any) => {
            const partId = event.currentTarget.getAttribute('data-part-id');
            const systemId = event.currentTarget.getAttribute('data-system-id');
            const compendium: CompendiumCollection<CompendiumCollection.Metadata> = "packs" in game ? game.packs.get(systemId) : undefined;
            // @ts-ignore
            const document: Document<AnyDocumentData> = await compendium.getDocument(partId);
            if ("user" in game ? game.user.isGM : false) {
                console.warn('You are attempting to view the details of a Crafting Component that you have no ' +
                    'access to. Ask your GM oran administrator to grant you access to the items in the compendium for ' +
                    'the Crafting System "' + this._craftingSystem.name + '"');
            }
            // document.sheet.render(true) // this used to work
        });

    }

    private isActiveInNav(): boolean {
        return $(this._sheetHtml).find(`a.fabricate-recipe[data-tab="${ItemRecipeTab.tabKey}"]`).hasClass('active');
    }
}

export {ItemRecipeTab}