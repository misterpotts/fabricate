import {Combination} from "../../common/Combination";
import {EssenceDefinition} from "../../common/EssenceDefinition";
import {DiceRoller} from "../../foundry/DiceRoller";

enum AlchemicalEffectType {
    MODIFIER = 1,
    BASIC = 0,
}

/**
 * @type D The System-Specific, concrete Item Data type to modify when applying  an Alchemical Effect
 * */
abstract class AlchemicalEffect<D>{
    private readonly _essenceCombination: Combination<EssenceDefinition>;
    private readonly _description: string;
    private readonly _type: AlchemicalEffectType;
    protected readonly _diceUtility: DiceRoller;

    abstract applyTo(itemData: D): D;

    protected constructor(builder: AlchemicalEffect.Builder<D>) {
        this._essenceCombination = builder.essenceCombination;
        this._description = builder.description;
        this._type = builder.type;
        this._diceUtility = builder.diceUtility;
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

    protected get diceUtility(): DiceRoller {
        return this._diceUtility;
    }

}

namespace AlchemicalEffect {

    export class Builder<D> {

        public essenceCombination: Combination<EssenceDefinition>;
        public description: string;
        public type: AlchemicalEffectType;
        public diceUtility: DiceRoller = new DiceRoller();

        public withEssenceCombination(value: Combination<EssenceDefinition>): Builder<D> {
            this.essenceCombination = value;
            return this;
        }

        public withDescription(value: string): Builder<D> {
            this.description = value;
            return this;
        }

        public withType(value: AlchemicalEffectType): Builder<D> {
            this.type = value;
            return this;
        }

        public withDiceUtility(value: DiceRoller): Builder<D> {
            this.diceUtility = value;
            return this;
        }

    }
}

export {AlchemicalEffect, AlchemicalEffectType}