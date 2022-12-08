import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {CraftingSystem} from "../../system/CraftingSystem";
import {StringIdentity, CraftingComponent} from "../../common/CraftingComponent";
import {Essence} from "../../common/Essence";
import {Combination} from "../../common/Combination";
import FabricateApplication from "../FabricateApplication";
import {ApplicationWindow, Click, DefaultClickHandler, StateManager} from "./core/Applications";

interface ComponentManagerView {
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

class ComponentManagerModel {

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

    public incrementEssence(essenceId: string): ComponentManagerModel {
        this._component.essences = this._component.essences.increment(essenceId);
        return this;
    }

    public decrementEssence(essenceId: string): ComponentManagerModel {
        this._component.essences = this._component.essences.decrement(essenceId);
        return this;
    }

    public incrementSalvage(salvageId: string): ComponentManagerModel {
        this._component.salvage = this._component.salvage.increment(salvageId);
        return this;
    }

    public decrementSalvage(salvageId: string): ComponentManagerModel {
        this._component.salvage = this._component.salvage.decrement(salvageId);
        return this;
    }

}

class ComponentStateManager implements StateManager<ComponentManagerView, ComponentManagerModel> {

    private readonly _model: ComponentManagerModel;

    constructor({
        component,
        system
    }: {
        component: CraftingComponent,
        system: CraftingSystem
    }) {
        this._model = new ComponentManagerModel({
            component,
            system
        });
    }

    getModelState(): ComponentManagerModel {
        return this._model;
    }

    getViewData(): ComponentManagerView {
        return {
            system: {
                id: this._model.system.id, // todo: save the results, not the system, in the model
                essences: this._model.system.getEssences(),
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

    async load(): Promise<ComponentManagerModel> {
        // todo: save the results, not the system, in the model
        return this.getModelState();
    }

    async save(model: ComponentManagerModel): Promise<ComponentManagerModel> {
        await FabricateApplication.systemRegistry.saveCraftingSystem(model.system);
        return this.getModelState();
    }

    get component(): CraftingComponent {
        return this._model.component;
    }

    get system(): CraftingSystem {
        return this._model.system;
    }

    private prepareEssenceData(all: Essence[], includedAmounts: Combination<StringIdentity>): { essence: Essence; amount: number }[] {
        return all.map(essence => {
            return {
                essence,
                amount: includedAmounts.amountFor(new StringIdentity(essence.id))
            }
        });
    }

    private prepareSalvageData(thisComponentId: string, all: CraftingComponent[], includedAmounts: Combination<StringIdentity>): { component: CraftingComponent; amount: number }[] {
        return all.filter(component => component.id !== thisComponentId)
            .map(component => {
                return {
                    component,
                    amount: includedAmounts.amountFor(new StringIdentity(component.id))
                }
            });
    }

}

class ComponentManagerAppFactory {

    make(component: CraftingComponent, system: CraftingSystem): ApplicationWindow<ComponentManagerView, ComponentManagerModel> {
        return new ApplicationWindow<ComponentManagerView, ComponentManagerModel>({
            clickHandler: new DefaultClickHandler({
                dataKeys: ["componentId", "essenceId", "salvageId"],
                actions: new Map([
                    ["editComponentEssence", async (click: Click, currentState: ComponentManagerModel) => {
                        const essenceId = click.data.get("essenceId");
                        if (click.keys.shift) {
                            return currentState.decrementEssence(essenceId);
                        } else {
                            return currentState.incrementEssence(essenceId);
                        }
                    }],
                    ["editComponentSalvage", async (click: Click, currentState: ComponentManagerModel) => {
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
                title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.ComponentManagerApp.title`),
                id: `${Properties.module.id}-component-manager`,
                template: Properties.module.templates.componentManagerApp,
                width: 500,
            }
        });
    }

}

export default new ComponentManagerAppFactory();