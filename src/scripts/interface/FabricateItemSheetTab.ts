import {ItemSheetModifier, SheetTab, SheetTabAction} from "./apps/core/Applications";
import {CraftingSystem} from "../system/CraftingSystem";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import Properties from "../Properties";

interface SystemData {
    recipe?: Recipe;
    craftable: boolean;
    component?: CraftingComponent;
    salvageable: boolean;
    system: CraftingSystem;
    visible: boolean;
}

export class FabricateItemSheetTab implements ItemSheetModifier {

    private static _id: string = "fabricate-crafting";
    private static _name: string = "Fabricate";
    private static _buttonClass: string = "fabricate-item-crafting";
    private static _containerClass: string = "fabricate-item-crafting";
    private static _innerClass: string = "fabricate-item-tab-wrapper";

    private _tabs: SheetTab[] = [];
    private readonly _craftingSystems: CraftingSystem[];
    private readonly _actions: Map<string, SheetTabAction>;

    private readonly _hiddenSystemIds: Set<string> = new Set();

    constructor({
        tabs = [],
        craftingSystems,
        actions = new Map()
    }: {
        tabs?: SheetTab[];
        craftingSystems: CraftingSystem[];
        actions?: Map<string, SheetTabAction>;
    }) {
        this._tabs = tabs;
        this._craftingSystems = craftingSystems;
        this._actions = actions;
        this.prepareActions();
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
            this._craftingSystems.filter(system => system.enabled)
                .map(system => this.getSystemData(system, identifiers, app.document))
        );
        this._tabs = this.prepareTabData(systemData.filter(system => system.recipe || system.component), app.document);
    }

    private async getSystemData(system: CraftingSystem, identifiers: string[], document: any): Promise<SystemData> {
        const systemData: SystemData = {
            visible: !this._hiddenSystemIds.has(system.id),
            system,
            component: null,
            recipe: null,
            craftable: false,
            salvageable: false
        };
        for (const identifier of identifiers) {
            if (!systemData.recipe && system.hasRecipe(identifier)) {
                systemData.recipe = await system.getRecipeById(identifier);
                if (document.actor) {
                    // const _inventory = FabricateApplication.inventoryRegistry.getForActor(document.actor.id);
                    // todo: implement
                    systemData.craftable = false;
                }
            }
            if (!systemData.component && system.hasComponent(identifier)) {
                systemData.component = await system.getComponentById(identifier);
                systemData.salvageable = systemData.component.isSalvageable;
            }
        }
        return systemData;
    }

    private getAction(name: string) {
        return this._actions.get(name);
    }

    private prepareTabData(systemData: SystemData[], document: any): SheetTab[] {
        if (systemData.length === 0) {
            return [];
        }
        const itemSheetTab = this;
        return [{
            id: FabricateItemSheetTab._id,
            name: FabricateItemSheetTab._name,
            buttonClass: FabricateItemSheetTab._buttonClass,
            containerClass: FabricateItemSheetTab._containerClass,
            innerClass: FabricateItemSheetTab._innerClass,
            templatePath: Properties.module.templates.itemSheetCraftingTab,
            dataKeys: ["systemId"],
            data: {
                systems: systemData,
                owned: !!document?.isEmbedded,
                actor: document.parent
            },
            getAction: (name: string) => itemSheetTab.getAction(name)
        }];
    }

    private prepareActions() {
        this._actions.set("toggleSystemParts", async (data: Map<string,string>) => {
            const systemId = data.get("systemId");
            if (this._hiddenSystemIds.has(systemId)) {
                this._hiddenSystemIds.delete(systemId);
            } else {
                this._hiddenSystemIds.add(systemId);
            }
        });
    }

}