import {ItemSheetModifier, SheetTab} from "./apps/core/Applications";
import {CraftingSystem} from "../system/CraftingSystem";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import Properties from "../Properties";

interface SystemData {
    recipe?: Recipe;
    component?: CraftingComponent;
    system: CraftingSystem;
}

export class FabricateItemSheetTab implements ItemSheetModifier {

    private static _id: string = "fabricate-crafting";
    private static _name: string = "Fabricate";
    private static _buttonClass: string = "fabricate-item-crafting";
    private static _containerClass: string = "fabricate-item-crafting";
    private static _innerClass: string = "fabricate-item-crafting-content";

    private _tabs: SheetTab[] = [];
    private readonly _craftingSystems: CraftingSystem[];

    constructor({
        tabs = [],
        craftingSystems
    }: {
        tabs?: SheetTab[],
        craftingSystems: CraftingSystem[]
    }) {
        this._tabs = tabs;
        this._craftingSystems = craftingSystems;
    }

    get tabs(): SheetTab[] {
        return this._tabs;
    }

    hasTabs(): boolean {
        return this._tabs.length > 0;
    }

    async prepareData(app: any): Promise<void> {
        const uuid = app.document.uuid;
        const sourceId = app.document.getFlag("core", "sourceId");
        const identifiers = [uuid, sourceId];
        const systemData = await Promise.all(
            this._craftingSystems.map(system => this.getSystemData(system, identifiers))
        );
        this._tabs = this.prepareTabData(systemData.filter(system => system.recipe || system.component), app.document);
    }

    private async getSystemData(system: CraftingSystem, identifiers: string[]): Promise<SystemData> {
        const systemData: SystemData = { system, component: null, recipe: null };
        for (const identifier of identifiers) {
            if (!systemData.recipe && system.hasRecipe(identifier)) {
                systemData.recipe = await system.getRecipeById(identifier);
            }
            if (!systemData.component && system.hasComponent(identifier)) {
                systemData.component = await system.getComponentById(identifier);
            }
        }
        return systemData;
    }

    private prepareTabData(systemData: SystemData[], document: any): SheetTab[] {
        if (systemData.length === 0) {
            return [];
        }
        return [{
            id: FabricateItemSheetTab._id,
            name: FabricateItemSheetTab._name,
            buttonClass: FabricateItemSheetTab._buttonClass,
            containerClass: FabricateItemSheetTab._containerClass,
            innerClass: FabricateItemSheetTab._innerClass,
            templatePath: Properties.module.templates.itemSheetCraftingTab,
            data: {
                systems: systemData,
                isEmbedded: document.isEmbedded ?? false,
                actor: document.parent
            }
        }];
    }

}