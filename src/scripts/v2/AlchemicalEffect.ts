import {Combination} from "./Combination";
import {EssenceDefinition} from "./EssenceDefinition";

enum AlchemicalEffectType {
    MODIFIER = 1,
    BASIC = 0,
}

/**
 * @type D The System-Specific, concrete Item Data type to modify when applying  an Alchemical Effect
 * */
interface AlchemicalEffect<D> {
    essenceCombination: Combination<EssenceDefinition>;
    description: string;
    type: AlchemicalEffectType;
    applyTo(itemData: D): D;
}

abstract class BaseAlchemicalEffect<D> implements AlchemicalEffect<D>{
    private readonly _essenceCombination: Combination<EssenceDefinition>;
    private readonly _description: string;
    private readonly _type: AlchemicalEffectType;
    abstract applyTo(itemData: D): D;

    protected constructor(essenceCombination: Combination<EssenceDefinition>, description: string, type: AlchemicalEffectType) {
        this._essenceCombination = essenceCombination;
        this._description = description;
        this._type = type;
    }

    get essenceCombination(): Combination<EssenceDefinition> {
        return this._essenceCombination;
    }

    get description(): string {
        return this._description;
    }

    get type(): AlchemicalEffectType {
        return this._type;
    }

}

export {AlchemicalEffect, BaseAlchemicalEffect, AlchemicalEffectType}