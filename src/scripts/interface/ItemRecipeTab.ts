import Properties from "../Properties";
import {Recipe} from "../core/Recipe";
import {CraftingSystemRegistry} from "../registries/CraftingSystemRegistry";
import {CraftingSystem} from "../core/CraftingSystem";

class ItemRecipeTab {
    private static readonly recipeType: string = Properties.types.recipe;
    private static readonly tabs: Map<string, ItemRecipeTab> = new Map();

    // @ts-ignore
    private _sheetApplication: any;
    private _sheetHtml: any;
    private readonly _item: any;
    private readonly _recipe: Recipe;
    private readonly _craftingSystem: CraftingSystem;
    private _suppressedInNav: boolean = false;
    private static tabKey: string = 'fabricate-recipe';

    public static bind(itemApplication: any, sheetHtml: HTMLElement): void {
        if ((!itemApplication.item.data.flags.fabricate) || (itemApplication.item.data.flags.fabricate.type !== ItemRecipeTab.recipeType)) {
            return;
        }
        let tab: ItemRecipeTab = ItemRecipeTab.tabs.get(itemApplication.id);
        if (!tab) {
            tab = new ItemRecipeTab(itemApplication);
            ItemRecipeTab.tabs.set(itemApplication.id, tab);
        }
        tab.init(sheetHtml);
    }

    constructor(itemApplication: any) {
        this._sheetApplication = itemApplication;
        this._item = itemApplication.item;
        const partId: string = itemApplication.item.data.flags.fabricate.identity.partId;
        this._craftingSystem = CraftingSystemRegistry.getSystemByRecipeId(partId);
        this._recipe = this._craftingSystem.getRecipeByPartId(partId);
    }

    private init(sheetHtml: any) {
        this._sheetHtml = sheetHtml;
        this.addTabToItemSheet(sheetHtml);
        this.render();
    }

    private async render(): Promise<void> {
        const template: HTMLElement = await renderTemplate(Properties.module.templates.recipeTab, {recipe: this._recipe, item: this._item, system: this._craftingSystem});
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
        this._sheetHtml.find('.craft-button').click(async (event: any) => {
            const recipeId = event.target.getAttribute('data-recipe-id');
            const actorId = event.target.getAttribute('data-actor-id');
            await this._craftingSystem.craft(actorId, recipeId);
            this._suppressedInNav = true;
            await this.render();
        });
    }

    private isActiveInNav(): boolean {
        return $(this._sheetHtml).find(`a.fabricate-recipe[data-tab="${ItemRecipeTab.tabKey}"]`).hasClass('active');
    }
}

export {ItemRecipeTab}