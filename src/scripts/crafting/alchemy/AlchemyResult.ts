import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalCombination, NoAlchemicalCombination} from "./AlchemicalEffect";

interface AlchemyResult {

    describe(): string;

    consumed: Combination<CraftingComponent>;

    effects: AlchemicalCombination;

    baseComponent: CraftingComponent;

}

interface AlchemyResultConfig {
    detail: string;
    consumed: Combination<CraftingComponent>;
}

interface NoAlchemyResultConfig extends AlchemyResultConfig {
    
}

class NoAlchemyResult implements AlchemyResult {

    private readonly _description: string;
    private readonly _consumed: Combination<CraftingComponent>;

    constructor(config: NoAlchemyResultConfig) {
        this._consumed = config.consumed;
        this._description = config.detail;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    describe() {
        return this._description;
    }

    get effects(): AlchemicalCombination {
        return new NoAlchemicalCombination();
    }

    get baseComponent(): CraftingComponent {
        return null;
    }

}

interface SuccessfulAlchemyResultConfig extends AlchemyResultConfig {
    alchemicalEffect: AlchemicalCombination;
    baseComponent: CraftingComponent;
}

class SuccessfulAlchemyResult implements AlchemyResult {

    private readonly _detail: string;
    private readonly _baseComponent: CraftingComponent;
    private readonly _alchemicalEffect: AlchemicalCombination;
    private readonly _consumed: Combination<CraftingComponent>;

    constructor(config: SuccessfulAlchemyResultConfig) {
        this._consumed = config.consumed;
        this._detail = config.detail;
        this._baseComponent = config.baseComponent;
        this._alchemicalEffect = config.alchemicalEffect;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    describe() {
        return this._detail;
    }

    get effects(): AlchemicalCombination {
        return this._alchemicalEffect;
    }

    get baseComponent(): CraftingComponent {
        return this._baseComponent;
    }
}

interface UnsuccessfulAlchemyResultConfig extends AlchemyResultConfig {

}

class UnsuccessfulAlchemyResult implements AlchemyResult {

    private readonly _description: string;
    private readonly _consumed: Combination<CraftingComponent>;

    constructor(config: UnsuccessfulAlchemyResultConfig) {
        this._description = config.detail;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    describe() {
        return `Alchemy attempt failed. ${this._description}. `;
    }

    applyToBaseItemData(baseItemData: ItemData): ItemData {
        return baseItemData;
    }

    get baseComponent(): CraftingComponent {
        return null;
    }

    get effects(): AlchemicalCombination {
        return new NoAlchemicalCombination();
    }

}

export {AlchemyResult, SuccessfulAlchemyResult, UnsuccessfulAlchemyResult, NoAlchemyResult}