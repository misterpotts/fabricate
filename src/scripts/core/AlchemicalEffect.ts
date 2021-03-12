interface AlchemicalEffect<T> {
    essenceCombination: string[];
    description: string;
    applyTo(entity: Entity<T>): Entity<T>;
}

interface AoeExtension {
    units: TargetUnitType5e;
    value: number;
}

interface Damage {
    expression: string;
    type: DamageType5e;
}

class AlchemicalEffect5E implements AlchemicalEffect<ItemData5e> {

    private readonly _essenceCombination: string[] = [];
    private readonly _description: string;

    private readonly _condition: string;
    private readonly _damage: Damage;
    private readonly _aoeExtension: AoeExtension;
    private readonly _diceMultiplier: number;
    private readonly _savingThrowModifier: number;

    constructor(builder: AlchemicalEffect5E.Builder) {
        this._essenceCombination = builder.essenceCombination;
        this._description = builder.description;
        this._condition = builder.condition;
        this._damage = builder.damage;
        this._aoeExtension = builder.damage;
        this._diceMultiplier = builder.diceMultiplier;
        this._savingThrowModifier = builder.savingThrowModifier;
    }

    applyTo(entity: Entity<ItemData5e>): Entity<ItemData5e> {
        return undefined;
    }

    public static builder(): AlchemicalEffect5E.Builder {
        return new AlchemicalEffect5E.Builder();
    }

    get essenceCombination(): string[] {
        return this._essenceCombination;
    }

    get description(): string {
        return this._description;
    }

    get condition(): string {
        return this._condition;
    }

    get damage(): Damage {
        return this._damage;
    }

    get aoeExtension(): AoeExtension {
        return this._aoeExtension;
    }

    get diceMultiplier(): number {
        return this._diceMultiplier;
    }

    get savingThrowModifier(): number {
        return this._savingThrowModifier;
    }

}

namespace AlchemicalEffect5E {

    export class Builder {

        public essenceCombination: string[] = [];
        public description: string;
        public condition: string;
        public damage: any;
        public aoeExtension: any;
        public diceMultiplier: number;
        public savingThrowModifier: number;

        public build(): AlchemicalEffect5E {
            return new AlchemicalEffect5E(this);
        }

        withEssenceCombination(value: string[]): Builder {
            this.essenceCombination = value;
            return this;
        }

        withCondition(value: string): Builder {
            this.condition = value;
            return this;
        }

        withDescription(value: string): Builder {
            this.description = value;
            return this;
        }

        withDamage(expression: string, type: DamageType5e): Builder {
            this.damage = {expression: expression, type: type};
            return this;
        }

        withAoeExtension(amount: number, unit: TargetUnitType5e): Builder {
            this.aoeExtension = {amount: amount, unit: unit};
            return this;
        }

        withDiceMultiplier(value: number): Builder {
            this.diceMultiplier = value;
            return this;
        }

        withSavingThrowModifier(value: number): Builder {
            this.savingThrowModifier = value;
            return this;
        }

    }

}

export {AlchemicalEffect, AlchemicalEffect5E}