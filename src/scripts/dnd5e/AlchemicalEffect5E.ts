import {AlchemicalEffectType, BaseAlchemicalEffect} from "../core/AlchemicalEffect";

interface AoeExtension {
    units: TargetUnitType5e;
    value: number;
}

interface Damage {
    expression: string;
    type: DamageType5e;
}

abstract class BaseAlchemicalEffect5e extends BaseAlchemicalEffect<ItemData5e> {

    protected constructor(essenceCombination: string[], description: string, type: AlchemicalEffectType) {
        super(essenceCombination, description, type);
    }

    applyTo(itemData5e: ItemData5e): ItemData5e {
        itemData5e.description.value += `<p>${this.description}</p>`;
        return itemData5e;
    }
}

class Damage5e extends BaseAlchemicalEffect5e {
    private readonly _damage: Damage;

    constructor(essenceCombination: string[], description: string, damage: Damage) {
        super(essenceCombination, description, AlchemicalEffectType.BASIC);
        this._damage = damage;
    }

    get damage(): Damage {
        return this._damage;
    }

    applyTo(itemData5e: ItemData5e): ItemData5e {
        itemData5e = super.applyTo(itemData5e);
        itemData5e.damage.parts.push([this._damage.expression, this._damage.type]);
        return itemData5e;
    }

}

class Condition5e extends BaseAlchemicalEffect5e {

    constructor(essenceCombination: string[], description: string) {
        super(essenceCombination, description, AlchemicalEffectType.BASIC);
    }

    applyTo(itemData5e: ItemData5e): ItemData5e {
        itemData5e = super.applyTo(itemData5e);
        return itemData5e;
    }

}

class AoeExtension5e extends BaseAlchemicalEffect5e {
    private readonly _aoeExtension: AoeExtension;

    constructor(essenceCombination: string[], description: string, aoeExtension: AoeExtension) {
        super(essenceCombination, description, AlchemicalEffectType.BASIC);
        this._aoeExtension = aoeExtension;
    }

    applyTo(itemData5e: ItemData5e): ItemData5e {
        itemData5e = super.applyTo(itemData5e);
        if (itemData5e.target.units !== this._aoeExtension.units) {
            throw new Error(`You may not mix units in Alchemical Effects AoE Extensions. Found ${itemData5e.target.units}, expected ${this._aoeExtension.units}`);
        }
        itemData5e.target.value += this._aoeExtension.value;
        return itemData5e;
    }

}

class SavingThrowModifier5e extends BaseAlchemicalEffect5e {
    private readonly _savingThrowModifier: number;

    constructor(essenceCombination: string[], description: string, savingThrowModifier: number) {
        super(essenceCombination, description, AlchemicalEffectType.BASIC);
        this._savingThrowModifier = savingThrowModifier;
    }

    applyTo(itemData5e: ItemData5e): ItemData5e {
        itemData5e = super.applyTo(itemData5e);
        itemData5e.save.dc += this._savingThrowModifier;
        return itemData5e;
    }

}

class DiceMultiplier5e extends BaseAlchemicalEffect5e {
    private readonly _diceMultiplier: number;

    constructor(essenceCombination: string[], description: string, diceMultiplier: number) {
        super(essenceCombination, description, AlchemicalEffectType.MODIFIER);
        this._diceMultiplier = diceMultiplier;
    }

    applyTo(itemData5e: ItemData5e): ItemData5e {
        itemData5e = super.applyTo(itemData5e);
        itemData5e.damage.parts = itemData5e.damage.parts
            .map((damagePart: [string, DamageType5e]) => {
                // @ts-ignore
                const parsed: DiceTerm = DiceTerm.fromExpression(damagePart[0]);
                parsed.number = parsed.number * this._diceMultiplier;
                return [parsed.expression, damagePart[1]];
            });
        return itemData5e;
    }

}



export {Damage5e, Condition5e, AoeExtension5e, SavingThrowModifier5e, DiceMultiplier5e}