import {AlchemicalEffect, AlchemicalEffectType} from "../crafting/alchemy/AlchemicalEffect";
import {Combination} from "../common/Combination";
import {EssenceDefinition} from "../common/EssenceDefinition";
import {DiceUtility} from "../foundry/DiceUtility";

interface AoeExtension {
    units: DND5e.TargetUnitType;
    value: number;
}

interface Damage {
    expression: string;
    type: DND5e.DamageType;
}

class AlchemicalEffect5e extends AlchemicalEffect<Item5e.Data.Data> {

    protected constructor(builder: AlchemicalEffect5e.Builder) {
        super(builder);
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData.description.value += `<p>${this.description}</p>`;
        return itemData;
    }

}

class Damage5e extends AlchemicalEffect5e {
    private readonly _damage: Damage;

    constructor(builder: AlchemicalEffect5e.DamageBuilder) {
        super(builder);
        this._damage = builder.damage;
    }

    public static builder(): AlchemicalEffect5e.DamageBuilder {
        return new AlchemicalEffect5e.DamageBuilder();
    }

    get damage(): Damage {
        return this._damage;
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData = super.applyTo(itemData);
        if ('damage' in itemData) {
            itemData.damage.parts.push([this._damage.expression, this._damage.type]);
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'damage' property`);
    }

}

class Condition5e extends AlchemicalEffect5e {

    constructor(builder: AlchemicalEffect5e.ConditionBuilder) {
        super(builder);
    }

    public static builder(): AlchemicalEffect5e.ConditionBuilder {
        return new AlchemicalEffect5e.ConditionBuilder();
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData = super.applyTo(itemData);
        return itemData;
    }

}

class AoeExtension5e extends AlchemicalEffect5e {
    private readonly _aoeExtension: AoeExtension;

    constructor(builder: AlchemicalEffect5e.AoeExtensionBuilder) {
        super(builder);
        this._aoeExtension = builder.aoeExtension;
    }

    public static builder(): AlchemicalEffect5e.AoeExtensionBuilder {
        return new AlchemicalEffect5e.AoeExtensionBuilder();
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData = super.applyTo(itemData);
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

    constructor(builder: AlchemicalEffect5e.SavingThrowModifierBuilder) {
        super(builder);
        this._savingThrowModifier = builder.savingThrowModifier;
    }

    public static builder(): AlchemicalEffect5e.SavingThrowModifierBuilder {
        return new AlchemicalEffect5e.SavingThrowModifierBuilder();
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData = super.applyTo(itemData);
        if ('save' in itemData) {
            itemData.save.dc += this._savingThrowModifier;
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'save' property`);
    }

}

class DiceMultiplier5e extends AlchemicalEffect5e {
    private readonly _diceMultiplier: number;

    constructor(builder: AlchemicalEffect5e.DiceMultiplierBuilder) {
        super(builder);
        this._diceMultiplier = builder.diceMultiplier;
    }

    public static builder(): AlchemicalEffect5e.DiceMultiplierBuilder {
        return new AlchemicalEffect5e.DiceMultiplierBuilder();
    }

    applyTo(itemData: Item5e.Data.Data): Item5e.Data.Data {
        itemData = super.applyTo(itemData);
        if ('damage' in itemData) {
            itemData.damage.parts = itemData.damage.parts
                .map((damagePart: [string, DND5e.DamageType| 'none']) => {
                    const multipliedExpression: string = this.diceUtility.multiply(damagePart[0], this._diceMultiplier);
                    return [multipliedExpression, damagePart[1]];
                });
            return itemData;
        }
        throw new Error(`Type '${typeof itemData}' does not include the required 'damage' property`);
    }

}

namespace AlchemicalEffect5e {

    export class Builder extends AlchemicalEffect.Builder<Item5e.Data.Data>{

    }

    export class DamageBuilder extends Builder {
        public damage: Damage;

        public build(): Damage5e {
            return new Damage5e(this);
        }

        public withEssenceCombination(value: Combination<EssenceDefinition>): DamageBuilder {
            this.essenceCombination = value;
            return this;
        }

        public withDescription(value: string): DamageBuilder {
            this.description = value;
            return this;
        }

        public withType(value: AlchemicalEffectType): DamageBuilder {
            this.type = value;
            return this;
        }

        public withDiceUtility(value: DiceUtility): DamageBuilder {
            this.diceUtility = value;
            return this;
        }

        public withDamage(value: Damage): DamageBuilder {
            this.damage = value;
            return this;
        }
    }

    export class ConditionBuilder extends Builder {

        public type: AlchemicalEffectType = AlchemicalEffectType.BASIC;

        public build(): Condition5e {
            return new Condition5e(this);
        }

        public withEssenceCombination(value: Combination<EssenceDefinition>): ConditionBuilder {
            this.essenceCombination = value;
            return this;
        }

        public withDescription(value: string): ConditionBuilder {
            this.description = value;
            return this;
        }

        public withDiceUtility(value: DiceUtility): ConditionBuilder {
            this.diceUtility = value;
            return this;
        }

    }

    export class AoeExtensionBuilder extends Builder {

        public aoeExtension: AoeExtension;
        public type: AlchemicalEffectType = AlchemicalEffectType.BASIC;

        public build(): AoeExtension5e {
            return new AoeExtension5e(this);
        }

        public withEssenceCombination(value: Combination<EssenceDefinition>): AoeExtensionBuilder {
            this.essenceCombination = value;
            return this;
        }

        public withDescription(value: string): AoeExtensionBuilder {
            this.description = value;
            return this;
        }

        public withDiceUtility(value: DiceUtility): AoeExtensionBuilder {
            this.diceUtility = value;
            return this;
        }

        public withAoEExtension(value: AoeExtension): AoeExtensionBuilder {
            this.aoeExtension = value;
            return this;
        }

    }

    export class SavingThrowModifierBuilder extends Builder {

        public savingThrowModifier: number;
        public type: AlchemicalEffectType = AlchemicalEffectType.BASIC;

        public build(): SavingThrowModifier5e {
            return new SavingThrowModifier5e(this);
        }

        public withEssenceCombination(value: Combination<EssenceDefinition>): SavingThrowModifierBuilder {
            this.essenceCombination = value;
            return this;
        }

        public withDescription(value: string): SavingThrowModifierBuilder {
            this.description = value;
            return this;
        }

        public withDiceUtility(value: DiceUtility): SavingThrowModifierBuilder {
            this.diceUtility = value;
            return this;
        }

        public withSavingThrowModifier(value: number): SavingThrowModifierBuilder {
            this.savingThrowModifier = value;
            return this;
        }

    }

    export class DiceMultiplierBuilder extends Builder {

        public diceMultiplier: number;
        public type: AlchemicalEffectType = AlchemicalEffectType.MODIFIER;

        public build(): DiceMultiplier5e {
            return new DiceMultiplier5e(this);
        }

        public withEssenceCombination(value: Combination<EssenceDefinition>): DiceMultiplierBuilder {
            this.essenceCombination = value;
            return this;
        }

        public withDescription(value: string): DiceMultiplierBuilder {
            this.description = value;
            return this;
        }

        public withDiceUtility(value: DiceUtility): DiceMultiplierBuilder {
            this.diceUtility = value;
            return this;
        }

        public withDiceMultiplier(value: number): DiceMultiplierBuilder {
            this.diceMultiplier = value;
            return this;
        }

    }

}



export {Damage5e, Condition5e, AoeExtension5e, SavingThrowModifier5e, DiceMultiplier5e}