import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalEffect} from "../crafting/alchemy/AlchemicalEffect";

interface AoeExtension {
    //@ts-ignore
    units: DND5e.TargetUnitType;
    value: number;
}

interface Damage {
    expression: string;
    type: DND5e.DamageType;
}

abstract class AlchemicalEffect5e extends AlchemicalEffect<ItemData> {

    protected constructor(builder: AlchemicalEffect5e.Builder) {
        super(builder);
    }

    applyTo(itemData: ItemData): ItemData {
        itemData.data.description.value += `<p>${this.description}</p>`;
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

    applyTo(itemData: ItemData): ItemData {
        itemData = super.applyTo(itemData);
        if ('damage' in itemData) {
            //@ts-ignore
            itemData.data.damage.parts.push([this._damage.expression, this._damage.type]);
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

    applyTo(itemData: ItemData): ItemData {
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

    applyTo(itemData: ItemData): ItemData {
        itemData = super.applyTo(itemData);
        if ('target' in itemData) {
            //@ts-ignore
            if (itemData.data.target.units !== this._aoeExtension.units) {
                //@ts-ignore
                throw new Error(`You may not mix units in Alchemical Effects AoE Extensions. Found ${itemData.data.target.units}, expected ${this._aoeExtension.units}`);
            }
            //@ts-ignore
            itemData.data.target.value += this._aoeExtension.value;
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

    applyTo(itemData: ItemData): ItemData {
        itemData = super.applyTo(itemData);
        if ('save' in itemData) {
            //@ts-ignore
            itemData.data.save.dc += this._savingThrowModifier;
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

    applyTo(itemData: ItemData): ItemData {
        itemData = super.applyTo(itemData);
        if ('damage' in itemData) {
            //@ts-ignore
            itemData.data.damage.parts = itemData.data.damage.parts
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

    export class Builder extends AlchemicalEffect.Builder<ItemData>{

    }

    export class DamageBuilder extends Builder {
        public damage: Damage;

        public build(): Damage5e {
            return new Damage5e(this);
        }

        public withDamage(value: Damage): DamageBuilder {
            this.damage = value;
            return this;
        }
    }

    export class ConditionBuilder extends Builder {

    }

    export class AoeExtensionBuilder extends Builder {
        public aoeExtension: AoeExtension;

        public build(): AoeExtension5e {
            return new AoeExtension5e(this);
        }

        public withAoEExtension(value: AoeExtension): AoeExtensionBuilder {
            this.aoeExtension = value;
            return this;
        }
    }

    export class SavingThrowModifierBuilder extends Builder {
        public savingThrowModifier: number;

        public build(): SavingThrowModifier5e {
            return new SavingThrowModifier5e(this);
        }

        public withSavingThrowModifier(value: number): SavingThrowModifierBuilder {
            this.savingThrowModifier = value;
            return this;
        }
    }

    export class DiceMultiplierBuilder extends Builder {
        public diceMultiplier: number;

        public build(): DiceMultiplier5e {
            return new DiceMultiplier5e(this);
        }

        public withDiceMultiplier(value: number): DiceMultiplierBuilder {
            this.diceMultiplier = value;
            return this;
        }
    }

}



export {Damage5e, Condition5e, AoeExtension5e, SavingThrowModifier5e, DiceMultiplier5e}