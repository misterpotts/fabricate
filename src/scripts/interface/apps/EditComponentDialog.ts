import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {CraftingSystem} from "../../system/CraftingSystem";
import {CombinableString, CraftingComponent} from "../../common/CraftingComponent";
import {Essence} from "../../common/Essence";
import {Combination, Unit} from "../../common/Combination";
import FabricateApplication from "../FabricateApplication";
import {ApplicationWindow, Click, DefaultClickHandler, StateManager} from "./core/Applications";

interface EditComponentDialogView {
    system: {
        id: string,
        essences: Essence[],
        components: CraftingComponent[]
    },
    component: {
        id: string,
        name: string,
        imageUrl: string,
        essences: { essence: Essence; amount: number }[],
        salvage: { component: CraftingComponent; amount: number }[]
    }
}

class EditComponentDialogModel {

    private readonly _system: CraftingSystem;
    private readonly _component: CraftingComponent;

    constructor({
        system,
        component
    }: {
        system: CraftingSystem,
        component: CraftingComponent
    }) {
        this._system = system;
        this._component = component;
    }

    get system(): CraftingSystem {
        return this._system;
    }

    get component(): CraftingComponent {
        return this._component;
    }

    public incrementEssence(essenceId: string): EditComponentDialogModel {
        const essenceDelta = new Unit(new CombinableString(essenceId), 1);
        this._component.essences = this._component.essences.add(essenceDelta);
        return this;
    }

    public decrementEssence(essenceId: string): EditComponentDialogModel {
        const essenceDelta = new Unit(new CombinableString(essenceId), 1);
        this._component.essences = this._component.essences.minus(essenceDelta);
        return this;
    }

    public incrementSalvage(salvageId: string): EditComponentDialogModel {
        const salvageDelta = new Unit(new CombinableString(salvageId), 1);
        this._component.salvage = this._component.salvage.add(salvageDelta);
        return this;
    }

    public decrementSalvage(salvageId: string): EditComponentDialogModel {
        const salvageDelta = new Unit(new CombinableString(salvageId), 1);
        this._component.salvage = this._component.salvage.minus(salvageDelta);
        return this;
    }

}

class ComponentStateManager implements StateManager<EditComponentDialogView, EditComponentDialogModel> {

    private readonly _model: EditComponentDialogModel;

    constructor({
        component,
        system
    }: {
        component: CraftingComponent,
        system: CraftingSystem
    }) {
        this._model = new EditComponentDialogModel({
            component,
            system
        });
    }

    getModelState(): EditComponentDialogModel {
        return this._model;
    }

    getViewData(): EditComponentDialogView {
        return {
            system: {
                id: this.system.id,
                essences: this.system.essences,
                components: this.system.components.filter(component => component.id !== this.component.id)
            },
            component: {
                id: this.component.id,
                name: this.component.name,
                imageUrl: this.component.imageUrl,
                essences: this.prepareEssenceData(this.system.essences, this.component.essences),
                salvage: this.prepareSalvageData(this.component.id, this.system.components, this.component.salvage)
            }
        };
    }

    async load(): Promise<EditComponentDialogModel> {
        return this.getModelState();
    }

    async save(model: EditComponentDialogModel): Promise<EditComponentDialogModel> {
        await FabricateApplication.systemRegistry.saveCraftingSystem(model.system);
        return this.getModelState();
    }

    get component(): CraftingComponent {
        return this._model.component;
    }

    get system(): CraftingSystem {
        return this._model.system;
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

class EditComponentDialogFactory {

    make(component: CraftingComponent, system: CraftingSystem): ApplicationWindow<EditComponentDialogView, EditComponentDialogModel> {
        return new ApplicationWindow<EditComponentDialogView, EditComponentDialogModel>({
            clickHandler: new DefaultClickHandler({
                dataKeys: ["componentId", "essenceId", "salvageId"],
                actions: new Map([
                    ["editComponentEssence", async (click: Click, currentState: EditComponentDialogModel) => {
                        const essenceId = click.data.get("essenceId");
                        if (click.keys.shift) {
                            return currentState.decrementEssence(essenceId);
                        } else {
                            return currentState.incrementEssence(essenceId);
                        }
                    }],
                    ["editComponentSalvage", async (click: Click, currentState: EditComponentDialogModel) => {
                        const salvageId = click.data.get("salvageId");
                        if (click.keys.shift) {
                            return currentState.decrementSalvage(salvageId);
                        } else {
                            return currentState.incrementSalvage(salvageId);
                        }
                    }]
                ])
            }),
            stateManager: new ComponentStateManager({component, system}),
            options: {
                title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.EditComponentDialog.title`),
                id: `${Properties.module.id}-component-manager`,
                template: Properties.module.templates.ComponentManagerApp,
                width: 500,
            }
        });
    }

}

export default new EditComponentDialogFactory();