enum AlchemicalEffectType {
    MODIFIER = 1,
    BASIC = 0,
}

interface AlchemicalEffect<T> {
    essenceCombination: string[];
    description: string;
    type: AlchemicalEffectType;
    applyTo(itemData: T): T;
}

abstract class BaseAlchemicalEffect<T> implements AlchemicalEffect<T>{
    private readonly _essenceCombination: string[];
    private readonly _description: string;
    private readonly _type: AlchemicalEffectType;
    abstract applyTo(itemData: T): T;

    protected constructor(essenceCombination: string[], description: string, type: AlchemicalEffectType) {
        this._essenceCombination = essenceCombination;
        this._description = description;
        this._type = type;
    }

    get essenceCombination(): string[] {
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