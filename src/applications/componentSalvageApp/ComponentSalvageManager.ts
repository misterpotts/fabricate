import {CraftingAPI} from "../../scripts/api/CraftingAPI";
import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {ComponentAPI} from "../../scripts/api/ComponentAPI";
import {Component} from "../../scripts/crafting/component/Component";
import {TrackedCombination} from "../../scripts/common/TrackedCombination";
import {Combination} from "../../scripts/common/Combination";
import {SalvageOption} from "../../scripts/crafting/component/SalvageOption";
import {SalvageResult} from "../../scripts/crafting/result/SalvageResult";

interface SalvageAttempt {

    readonly optionId: string;
    readonly optionName: string;
    readonly amountOwned: number;
    readonly isPossible: boolean;
    readonly requiredCatalysts: TrackedCombination<Component>;
    readonly requiresCatalysts: boolean;
    readonly componentToSalvage: Component;
    readonly producedComponents: Combination<Component>;

}

export { SalvageAttempt };

class DefaultSalvageAttempt implements SalvageAttempt {

    private readonly _optionId: string;
    private readonly _optionName: string;
    private readonly _amountOwned: number;
    private readonly _possible: boolean;
    private readonly _requiredCatalysts: TrackedCombination<Component>;
    private readonly _componentToSalvage: Component;
    private readonly _producedComponents: Combination<Component>;

    constructor({
        optionId,
        optionName,
        amountOwned,
        isPossible,
        requiredCatalysts,
        componentToSalvage,
        producedComponents,
    }: {
        optionId: string;
        optionName: string;
        amountOwned: number;
        isPossible: boolean;
        requiredCatalysts: TrackedCombination<Component>;
        componentToSalvage: Component;
        producedComponents: Combination<Component>;
    } ) {
        this._optionId = optionId;
        this._optionName = optionName;
        this._amountOwned = amountOwned;
        this._possible = isPossible;
        this._requiredCatalysts = requiredCatalysts;
        this._componentToSalvage = componentToSalvage;
        this._producedComponents = producedComponents;
    }

    get amountOwned(): number {
        return this._amountOwned;
    }

    get isPossible(): boolean {
        return this._possible;
    }

    get requiredCatalysts(): TrackedCombination<Component> {
        return this._requiredCatalysts;
    }

    get requiresCatalysts(): boolean {
        return !this._requiredCatalysts.isEmpty
    }

    get producedComponents(): Combination<Component> {
        return this._producedComponents;
    }

    get optionId(): string {
        return this._optionId;
    }

    get componentToSalvage(): Component {
        return this._componentToSalvage;
    }

    get optionName(): string {
        return this._optionName;
    }

}

interface ComponentSalvageManager {

    readonly componentToSalvage: Component;

    loadSalvageAttempts(): Promise<SalvageAttempt[]>;

    doSalvage(salvageOptionId: string): Promise<SalvageResult>;

}

export { ComponentSalvageManager };

class DefaultComponentSalvageManager implements ComponentSalvageManager {

    private readonly _actor: BaseActor;
    private readonly _craftingAPI: CraftingAPI;
    private readonly _componentAPI: ComponentAPI;
    private readonly _componentToSalvage: Component;

    constructor({
        actor,
        craftingAPI,
        componentAPI,
        componentToSalvage,
    }: {
        actor: BaseActor;
        craftingAPI: CraftingAPI;
        componentAPI: ComponentAPI;
        componentToSalvage: Component;
    }) {
        this._actor = actor;
        this._craftingAPI = craftingAPI;
        this._componentAPI = componentAPI;
        this._componentToSalvage = componentToSalvage;
    }

    async loadSalvageAttempts(): Promise<SalvageAttempt[]> {
        const amountOwned = await this._craftingAPI.countOwnedComponentsOfType(this._actor.id, this._componentToSalvage.id);
        const ownedComponents = await this._craftingAPI.getOwnedComponentsForCraftingSystem(this._actor.id, this._componentToSalvage.craftingSystemId);
        const includedComponentIds = this._componentToSalvage.getUniqueReferencedComponents().map(referenceUnit => referenceUnit.id);
        const includedComponentsById = await this._componentAPI.getAllById(includedComponentIds);
        await Promise.all(Array.from(includedComponentsById.values())
            .map(component => component.load())
            .concat(this._componentToSalvage.load())
        );
        return this._componentToSalvage.salvageOptions.all.map((option) => this.buildSalvageAttempt(this._componentToSalvage, option, amountOwned, ownedComponents, includedComponentsById));
    }

    private buildSalvageAttempt(
        componentToSalvage: Component,
        option: SalvageOption,
        amountOwned: number,
        ownedComponents: Combination<Component>,
        includedComponentsById: Map<string, Component>,
    ): SalvageAttempt {

        let requiredCatalysts: TrackedCombination<Component> = TrackedCombination.EMPTY();
        if (option.requiresCatalysts) {
            const targetCatalysts = option.catalysts.convertElements(reference => includedComponentsById.get(reference.id));
            const actualCatalysts = ownedComponents.units
                .filter(unit => targetCatalysts.has(unit.element))
                .reduce((combination, unit) => combination.addUnit(unit), Combination.EMPTY<Component>());
            requiredCatalysts = new TrackedCombination<Component>({
                target: targetCatalysts,
                actual: actualCatalysts
            });
        }

        const isSalvageable = requiredCatalysts.isSufficient;
        const producedComponents = option.results.convertElements(reference => includedComponentsById.get(reference.id));

        return new DefaultSalvageAttempt({
            optionId: option.id,
            optionName: option.name,
            amountOwned,
            isPossible: isSalvageable,
            requiredCatalysts,
            componentToSalvage,
            producedComponents
        });

    }

    async doSalvage(salvageOptionId: string): Promise<SalvageResult> {
        return this._craftingAPI.salvageComponent({
            salvageOptionId,
            sourceActorId: this._actor.id,
            componentId: this._componentToSalvage.id,
        });
    }

    get componentToSalvage(): Component {
        return this._componentToSalvage;
    }

}

export { DefaultComponentSalvageManager }