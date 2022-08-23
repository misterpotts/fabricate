import {AlchemicalEffect, AlchemicalEffectType} from "../crafting/alchemy/AlchemicalEffect";
import {DiceRoller} from "../foundry/DiceRoller";
import {RollProvider5E} from "./RollProvider5E";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

enum Dnd5EAlchemicalEffectName {
    AOE_EXTENSION = "AOE_EXTENSION",
    DAMAGE = "DAMAGE",
    DAMAGE_MULTIPLIER = "DAMAGE_MULTIPLIER",
    DESCRIPTIVE = "DESCRIPTIVE",
    SAVE_MODIFIER = "SAVE_MODIFIER"
}

class Damage5e implements AlchemicalEffect {

    private readonly _roll: Roll;
    private readonly _damageType: DND5e.DamageType;
    private readonly _rollProvider: RollProvider5E;

    private readonly _effectName: Dnd5EAlchemicalEffectName = Dnd5EAlchemicalEffectName.DAMAGE;
    private readonly _effectType: AlchemicalEffectType = AlchemicalEffectType.SIMPLE;

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

    get roll(): Roll {
        return this._roll;
    }

    get damageType(): DND5e.DamageType {
        return this._damageType;
    }

    get effectName(): string {
        return this._effectName;
    }

    get effectType(): AlchemicalEffectType {
        return this._effectType;
    }

    canCombineWith(other: AlchemicalEffect): boolean {
        if (other.effectName !== this._effectName) {
            return false;
        }
        return (<Damage5e><unknown>other).damageType === this._damageType;
    }

    combineWith(other: AlchemicalEffect): Damage5e {
        if (this.canCombineWith(other)) {
            throw new Error("Cannot combine 5E damage effects of different damage types");
        }
        const combinedRoll: Roll = this._rollProvider.combine((<Damage5e><unknown>other).roll, this._roll);
        return new Damage5e({type: this._damageType, roll: combinedRoll, rollProvider: this._rollProvider});
    }

    applyToItemData(itemData: ItemData): ItemData {
        return itemData;
    }

}

/**
 * Used for Conditions
 */
class DescriptiveEffect5e implements AlchemicalEffect {

    private readonly _effectDetail: string;

    private readonly _effectName: Dnd5EAlchemicalEffectName = Dnd5EAlchemicalEffectName.DESCRIPTIVE;
    private readonly _effectType: AlchemicalEffectType = AlchemicalEffectType.SIMPLE;

    constructor(effectDetail: string) {
        this._effectDetail = effectDetail;
    }

    get effectName(): string {
        return this._effectName;
    }

    get effectType(): AlchemicalEffectType {
        return this._effectType;
    }

    applyToItemData(itemData: ItemData): ItemData {
        itemData.data.description.value += `<p>${this._effectDetail}</p>`;
        return itemData;
    }

    canCombineWith(_other: AlchemicalEffect): boolean {
        return false;
    }

    combineWith(other: AlchemicalEffect): AlchemicalEffect {
        return other;
    }

    describe(): string {
        return this._effectDetail;
    }

}

class AoeExtension5e implements AlchemicalEffect {

    private readonly _units: DND5e.Unit;
    private readonly _value: number;

    private readonly _effectName: Dnd5EAlchemicalEffectName = Dnd5EAlchemicalEffectName.AOE_EXTENSION;
    private readonly _effectType: AlchemicalEffectType = AlchemicalEffectType.SIMPLE;

    constructor(config: {
        units: DND5e.Unit;
        value: number;
    }) {
        this._units = config.units;
        this._value = config.value;
    }

    get effectName(): string {
        return this._effectName;
    }

    get effectType(): AlchemicalEffectType {
        return this._effectType;
    }

    applyToItemData(itemData: ItemData): ItemData {
        if ('target' in itemData.data) {
            if (itemData.target.units !== this._aoeExtension.units) {
                throw new Error(`You may not mix units in Alchemical Effects AoE Extensions. Found ${itemData.target.units}, expected ${this._aoeExtension.units}`);
            }
            itemData.target.value += this._aoeExtension.value;
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'target' property`);
    }

    canCombineWith(other: AlchemicalEffect): boolean {
        return false;
    }

    combineWith(other: AlchemicalEffect): AlchemicalEffect {
        return undefined;
    }

    describe(): string {
        return `Increases the range of area effects by ${this._value}${this._units}`;
    }



}

class SavingThrowModifier5e extends AlchemicalDistillation5e {
    private readonly _savingThrowModifier: number;

    constructor(savingThrowModifier: number) {
        super({
            type:AlchemicalEffectType.BASIC,
            description: `Increases save DC by ${savingThrowModifier}. `
        });
        this._savingThrowModifier = savingThrowModifier;
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        if ('save' in itemData) {
            itemData.save.dc += this._savingThrowModifier;
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'save' property`);
    }

}

class DiceMultiplier5e extends AlchemicalDistillation5e {
    private readonly _multiplierValue: number;
    private readonly _diceRoller: DiceRoller;

    constructor(multiplierValue: number, diceRoller: DiceRoller) {
        super({
            type: AlchemicalEffectType.MULTIPLIER,
            description: `Multiplies the number of damage dice by a factor of ${multiplierValue}`
        });
        this._multiplierValue = multiplierValue;
        this._diceRoller = diceRoller;
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        if ('damage' in itemData) {
            itemData.damage.parts = itemData.damage.parts
                .map((damagePart: [string, DND5e.DamageType| 'none']) => {
                    const multipliedExpression: string = this._diceRoller.multiply(damagePart[0], this._multiplierValue);
                    return [multipliedExpression, damagePart[1]];
                });
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'damage' property`);
    }

}



export { Dnd5EAlchemicalEffectName, Damage5e, DescriptiveEffect5e }