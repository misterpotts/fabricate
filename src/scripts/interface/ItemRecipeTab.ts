import Properties from "../Properties";
import {Recipe} from "../core/Recipe";
import {CraftingSystemRegistry} from "../systems/CraftingSystemRegistry";
import {CraftingSystem} from "../core/CraftingSystem";

class ItemRecipeTab {
    private static readonly recipeType: string = Properties.types.recipe;
    private static readonly tabs: Map<string, ItemRecipeTab> = new Map();

    // @ts-ignore
    private _sheetData: ItemSheet;
    private _sheetHtml: any;
    private readonly _item: any;
    private readonly _recipe: Recipe;
    private _suppressedInNav: boolean = false;

    public static bind(itemSheet: ItemSheet, sheetHtml: HTMLElement): void {
        if ((!itemSheet.item.data.flags.fabricate) || (itemSheet.item.data.flags.fabricate.type !== ItemRecipeTab.recipeType)) {
            return;
        }
        let tab: ItemRecipeTab = ItemRecipeTab.tabs.get(itemSheet.id);
        if (!tab) {
            tab = new ItemRecipeTab(itemSheet);
            ItemRecipeTab.tabs.set(itemSheet.id, tab);
        }
        tab.init(sheetHtml);
    }

    constructor(itemSheet: ItemSheet) {
        this._sheetData = itemSheet;
        this._item = itemSheet.item;
        this._recipe = Recipe.fromFlags(itemSheet.item.data.flags.fabricate);
    }

    private init(sheetHtml: any) {
        this._sheetHtml = sheetHtml;
        this.addTabToItemSheet(sheetHtml);
        this.render();
    }

    private async render(): Promise<void> {
        let template: HTMLElement = await renderTemplate(Properties.module.templates.recipeTab, {recipe: this._recipe, item: this._item});
        let element = this._sheetHtml.find('.recipe-tab-content');
        if (element && element.length) {
            element.replaceWith(template);
        } else {
            this._sheetHtml.find('.tab.fabricate-recipe').append(template);
        }

        this.handleItemSheetEvents();

        if (this._suppressedInNav && !this.isActiveInNav()) {
            this._sheetHtml.find('.item[data-tab="fabricate"]').addClass('active');
            this._suppressedInNav = false;
        }
    }

    private addTabToItemSheet(sheetHtml: any): void {
        const tabs = sheetHtml.find(`.tabs[data-group="primary"]`);
        tabs.append($(
            '<a class="item" data-tab="fabricate">Recipe</a>'
        ));

        $(sheetHtml.find(`.sheet-body`)).append($(
            '<div class="tab fabricate-recipe" data-group="primary" data-tab="fabricate"></div>'
        ));
    }

    private handleItemSheetEvents(): void {
        this._sheetHtml.find('.craft-button').click(async (event: any) => {
            let recipeId = event.target.getAttribute('data-recipe-id');
            let actorId = event.target.getAttribute('data-actor-id');
            let craftingSystem: CraftingSystem = CraftingSystemRegistry.getSystemByRecipeId(recipeId);
            await craftingSystem.craft(actorId, recipeId);
            this._suppressedInNav = true;
            await this.render();
        });
    }

    private isActiveInNav(): boolean {
        return $(this._sheetHtml).find('a.item[data-tab="magicitems"]').hasClass('active');
    }
}

export {ItemRecipeTab}