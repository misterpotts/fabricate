import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {AlchemicalCombiner} from "./AlchemicalCombiner";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalEffect} from "./AlchemicalEffect";
import {CraftingChatMessage} from "../../interface/CraftingChatMessage";

interface AlchemyResult {

    describe(): CraftingChatMessage;

    consumed: Combination<CraftingComponent>;

    getCustomItemData(): ItemData;

}

interface AlchemyResultConfig {
    description: string;
    consumed: Combination<CraftingComponent>;
}

interface NoAlchemyResultConfig extends AlchemyResultConfig {
    
}

class NoAlchemyResult implements AlchemyResult {

    private readonly _description: string;
    private readonly _consumed: Combination<CraftingComponent>;

    constructor(config: NoAlchemyResultConfig) {
        this._consumed = config.consumed;
        this._description = config.description;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    describe(): CraftingChatMessage {
        return undefined;
    }

    getCustomItemData(): ItemData {
        return {} as ItemData;
    }

}

interface SuccessfulAlchemyResultConfig extends AlchemyResultConfig {
    alchemicalCombiner: AlchemicalCombiner,
    matchingEffects: AlchemicalEffect<ItemData>[]
}

class SuccessfulAlchemyResult implements AlchemyResult {

    private readonly _description: string;
    private readonly _alchemicalCombiner: AlchemicalCombiner;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _matchingEffects: AlchemicalEffect<ItemData>[];

    constructor(config: SuccessfulAlchemyResultConfig) {
        this._consumed = config.consumed;
        this._description = config.description;
        this._matchingEffects = config.matchingEffects;
        this._alchemicalCombiner = config.alchemicalCombiner;
    }

    consumed: Combination<CraftingComponent>;

    describe(): CraftingChatMessage {
        return undefined;
    }

    getCustomItemData(): ItemData {
        // todo: the combiner no longer needs to select effects, only merge them into an item.
        //  It could be replaced with the GameSystemDocumentManager and removed from this class (having the inventory
        //  pass it the item data)
        return this._alchemicalCombiner.perform();
    }

}

interface UnsuccessfulAlchemyResultConfig extends AlchemyResultConfig {

}

class UnsuccessfulAlchemyResult implements AlchemyResult {

    private readonly _description: string;

    constructor(config: UnsuccessfulAlchemyResultConfig) {
        this._description = config.description;
    }

}

export {AlchemyResult, SuccessfulAlchemyResult, UnsuccessfulAlchemyResult, NoAlchemyResult}