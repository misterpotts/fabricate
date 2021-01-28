import Properties from "../Properties";
import {Recipe} from "../core/Recipe";

class ItemRecipeTab {
    private static readonly recipeType: string = Properties.types.recipe;
    private static readonly tabs: Map<string, ItemRecipeTab> = new Map();

    // @ts-ignore
    private _sheetData: ItemSheet;
    // @ts-ignore
    private _sheetHtml: ItemSheet;
    // @ts-ignore
    private _item: any;
    // @ts-ignore
    private _active: boolean = false;
    // @ts-ignore
    private _editable: boolean = false;
    // @ts-ignore
    private _recipe: Recipe;

    public static bind(itemSheet: ItemSheet, sheetHtml: any, sheetData: any): void {
        if (itemSheet.item.data.flags.fabricate.type !== ItemRecipeTab.recipeType) {
            return;
        }
        let tab: ItemRecipeTab = ItemRecipeTab.tabs.get(itemSheet.id);
        if (!tab) {
            tab = new ItemRecipeTab(itemSheet);
            ItemRecipeTab.tabs.set(itemSheet.id, tab);
        }
        tab.init(sheetHtml, sheetData);
    }

    constructor(itemSheet: ItemSheet) {
        this._sheetData = itemSheet;
        this._item = itemSheet.item;
        this._recipe = Recipe.fromFabricateFlags(itemSheet.item.data.flags.fabricate);
        this._active = false;
    }

    private init(sheetHtml: any, itemData: any) {
        this._editable = itemData.editable;
        this._sheetHtml = sheetHtml;
        this.addTabToItemSheet(sheetHtml);
    }

    private addTabToItemSheet(sheetHtml: any) {
        let tabs = sheetHtml.find(`form nav.sheet-navigation.tabs`);
        tabs.append($(
            '<a class="item" data-tab="fabricate">Recipe</a>'
        ));

        $(sheetHtml.find(`.sheet-body`)).append($(
            '<div class="tab fabricate recipe" data-group="primary" data-tab="fabricate"></div>'
        ));
    }
}

export {ItemRecipeTab}