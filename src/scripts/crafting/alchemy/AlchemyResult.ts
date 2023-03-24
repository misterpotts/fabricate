import {Combination} from "../../common/Combination";
import {Component} from "../../common/Component";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalCombination, NoAlchemicalCombination} from "./AlchemicalEffect";

interface AlchemyResult {

    describe(): string;

    consumed: Combination<Component>;

    effects: AlchemicalCombination;

    baseComponent: Component;

}

interface AlchemyResultConfig {
    detail: string;
    consumed: Combination<Component>;
}

interface NoAlchemyResultConfig extends AlchemyResultConfig {
    
}

class NoAlchemyResult implements AlchemyResult {

    private readonly _description: string;
    private readonly _consumed: Combination<Component>;

    constructor(config: NoAlchemyResultConfig) {
        this._consumed = config.consumed;
        this._description = config.detail;
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    describe() {
        return this._description;
    }

    get effects(): AlchemicalCombination {
        return new NoAlchemicalCombination();
    }

    get baseComponent(): Component {
        return null;
    }

}

interface SuccessfulAlchemyResultConfig extends AlchemyResultConfig {
    alchemicalEffect: AlchemicalCombination;
    baseComponent: Component;
}

class SuccessfulAlchemyResult implements AlchemyResult {

    private readonly _detail: string;
    private readonly _baseComponent: Component;
    private readonly _alchemicalEffect: AlchemicalCombination;
    private readonly _consumed: Combination<Component>;

    constructor(config: SuccessfulAlchemyResultConfig) {
        this._consumed = config.consumed;
        this._detail = config.detail;
        this._baseComponent = config.baseComponent;
        this._alchemicalEffect = config.alchemicalEffect;
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    describe() {
        return this._detail;
    }

    get effects(): AlchemicalCombination {
        return this._alchemicalEffect;
    }

    get baseComponent(): Component {
        return this._baseComponent;
    }
}

interface UnsuccessfulAlchemyResultConfig extends AlchemyResultConfig {

}

class UnsuccessfulAlchemyResult implements AlchemyResult {

    private readonly _description: string;
    private readonly _consumed: Combination<Component>;

    constructor(config: UnsuccessfulAlchemyResultConfig) {
        this._description = config.detail;
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    describe() {
        return `Alchemy attempt failed. ${this._description}. `;
    }

    applyToBaseItemData(baseItemData: ItemData): ItemData {
        return baseItemData;
    }

    get baseComponent(): Component {
        return null;
    }

    get effects(): AlchemicalCombination {
        return new NoAlchemicalCombination();
    }

}

export {AlchemyResult, SuccessfulAlchemyResult, UnsuccessfulAlchemyResult, NoAlchemyResult}