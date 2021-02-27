import {CompendiumEntry} from "../game/CompendiumData";
import {AlchemicalResult, ItemEffect, ItemEffectModifier} from "../core/AlchemicalResult";

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
        const source: EffectTarget5E = <EffectTarget5E>itemEffect;
        let value: number = source.value;
        switch (this.mode) {
            case 'ADD':
                if (AoETypeValues.indexOf(source.type) < 0) {
                   value = this.amount;
                } else {
                    value = source.value + this.amount;
                }
                break;
            case 'MULTIPLY':
                value = source.value * this.amount;
                break;
        }
        const units: TargetUnitType5e = 'ft';
        const type: TargetType5e = this.areaType;
        const target: EffectTarget5E = new EffectTarget5E(units, value, type);
        return target;
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
        const source: DamageEffect5E = <DamageEffect5E>itemEffect;
        const die: Dice = {
            faces: source.die.faces,
            amount: source.die.amount
        };
        // todo - implement properly for fixed damage
        switch (this.mode) {
            case 'ADD':
                die.amount = source.die.amount + this.amount;
                break;
            case 'MULTIPLY':
                die.amount = source.die.amount * this.amount;
                break;
        }
        switch (source.method) {
            case "FIXED":
                return DamageEffect5E.fixedDamage(source.type, source.amount, source.bonus);
                break;
            case "ROLLED":
                return DamageEffect5E.rolledDamage(source.type, die, source.bonus)
                break;
        }
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
        const source: SavingThrowEffect5E = <SavingThrowEffect5E>itemEffect;
        let dc: number;
        switch (this.mode) {
            case 'ADD':
                dc = source.dc + this.value;
                break;
            case 'MULTIPLY':
                dc = source.dc * this.value;
                break;
        }
        return new SavingThrowEffect5E(source.ability, dc, source.scaling);
    }

    matches(itemEffect: ItemEffect<ItemData5e>): boolean {
        return itemEffect instanceof SavingThrowEffect5E;
    }
}

class AlchemicalResult5E implements AlchemicalResult<ItemData5e> {

    private readonly _descriptionParts: string[] = [];
    private readonly _essenceCombination: string[] = [];

    private readonly _effects: ItemEffect<ItemData5e>[] = [];
    private readonly _effectModifiers: ItemEffectModifier<ItemData5e>[] = [];

    constructor(builder?: AlchemicalResult5E.Builder) {
        if (builder) {
            this._descriptionParts = builder.description;
            this._essenceCombination = builder.essenceCombination;
            this._effects = builder.effects;
            this._effectModifiers = builder.effectModifiers;
        }
    }

    public duplicate(): AlchemicalResult<ItemData5e> {
        const other = new AlchemicalResult5E();
        this._descriptionParts.forEach((value: string) => other.descriptionParts.push(value));
        this._essenceCombination.forEach((value: string) => other.essenceCombination.push(value));
        this._effects.forEach((value: ItemEffect<ItemData5e>) => other.effects.push(value));
        this._effectModifiers.forEach((value: ItemEffectModifier<ItemData5e>) => other.effectModifiers.push(value));
        return other;
    }

    get description(): string {
        return this._descriptionParts.join(' ');
    }

    get essenceCombination(): string[] {
        return this._essenceCombination;
    }

    get effects(): ItemEffect<ItemData5e>[] {
        return this._effects;
    }

    get effectModifiers(): ItemEffectModifier<ItemData5e>[] {
        return this._effectModifiers;
    }

    get descriptionParts(): string[] {
        return this._descriptionParts;
    }

    asItemData(): ItemData5e {
        const result: ItemData5e = {};
        result.description = {
            value: this._descriptionParts.map((descriptionPart: string) => `<p>${descriptionPart}</p>`).join('\n'),
            chat: '',
            unidentified: ''
        };
        let modifiedEffects: ItemEffect<ItemData5e>[] = [];
        this._effects.forEach((effect: ItemEffect<ItemData5e>) => {
            let result = effect;
            this._effectModifiers.forEach((modifier: ItemEffectModifier<ItemData5e>) => {
                if (modifier.matches(effect)) {
                    result = modifier.transform(effect);
                }
            });
            modifiedEffects.push(result);
        });
        modifiedEffects.forEach((effect: ItemEffect<ItemData5e>) => effect.applyTo(result));
        return result;
    }

    combineWith(source: AlchemicalResult<ItemData5e>): AlchemicalResult<ItemData5e> {
        const self: AlchemicalResult<ItemData5e> = this.duplicate();
        const other: AlchemicalResult<ItemData5e> = source.duplicate();
        self.essenceCombination.push(...other.essenceCombination)
        self.descriptionParts.push(other.description);
        self.effects.push(...other.effects);
        self.effectModifiers.push(...other.effectModifiers);
        return self;
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
        public effectModifiers: ItemEffectModifier<ItemData5e>[] = [];

        public withDescription(value: string): Builder {
            this.description.push(value);
            return this;
        }

        public withEssenceCombination(value: string[]): Builder {
            this.essenceCombination = value;
            return this;
        }

        public withResultantItem(compendiumKey: string, entryId: string): Builder {
            this.resultantItem = {systemId: compendiumKey, partId: entryId};
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
            this.effectModifiers.push(new AoEExtender5E(mode, value, areaType));
            return this;
        }

        withDamageModifier(mode: ModificationMethod, value: number): Builder {
            this.effectModifiers.push(new DamageModifier5E(mode, value));
            return this;
        }

        withSavingThrowModifier(mode: ModificationMethod, value: number): Builder {
            this.effectModifiers.push(new SavingThrowModifier5E(mode, value));
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