import {CompendiumEntry} from "../game/CompendiumData";
import {AlchemicalResult, ItemEffect, ItemEffectModifier} from "../core/AlchemicalResult";
import {AbilityType5E, DamageType5E, DurationType5e, ItemData5e, TargetType5e, TargetUnitType5e} from "../../global";

type DamageMethod = 'ROLLED' | 'FIXED';
const AoETypeValues: string[] = ['cone', 'cube' , 'cylinder', 'line', 'radius', 'sphere', 'square'];
type AoEType = 'cone' | 'cube'  | 'cylinder' | 'line' | 'radius' | 'sphere' | 'square';
type Dice = {
    faces: 4 | 6 | 8 | 10 | 12 | 20 | 100;
    amount: number;
};
type ModificationMethod = 'ADD' | 'MULTIPLY';

class DamageEffect5E implements ItemEffect<ItemData5e> {
    method: DamageMethod;
    type: DamageType5E;
    die?: Dice;
    amount?: number;
    bonus?: number;

    private constructor(method: DamageMethod, type: DamageType5E, die?: Dice, bonus?: number, amount?: number) {
        this.method = method;
        this.type = type;
        this.die = die;
        this.bonus = bonus;
        this.amount = amount;
    }

    public static rolledDamage(type: DamageType5E, dice: Dice, bonus?: number): DamageEffect5E {
        return new DamageEffect5E('ROLLED', type, dice, bonus);
    }

    public static fixedDamage(type: DamageType5E, amount: number, bonus?: number): DamageEffect5E {
        return new DamageEffect5E('FIXED', type, null, bonus, amount);
    }

    applyTo(itemData: ItemData5e) {
        if (!itemData.damage) {
            itemData.damage = {
                parts: [],
                versatile: '',
            };
        }
        let damageExpression = '';
        if (this.method === 'ROLLED') {
            damageExpression = this.die.amount + 'd' + this.die.faces;
        } else if (this.method === 'FIXED') {
            damageExpression = String(this.amount);
        }
        if (this.bonus) {
            damageExpression += ' + ' + String(this.bonus);
        }
        itemData.damage.parts.push([damageExpression, this.type]);
    }
}

class EffectDuration5E implements ItemEffect<ItemData5e> {
    value?: number;
    units: DurationType5e;

    constructor(units: DurationType5e, value: number) {
        this.units = units;
        this.value = value;
    }

    applyTo(itemData: ItemData5e): void {
        itemData.duration = {
            units: this.units,
            value: this.value
        };
    }
}

class SavingThrowEffect5E implements ItemEffect<ItemData5e> {
    ability: AbilityType5E;
    dc: number;
    scaling: 'flat' = 'flat';

    constructor(ability: AbilityType5E, dc: number, scaling: 'flat') {
        this.ability = ability;
        this.dc = dc;
        this.scaling = scaling;
    }

    applyTo(itemData: ItemData5e): void {
        itemData.save = {
            dc: this.dc,
            scaling: this.scaling,
            ability: this.ability
        };
    }
}

class EffectTarget5E implements ItemEffect<ItemData5e> {
    units: TargetUnitType5e;
    value: number;
    type: TargetType5e;

    constructor(units: TargetUnitType5e, value: number, type: TargetType5e) {
        this.units = units;
        this.value = value;
        this.type = type;
    }

    applyTo(itemData: ItemData5e): void {
        itemData.target = {
            value: this.value,
            units: this.units,
            type: this.type
        };
    }
}

class AoEExtender5E implements ItemEffectModifier<ItemData5e> {
    mode: ModificationMethod;
    areaType: AoEType;
    amount: number;

    constructor(mode: ModificationMethod, amount: number, areaType: AoEType) {
        this.mode = mode;
        this.amount = amount;
        this.areaType = areaType;
    }

    transform(itemEffect: ItemEffect<ItemData5e>): ItemEffect<ItemData5e> {
        if (!this.matches(itemEffect)) {
            throw new Error('An AoEExtender5E can only be applied to an EffectTarget5E');
        }
        const target: EffectTarget5E = <EffectTarget5E>itemEffect;
        switch (this.mode) {
            case 'ADD':
                if (AoETypeValues.indexOf(target.type) < 0) {
                    target.value = this.amount;
                } else {
                    target.value = target.value + this.amount;
                }
                break;
            case 'MULTIPLY':
                target.value = target.value * this.amount;
                break;
        }
        target.type = this.areaType;
        target.units = 'ft';
        return itemEffect;
    }

    matches(itemEffect: ItemEffect<ItemData5e>): boolean {
        return itemEffect instanceof EffectTarget5E;
    }

}

class DamageModifier5E implements ItemEffectModifier<ItemData5e> {
    mode: ModificationMethod;
    amount: number;

    constructor(mode: ModificationMethod, amount: number) {
        this.mode = mode;
        this.amount = amount;
    }

    transform(itemEffect: ItemEffect<ItemData5e>): ItemEffect<ItemData5e> {
        if (!this.matches(itemEffect)) {
            throw new Error('A DamageModifier5E can only be applied to a DamageEffect5E');
        }
        const damage: DamageEffect5E = <DamageEffect5E>itemEffect;
        switch (this.mode) {
            case 'ADD':
                damage.die.amount = damage.die.amount + this.amount;
                break;
            case 'MULTIPLY':
                damage.die.amount = damage.die.amount * this.amount;
                break;
        }
        return itemEffect;
    }

    matches(itemEffect: ItemEffect<ItemData5e>): boolean {
        return itemEffect instanceof DamageEffect5E;
    }
}

class SavingThrowModifier5E implements ItemEffectModifier<ItemData5e> {
    mode: ModificationMethod;
    value: number;

    constructor(mode: ModificationMethod, value: number) {
        this.mode = mode;
        this.value = value;
    }

    transform(itemEffect: ItemEffect<ItemData5e>): ItemEffect<ItemData5e> {
        if (!this.matches(itemEffect)) {
            throw new Error('A SavingThrowModifier5E can only be applied to a SavingThrowEffect5E');
        }
        const savingThrow: SavingThrowEffect5E = <SavingThrowEffect5E>itemEffect;
        switch (this.mode) {
            case 'ADD':
                savingThrow.dc = savingThrow.dc + this.value;
                break;
            case 'MULTIPLY':
                savingThrow.dc = savingThrow.dc * this.value;
                break;
        }
        return itemEffect;
    }

    matches(itemEffect: ItemEffect<ItemData5e>): boolean {
        return itemEffect instanceof SavingThrowEffect5E;
    }
}

class AlchemicalResult5E implements AlchemicalResult<ItemData5e> {

    private readonly _descriptionParts: string[];
    private readonly _essenceCombination: string[];
    private readonly _resultantItem: CompendiumEntry;

    private readonly _effects: ItemEffect<ItemData5e>[] = [];
    private readonly _effectModifiers: ItemEffectModifier<ItemData5e>[] = [];

    constructor(builder: AlchemicalResult5E.Builder) {
        this._descriptionParts = builder.description;
        this._essenceCombination = builder.essenceCombination;
        this._resultantItem = builder.resultantItem;
        this._effects = builder.effects;
        this._effectModifiers = builder.modifiers;
    }

    get description(): string {
        return this._descriptionParts.join(' ');
    }

    get essenceCombination(): string[] {
        return this._essenceCombination;
    }

    get resultantItem(): CompendiumEntry {
        return this._resultantItem;
    }

    get effects(): ItemEffect<ItemData5e>[] {
        return this._effects;
    }

    get effectModifiers(): ItemEffectModifier<ItemData5e>[] {
        return this._effectModifiers;
    }

    asItemData(): ItemData5e {
        const result: ItemData5e = {};
        result.description = this._descriptionParts.map((descriptionPart: string) => `<p>${descriptionPart}</p>`).join('\n');
        this._effects.filter((effect: ItemEffect<ItemData5e>) => {
            effect instanceof EffectTarget5E
        });
        this._effectModifiers.forEach((modifier: ItemEffectModifier<ItemData5e>) => {
            this._effects.forEach((effect: ItemEffect<ItemData5e>) => {
                if (modifier.matches(effect)) {
                    modifier.transform(effect);
                }
            });
        });
        this._effects.forEach((effect: ItemEffect<ItemData5e>) => effect.applyTo(result));
        return result;
    }

    combineWith(other: AlchemicalResult<ItemData5e>): AlchemicalResult<ItemData5e> {
        this.essenceCombination.push(...other.essenceCombination)
        this._descriptionParts.push(other.description);
        this._effects.push(...other.effects);
        this._effectModifiers.push(...other.effectModifiers);
        return this;
    }

    public static builder(): AlchemicalResult5E.Builder {
        return new AlchemicalResult5E.Builder();
    }
}

namespace AlchemicalResult5E {

    export class Builder {

        public description: string[] = [];
        public essenceCombination: string[] = [];
        public resultantItem: CompendiumEntry;
        public effects: ItemEffect<ItemData5e>[] = [];
        public modifiers: ItemEffectModifier<ItemData5e>[] = [];

        public withDescription(value: string): Builder {
            this.description.push(value);
            return this;
        }

        public withEssenceCombination(value: string[]): Builder {
            this.essenceCombination = value;
            return this;
        }

        public withResultantItem(compendiumKey: string, entryId: string): Builder {
            this.resultantItem = {compendiumKey: compendiumKey, entryId: entryId};
            return this;
        }

        withRolledDamage(dice: Dice, type: DamageType5E, bonus?: number): Builder {
            this.effects.push(DamageEffect5E.rolledDamage(type, dice, bonus));
            return this;
        }

        withFixedDamage(amount: number, type: DamageType5E, bonus?: number): Builder {
            this.effects.push(DamageEffect5E.fixedDamage(type, amount, bonus));
            return this;
        }

        withSavingThrow(ability: AbilityType5E, dc: number, scaling: 'flat'): Builder {
            this.effects.push(new SavingThrowEffect5E(ability, dc, scaling));
            return this;
        }

        withDuration(units: DurationType5e, value?: number): Builder {
            this.effects.push(new EffectDuration5E(units, value));
            return this;
        }

        withAoEExtender(mode: ModificationMethod, value: number, areaType:AoEType): Builder {
            this.modifiers.push(new AoEExtender5E(mode, value, areaType));
            return this;
        }

        withDamageModifier(mode: ModificationMethod, value: number): Builder {
            this.modifiers.push(new DamageModifier5E(mode, value));
            return this;
        }

        withSavingThrowModifier(mode: ModificationMethod, value: number): Builder {
            this.modifiers.push(new SavingThrowModifier5E(mode, value));
            return this;
        }

        withTarget(units: TargetUnitType5e, value: number, type: TargetType5e): Builder {
            this.effects.push(new EffectTarget5E(units, value, type));
            return this;
        }

        public build(): AlchemicalResult5E {
            return new AlchemicalResult5E(this);
        }

    }

}

export {AlchemicalResult5E}