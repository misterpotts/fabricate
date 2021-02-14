import {CompendiumEntry} from "../core/CompendiumData";
import {AlchemicalResult} from "../AlchemicalResult";
import {AbilityType5E, DamageType5E, DurationType5e, ItemData5e} from "../../global";

interface ItemEffect5E {
    applyTo(itemData: ItemData5e): void;
}

interface ItemEffectModifier5E {
    transform(itemEffect: ItemEffect5E): ItemEffect5E;
    matches(itemEffect: ItemEffect5E): boolean;
}

class DamageEffect5E implements ItemEffect5E {
    method: 'ROLLED' | 'FIXED';
    type: DamageType5E;
    die?: {
        faces: 4 | 6 | 8 | 10 | 12 | 20 | 100;
        amount: number;
    };
    amount?: number;
    bonus?: number;

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

class EffectDuration5E implements ItemEffect5E {
    value?: number;
    units: DurationType5e;

    applyTo(itemData: ItemData5e): void {
        itemData.duration = {
            units: this.units,
            value: this.value
        };
    }
}

class SavingThrowEffect5E implements ItemEffect5E {
    ability: AbilityType5E;
    dc: number;
    scaling: 'flat' = 'flat';

    applyTo(itemData: ItemData5e): void {
        itemData.save = {
            dc: this.dc,
            scaling: this.scaling,
            ability: this.ability
        };
    }
}

class AreaOfEffect5E implements ItemEffect5E {
    units: 'ft' = 'ft';
    value: number;
    type: 'cone' | 'cube'  | 'cylinder' | 'line' | 'radius' | 'sphere' | 'square';

    applyTo(itemData: ItemData5e): void {
        itemData.target = {
            value: this.value,
            units: this.units,
            type:this.type
        };
    }
}

class AoEExtender5E implements ItemEffectModifier5E {
    mode: 'INCREASE' | 'MULTIPLY';
    amount: number;

    transform(itemEffect: ItemEffect5E): ItemEffect5E {
        switch (this.mode) {
            case "INCREASE":
                itemData.target.value = itemData.target.value + this.amount;
                break;
            case "MULTIPLY":
                itemData.target.value = itemData.target.value * this.amount;
                break;
        }
    }

    matches(itemEffect: ItemEffect5E): boolean {
        return itemEffect instanceof AreaOfEffect5E;
    }

}

class DamageModifier5E implements ItemEffectModifier5E {
    mode: 'ADD_DICE' | 'MULTIPLY_DICE';
    amount: number;

    transform(itemEffect: ItemEffect5E): ItemEffect5E {
    }

    matches(itemEffect: ItemEffect5E): boolean {
        return itemEffect instanceof DamageEffect5E;
    }
}

class SavingThrowModifier5E implements ItemEffectModifier5E {
    mode: 'ADD' | 'MULTIPLY';
    value: number;

    transform(itemEffect: ItemEffect5E): ItemEffect5E {
        if (!(itemEffect instanceof SavingThrowEffect5E)) {
            throw new Error(`Unable to apply Saving Throw transform effect. Supplied effect was not a Saving Throw`)
        }
    }

    matches(itemEffect: ItemEffect5E): boolean {
        return itemEffect instanceof SavingThrowEffect5E;
    }
}

class AlchemicalResult5E implements AlchemicalResult<ItemData5e> {

    private readonly _description: string;
    private readonly _essenceCombination: string[];
    private readonly _resultantItem: CompendiumEntry;

    private readonly _effects: ItemEffect5E[] = [];
    private readonly _modifiers: ItemEffect5E[] = [];

    constructor(builder: AlchemicalResult5E.Builder) {
        this._description = builder.description;
        this._essenceCombination = builder.essenceCombination;
        this._resultantItem = builder.resultantItem;
        this._effects = builder.effects;
        this._modifiers = builder.modifiers;
    }

    get description(): string {
        return this._description;
    }

    get essenceCombination(): string[] {
        return this._essenceCombination;
    }

    get resultantItem(): CompendiumEntry {
        return this._resultantItem;
    }

    get appliesModifier(): boolean {
        return this._modifiers.length > 0;
    }

    asItemData(): ItemData5e {
        const result: ItemData5e = {};
        this._effects.forEach((effect) => effect.applyTo(result));
        this._modifiers.forEach((modifier) => modifier.applyTo(result));
        return result;
    }

    public static builder(): AlchemicalResult5E.Builder {
        return new AlchemicalResult5E.Builder();
    }
}

namespace AlchemicalResult5E {

    export class Builder {

        public description: string;
        public essenceCombination: string[];
        public resultantItem: CompendiumEntry;
        public effects: ItemEffect5E[] = [];
        public modifiers: ItemEffectModifier5E[] = [];

        public withDescription(value: string): Builder {
            this.description = value;
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

        withDamage(value: DamageEffect5E): Builder {
            this.effects.push(value);
            return this;
        }

        withSavingThrow(value:SavingThrowEffect5E): Builder {
            this.effects.push(value);
            return this;
        }

        withDuration(value: EffectDuration5E): Builder {
            this.effects.push(value);
            return this;
        }

        withAoEExtender(value: AoEExtender5E): Builder {
            this.modifiers.push(value);
            return this;
        }

        withDamageMultiplier(value: DamageModifier5E): Builder {
            this.modifiers.push(value);
            return this;
        }

        withSavingThrowModifier(value: SavingThrowModifier5E): Builder {
            this.modifiers.push(value);
            return this;
        }

        withAreaOfEffect(value: AreaOfEffect5E): Builder {
            this.effects.push(value);
            return this;
        }

        public build(): AlchemicalResult5E {
            return new AlchemicalResult5E(this);
        }

    }

}

export {AlchemicalResult5E}