import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalEffect, NoAlchemicalEffect} from "./AlchemicalEffect";
import {CraftingChatMessage, IconType} from "../../interface/CraftingChatMessage";

interface AlchemyResult {

    describe(): CraftingChatMessage;

    consumed: Combination<CraftingComponent>;

    effect: AlchemicalEffect;

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

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            title: "Crafting not attempted",
            description: this._description,
            iconType: IconType.FAILURE
        });
    }

    get effect(): AlchemicalEffect {
        return new NoAlchemicalEffect();
    }

    get baseComponent(): CraftingComponent {
        return null;
    }

}

interface SuccessfulAlchemyResultConfig extends AlchemyResultConfig {
    alchemicalEffect: AlchemicalEffect;
    baseComponent: CraftingComponent;
}

class SuccessfulAlchemyResult implements AlchemyResult {

    private readonly _detail: string;
    private readonly _baseComponent: CraftingComponent;
    private readonly _alchemicalEffect: AlchemicalEffect;
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

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            iconType: IconType.RANDOM,
            consumedItems: this._consumed,
            createdItems: Combination.of(this._baseComponent, 1), // todo - find a suitable way to display the custom item data
            description: this._detail
        });
    }

    get effect(): AlchemicalEffect {
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

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            iconType: IconType.FAILURE,
            description: `Alchemy attempt failed. ${this._description}. `
        });
    }

    applyToBaseItemData(baseItemData: ItemData): ItemData {
        return baseItemData;
    }

    get baseComponent(): CraftingComponent {
        return null;
    }

    get effect(): AlchemicalEffect {
        return new NoAlchemicalEffect();
    }

}

export {AlchemyResult, SuccessfulAlchemyResult, UnsuccessfulAlchemyResult, NoAlchemyResult}