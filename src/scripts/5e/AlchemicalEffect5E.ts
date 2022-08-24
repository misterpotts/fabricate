import {AlchemicalCombination, AlchemicalCombiner, AlchemicalEffect} from "../crafting/alchemy/AlchemicalEffect";
import {RollProvider5E} from "./RollProvider5E";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {DiceRoller} from "../foundry/DiceRoller";

enum Dnd5EAlchemicalEffectName {
    AOE_EXTENSION = "AOE_EXTENSION",
    DAMAGE = "DAMAGE",
    DAMAGE_MULTIPLIER = "DAMAGE_MULTIPLIER",
    DESCRIPTIVE = "DESCRIPTIVE",
    SAVE_MODIFIER = "SAVE_MODIFIER"
}

class AlchemicalCombiner5e implements AlchemicalCombiner<AlchemicalCombination5e> {

    mix(effects: AlchemicalEffect<AlchemicalCombination5e>[]): AlchemicalCombination5e {
        let combination = new AlchemicalCombination5e({});
        effects.forEach(effect => combination = effect.mixInto(combination))
        return combination;
    }

}

interface AlchemicalCombination5eConfig {
    diceMultiplier?: DiceMultiplier5e;
    damageByType?: Map<DND5e.DamageType, Damage5e>;
    descriptiveEffects?: DescriptiveEffect5e[];
    aoeExtension?: AoeExtension5e;
    savingThrowModifier?: SavingThrowModifier5e;
}

class AlchemicalCombination5e implements AlchemicalCombination {

    private readonly _damageByType: Map<DND5e.DamageType, Damage5e>;
    private readonly _descriptiveEffects: DescriptiveEffect5e[];
    private readonly _aoeExtension: AoeExtension5e;
    private readonly _savingThrowModifier: SavingThrowModifier5e;
    private readonly _diceMultiplier: DiceMultiplier5e;

    constructor({
        damageByType = new Map(),
        descriptiveEffects = [],
        aoeExtension,
        savingThrowModifier,
        diceMultiplier
    }: AlchemicalCombination5eConfig) {
        this._damageByType = damageByType;
        this._descriptiveEffects = descriptiveEffects;
        this._aoeExtension = aoeExtension;
        this._savingThrowModifier = savingThrowModifier;
        this._diceMultiplier = diceMultiplier;
    }

    applyToItemData(itemData: ItemData): ItemData {
        // todo: implement
        return itemData;
    }

    toConstructorArgs(): AlchemicalCombination5eConfig {
        return {
            damageByType: new Map(this._damageByType),
            descriptiveEffects: this._descriptiveEffects,
            aoeExtension:this._aoeExtension,
            savingThrowModifier: this._savingThrowModifier,
            diceMultiplier: this._diceMultiplier
        }
    }

}

class Damage5e implements AlchemicalEffect<AlchemicalCombination5e> {

    private readonly _roll: Roll;
    private readonly _damageType: DND5e.DamageType;
    private readonly _rollProvider: RollProvider5E;

    constructor(config: {
        roll: Roll,
        type: DND5e.DamageType,
        rollProvider: RollProvider5E
    }) {
        this._roll = config.roll;
        this._damageType = config.type;
        this._rollProvider = config.rollProvider;
    }

    describe(): string {
        return `Adds ${this._roll.formula} ${this._damageType} damage`
    }

    get rollProvider(): RollProvider5E {
        return this._rollProvider;
    }

    get roll(): Roll {
        return this._roll;
    }

    get damageType(): DND5e.DamageType {
        return this._damageType;
    }

    mixInto(combination: AlchemicalCombination5e): AlchemicalCombination5e {
        const combinationConfig = combination.toConstructorArgs();
        const modifiedDamage = combinationConfig.damageByType;
        if (modifiedDamage.has(this._damageType)) {
            const damageToCombine = modifiedDamage.get(this._damageType);
            const combinedDamage = damageToCombine.combineWith(this);
            modifiedDamage.set(this._damageType, combinedDamage);
        } else {
            modifiedDamage.set(this._damageType, this);
        }
        combinationConfig.damageByType = modifiedDamage;
        return new AlchemicalCombination5e(combinationConfig);
    }

    private combineWith(other: Damage5e): Damage5e {
        const combinedRoll: Roll = this._rollProvider.combine(other.roll, this._roll);
        return new Damage5e({type: this._damageType, roll: combinedRoll, rollProvider: this._rollProvider});
    }

}
/**
 * Used for Conditions
 */
class DescriptiveEffect5e implements AlchemicalEffect<AlchemicalCombination5e> {

    private readonly _effectDetail: string;

    constructor(effectDetail: string) {
        this._effectDetail = effectDetail;
    }

    describe(): string {
        return this._effectDetail;
    }

    mixInto(combination: AlchemicalCombination5e): AlchemicalCombination5e {
        const combinationConfig = combination.toConstructorArgs();
        combinationConfig.descriptiveEffects.push(this);
        return new AlchemicalCombination5e(combinationConfig);
    }

}

class AoeExtension5e implements AlchemicalEffect<AlchemicalCombination5e> {

    private readonly _units: DND5e.Unit;
    private readonly _value: number;

    constructor(config: {
        units: DND5e.Unit;
        value: number;
    }) {
        this._units = config.units;
        this._value = config.value;
    }

    get units(): DND5e.Unit {
        return this._units;
    }

    get value(): number {
        return this._value;
    }

    describe(): string {
        return `Increases the range of area effects by ${this._value}${this._units}`;
    }

    mixInto(combination: AlchemicalCombination5e): AlchemicalCombination5e {
        const combinationConfig = combination.toConstructorArgs();
        const existing = combinationConfig.aoeExtension;
        if (!existing) {
            combinationConfig.aoeExtension = this;
            return new AlchemicalCombination5e(combinationConfig);
        }
        if (existing.units !== this._units) {
            throw new Error("Mixing units in AOE Extension effects is not currently supported. ");
        }
        combinationConfig.aoeExtension = existing.combineWith(this);
        return new AlchemicalCombination5e(combinationConfig);
    }

    private combineWith(other: AoeExtension5e): AoeExtension5e {
        const combinedValue = other.value + this._value;
        return new AoeExtension5e({units: this._units, value: combinedValue});
    }

}

class SavingThrowModifier5e implements AlchemicalEffect<AlchemicalCombination5e> {

    private readonly _value: number;

    constructor({
        value
    }: {
        value: number
    }) {
        this._value = value;
    }

    private toExpression(): string {
        return `${Math.sign(this._value)}${this._value}`;
    }

    describe(): string {
        return `Modifies the DC of the saving throw to avoid effects by ${this.toExpression()}. `;
    }

    get value(): number {
        return this._value;
    }

    combineWith(other: SavingThrowModifier5e): SavingThrowModifier5e {
        return new SavingThrowModifier5e({value: other.value + this._value});
    }

    mixInto(combination: AlchemicalCombination5e): AlchemicalCombination5e {
        const combinationConfig = combination.toConstructorArgs();
        const existing = combinationConfig.savingThrowModifier;
        if (!existing) {
            combinationConfig.savingThrowModifier = this;
            return new AlchemicalCombination5e(combinationConfig);
        }
        combinationConfig.savingThrowModifier = existing.combineWith(this);
        return new AlchemicalCombination5e(combinationConfig);
    }

}

class DiceMultiplier5e implements AlchemicalEffect<AlchemicalCombination5e> {

    private readonly _value: number;
    private readonly _diceRoller: DiceRoller;

    describe(): string {
        return `Multiplies the number of damage dice for all effects by ${this._value}`;
    }

    constructor({
        multiplierValue, diceRoller
    }: {
        multiplierValue: number,
        diceRoller: DiceRoller
    }) {
        this._value = multiplierValue;
        this._diceRoller = diceRoller;
    }

    get value(): number {
        return this._value;
    }

    combineWith(other: DiceMultiplier5e): DiceMultiplier5e {
        return new DiceMultiplier5e({
            multiplierValue: other.value * this._value,
            diceRoller:this._diceRoller
        });
    }

    multiply(damageEffect: Damage5e): Damage5e {
        const multipliedRoll = this._diceRoller.multiply(damageEffect.roll, this._value);
        return new Damage5e({
            type: damageEffect.damageType,
            roll: multipliedRoll,
            rollProvider: damageEffect.rollProvider
        });
    }

    mixInto(combination: AlchemicalCombination5e): AlchemicalCombination5e {
        const combinationConfig = combination.toConstructorArgs();
        const existing = combinationConfig.diceMultiplier;
        if (!existing) {
            combinationConfig.diceMultiplier = this;
            return new AlchemicalCombination5e(combinationConfig);
        }
        combinationConfig.diceMultiplier = existing.combineWith(this);
        return new AlchemicalCombination5e(combinationConfig);
    }

}

export {
    Dnd5EAlchemicalEffectName,
    AlchemicalCombiner5e,
    AlchemicalCombination5e,
    Damage5e,
    DescriptiveEffect5e,
    AoeExtension5e,
    SavingThrowModifier5e,
    DiceMultiplier5e
}