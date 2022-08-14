import {AlchemicalEffect, AlchemicalEffectType} from "../crafting/alchemy/AlchemicalEffect";
import {DiceRoller} from "../foundry/DiceRoller";

enum Dnd5EAlchemicalEffectType {
    AOE_EXTENSION,
    DAMAGE,
    DAMAGE_MULTIPLIER,
    DESCRIPTIVE,
    SAVE_MODIFIER
}

interface AoeExtension {
    units: DND5e.Unit;
    value: number;
}

interface Damage {
    expression: string;
    type: DND5e.DamageType;
}

interface AlchemicalEffect5eConfig {
    description: string;
    type: AlchemicalEffectType;
}

abstract class AlchemicalEffect5e implements AlchemicalEffect<Item5e.Data.Data> {

    private readonly _description: string;
    private readonly _type: AlchemicalEffectType;

    protected constructor(alchemicalEffect5eConfig: AlchemicalEffect5eConfig) {
        this._description = alchemicalEffect5eConfig.description;
        this._type = alchemicalEffect5eConfig.type;
    }

    abstract applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data;

    get description(): string {
        return this._description;
    }

    get type(): AlchemicalEffectType {
        return this._type;
    }

}

class Damage5e extends AlchemicalEffect5e {
    private readonly _damage: Damage;

    constructor(damage: Damage) {
        super({
            type: AlchemicalEffectType.BASIC,
            description: `Adds an additional ${damage.expression} ${damage.type} damage. `
        });
        this._damage = damage;
    }

    get damage(): Damage {
        return this._damage;
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        if ('damage' in itemData) {
            itemData.damage.parts.push([this._damage.expression, this._damage.type]);
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'damage' property`);
    }

}

interface DescriptiveEffect5eConfig {
    effectDetail: string;
    effectDescription: string;
}

/**
 * Used for Conditions
 */
class DescriptiveEffect5e extends AlchemicalEffect5e {

    private readonly _effectDetail: string;

    constructor(config: DescriptiveEffect5eConfig) {
        super({
            type: AlchemicalEffectType.BASIC,
            description: config.effectDescription
        });
        this._effectDetail = config.effectDetail;
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData.description.value += `<p>${this._effectDetail}</p>`;
        return itemData;
    }

}

class AoeExtension5e extends AlchemicalEffect5e {
    private readonly _aoeExtension: AoeExtension;

    constructor(aoeExtension: AoeExtension) {
        super({
            type: AlchemicalEffectType.BASIC,
            description: `Increases the effect radius of the item by ${aoeExtension.value} ${aoeExtension.units}. `
        });
        this._aoeExtension = aoeExtension;
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        if ('target' in itemData) {
            if (itemData.target.units !== this._aoeExtension.units) {
                throw new Error(`You may not mix units in Alchemical Effects AoE Extensions. Found ${itemData.target.units}, expected ${this._aoeExtension.units}`);
            }
            itemData.target.value += this._aoeExtension.value;
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'target' property`);
    }

}

class SavingThrowModifier5e extends AlchemicalEffect5e {
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

class DiceMultiplier5e extends AlchemicalEffect5e {
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



export {Damage5e, DescriptiveEffect5e, AoeExtension5e, SavingThrowModifier5e, DiceMultiplier5e, Dnd5EAlchemicalEffectType}