import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import {CraftingSystem} from "../../system/CraftingSystem";
import {CraftingComponent, CraftingComponentSummary} from "../../common/CraftingComponent";
import {Essence} from "../../common/Essence";
import {Combination, Unit} from "../../common/Combination";
import FabricateApplication from "../FabricateApplication";
import {ApplicationWindow, ActionData, DefaultClickHandler, StateManager} from "./core/Applications";

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
        essences: Unit<Essence>[],
        salvage: Unit<CraftingComponent>[]
    }
}

class ComponentManagerModel {

    private readonly _system: CraftingSystem;
    private readonly _component: CraftingComponent;
    private readonly _availableEssences: Map<string, Essence>;
    private readonly _availableSalvage: Map<string, CraftingComponent>;

    constructor({
        system,
        component,
        availableEssences,
        availableSalvage
    }: {
        system: CraftingSystem;
        component: CraftingComponent;
        availableEssences: Essence[];
        availableSalvage: CraftingComponent[];
    }) {
        this._system = system;
        this._component = component;
        this._availableEssences = new Map(availableEssences.map(essence => [essence.id, essence]));
        this._availableSalvage = new Map(availableSalvage.map(salvage => [salvage.id, salvage]));
    }

    get system(): CraftingSystem {
        return this._system;
    }

    get component(): CraftingComponent {
        return this._component;
    }

    get availableEssences(): Essence[] {
        return Array.from(this._availableEssences.values());
    }

    get availableSalvage(): CraftingComponent[] {
        return Array.from(this._availableSalvage.values());
    }

    public incrementEssence(essenceId: string): ComponentManagerModel {
        if (!this._availableEssences.has(essenceId)) {
            throw new Error(`No Essence was found with the ID "${essenceId}" to add to the component "${this._component.name}". `);
        }
        const essence = this._availableEssences.get(essenceId);
        this._component.essences = this._component.essences.add(new Unit(essence, 1));
        return this;
    }

    public decrementEssence(essenceId: string): ComponentManagerModel {
        if (!this._availableEssences.has(essenceId)) {
            throw new Error(`No Essence was found with the ID "${essenceId}" to add to the component "${this._component.name}". `);
        }
        const essence = this._availableEssences.get(essenceId);
        this._component.essences = this._component.essences.minus(new Unit(essence, 1));
        return this;
    }

    public incrementSalvage(componentId: string): ComponentManagerModel {
        if (!this._availableSalvage.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as salvage to the component "${this._component.name}". `);
        }
        const salvage = this._availableSalvage.get(componentId).summarise();
        this._component.salvage = this._component.salvage.add(new Unit(salvage, 1));
        return this;
    }

    public decrementSalvage(componentId: string): ComponentManagerModel {
        if (!this._availableSalvage.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as salvage to the component "${this._component.name}". `);
        }
        const salvage = this._availableSalvage.get(componentId).summarise();
        this._component.salvage = this._component.salvage.minus(new Unit(salvage, 1));
        return this;
    }

}

class ComponentStateManager implements StateManager<ComponentManagerView, ComponentManagerModel> {

    private readonly _model: ComponentManagerModel;

    constructor({
        component,
        system,
        availableEssences,
        availableSalvage
    }: {
        component: CraftingComponent;
        system: CraftingSystem;
        availableEssences: Essence[];
        availableSalvage: CraftingComponent[];
    }) {
        this._model = new ComponentManagerModel({
            component,
            system,
            availableEssences,
            availableSalvage
        });
    }

    getModelState(): ComponentManagerModel {
        return this._model;
    }

    getViewData(): ComponentManagerView {
        return {
            system: {
                id: this.system.id,
                essences: this._model.availableEssences,
                components: this._model.availableSalvage
            },
            component: {
                id: this.component.id,
                name: this.component.name,
                imageUrl: this.component.imageUrl,
                essences: this.prepareEssenceData(this._model.availableEssences, this.component.essences),
                salvage: this.prepareSalvageData(this.component.id, this._model.availableSalvage, this.component.salvage)
            }
        };
    }

    async load(): Promise<ComponentManagerModel> {
        const system = this._model.system;
        const component = this._model.component;
        const availableEssences = await system.getEssences();
        const components = await system.getComponents();
        const availableSalvage = components.filter(component => component.id !== this.component.id);
        return new ComponentManagerModel({system, component, availableEssences, availableSalvage});
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

    private prepareEssenceData(all: Essence[], includedAmounts: Combination<Essence>): Unit<Essence>[] {
        return all.map(essence => new Unit(essence, includedAmounts.amountFor(essence.id)));
    }

    private prepareSalvageData(thisComponentId: string, all: CraftingComponent[], includedAmounts: Combination<CraftingComponentSummary>): Unit<CraftingComponent>[] {
        return all.filter(component => component.id !== thisComponentId)
            .map(component => new Unit(component, includedAmounts.amountFor(component.id)));
    }

}

class ComponentManagerAppFactory {

    async make(component: CraftingComponent, system: CraftingSystem): Promise<ApplicationWindow<ComponentManagerView, ComponentManagerModel>> {
        return new ApplicationWindow<ComponentManagerView, ComponentManagerModel>({
            clickHandler: new DefaultClickHandler({
                dataKeys: ["componentId", "essenceId", "salvageId"],
                actions: new Map([
                    ["editComponentEssence", async (click: ActionData, currentState: ComponentManagerModel) => {
                        const essenceId = click.data.get("essenceId");
                        if (click.keys.shift) {
                            return currentState.decrementEssence(essenceId);
                        } else {
                            return currentState.incrementEssence(essenceId);
                        }
                    }],
                    ["editComponentSalvage", async (click: ActionData, currentState: ComponentManagerModel) => {
                        const salvageId = click.data.get("salvageId");
                        if (click.keys.shift) {
                            return currentState.decrementSalvage(salvageId);
                        } else {
                            return currentState.incrementSalvage(salvageId);
                        }
                    }]
                ])
            }),
            stateManager: new ComponentStateManager({
                component,
                system,
                availableEssences: await system.getEssences(),
                availableSalvage: await system.getComponents()
            }),
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