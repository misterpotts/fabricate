import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {CraftingSystem} from "../../system/CraftingSystem";
import {CombinableString, CraftingComponent} from "../../common/CraftingComponent";
import {Essence} from "../../common/Essence";
import {Combination, Unit} from "../../common/Combination";
import FabricateApplication from "../FabricateApplication";

class EditComponentDialog extends FormApplication {

    private readonly _component: CraftingComponent;
    private readonly _craftingSystem: CraftingSystem;

    constructor(component: CraftingComponent, selectedSystem: CraftingSystem) {
        super(null);
        this._component = component;
        this._craftingSystem = selectedSystem;
    }

    static get defaultOptions() {
        const GAME = new GameProvider().globalGameObject();
        return {
            ...super.defaultOptions,
            title: GAME.i18n.localize(`${Properties.module.id}.EditComponentDialog.title`),
            id: `${Properties.module.id}-component-manager`,
            template: Properties.module.templates.ComponentManagerApp,
            width: 500,
        };
    }

    protected _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        console.log("Update object");
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        super.render(force);
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);
        const rootElement = html[0];
        rootElement.addEventListener("click", this._onClick.bind(this));
    }

    async _onClick(event: any) {
        const dataKeys = ["action", "componentId", "essenceId", "salvageId"];
        const data = new Map(dataKeys.map(key => [key, this.getClosestElementDataForKey(key, event)]));
        const shiftPressed: boolean = event.shiftKey;
        return this.handleUserAction(data, shiftPressed);
    }

    getClosestElementDataForKey(key: string, event: any): string {
        let element = event?.target;
        let value = element?.dataset[key];
        while (element && !value) {
            value = element?.dataset[key];
            element = element.parentElement;
        }
        return value;
    };

    async handleUserAction(data: Map<string, string>, shiftPressed: boolean) {
        switch (data.get("action")) {
            case "editComponentEssence":
                const essenceId = data.get("essenceId");
                const essenceDelta = new Unit(new CombinableString(essenceId), 1);
                let essenceResult: Combination<CombinableString>;
                if (shiftPressed) {
                    essenceResult = this._component.essences.minus(essenceDelta);
                } else {
                    essenceResult = this._component.essences.add(essenceDelta);
                }
                this._component.essences = essenceResult;
                await FabricateApplication.systemRegistry.saveCraftingSystem(this._craftingSystem);
                await this.render(true);
                break;
            case "editComponentSalvage":
                const salvageId = data.get("salvageId");
                const salvageDelta = new Unit(new CombinableString(salvageId), 1);
                let salvageResult: Combination<CombinableString>;
                if (shiftPressed) {
                    salvageResult = this._component.salvage.minus(salvageDelta);
                } else {
                    salvageResult = this._component.salvage.add(salvageDelta);
                }
                this._component.salvage = salvageResult;
                await FabricateApplication.systemRegistry.saveCraftingSystem(this._craftingSystem);
                await this.render(true);
                break;
            default:
                return;
        }
    }

    async getData(): Promise<any> {
        return {
            system: {
                id: this._craftingSystem.id,
                essences: this._craftingSystem.essences,
                components: this._craftingSystem.components.filter(component => component.id !== this._component.id)
            },
            component: {
                id: this._component.id,
                name: this._component.name,
                imageUrl: this._component.imageUrl,
                essences: this.prepareEssenceData(this._craftingSystem.essences, this._component.essences),
                salvage: this.prepareSalvageData(this._component.id, this._craftingSystem.components, this._component.salvage)
            }
        };
    }

    private prepareEssenceData(all: Essence[], includedAmounts: Combination<CombinableString>): { essence: Essence; amount: number }[] {
        return all.map(essence => {
            return {
                essence,
                amount: includedAmounts.amountFor(new CombinableString(essence.id))
        }});
    }

    private prepareSalvageData(thisComponentId: string, all: CraftingComponent[], includedAmounts: Combination<CombinableString>): { component: CraftingComponent; amount: number }[] {
        return all.filter(component => component.id !== thisComponentId)
            .map(component => {
                return {
                    component,
                    amount: includedAmounts.amountFor(new CombinableString(component.id))
            }});
    }
}

export { EditComponentDialog }