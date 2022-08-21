import {AlchemicalEffect, AlchemicalEffectType} from "../crafting/alchemy/AlchemicalEffect";
import {DiceRoller} from "../foundry/DiceRoller";
import DamageType = DND5e.DamageType;

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

interface AlchemicalEffect5eConfig {
    damage?: Damage5e;
    aoeExtension?: AoeExtension5e;
    flavour?: FlavourEffect5e;
    saveModifier?: FlavourOnly5e;
    damageMultiplier?: DamageMultiplier5e;
}

class AlchemicalEffect5e implements AlchemicalEffect {

    private readonly _damage: Damage5e;
    private readonly _aoeExtension: AoeExtension5e;
    private readonly _flavour: FlavourOnly5e;
    private readonly _saveModifier: SaveModifier5e;
    private readonly _damageMultiplier: DamageMultiplier5e;

    constructor({
                    damage = new NoDamage5e(),
                    aoeExtension = new NoAoeExtension5e(),
                    flavour = new NoFlavour5e(),
                    saveModifier = new NoSaveModifier5e(),
                    damageMultiplier = new NoDamageMultiplier5e()
                }: AlchemicalEffect5eConfig) {
        this._damage = damage;
        this._aoeExtension = aoeExtension;
        this._flavour = flavour;
        this._saveModifier = saveModifier;
        this._damageMultiplier = damageMultiplier;
    }

    get description(): string {
        return undefined;
    }

    get damage(): Damage5e {
        return this._damage;
    }

    get aoeExtension(): AoeExtension5e {
        return this._aoeExtension;
    }

    get flavour(): FlavourOnly5e {
        return this._flavour;
    }

    get saveModifier(): SaveModifier5e {
        return this._saveModifier;
    }

    get damageMultiplier(): DamageMultiplier5e {
        return this._damageMultiplier;
    }

    applyTo(other: AlchemicalEffect): AlchemicalEffect {
        if (other !instanceof AlchemicalEffect5e) {
            throw new Error("Cannot combine AlchemicalEffect5e with other game system implementations of AlchemicalEffect. ")
        }
        const otherAlchemicalEffect5e: AlchemicalEffect5e = other as AlchemicalEffect5e;
        const resultantDamage: Damage5e = otherAlchemicalEffect5e.damage.combineWith(this._damage);
        return new AlchemicalEffect5e({damage: resultantDamage})
    }

}

interface MechanicalEffect<T> {

    combineWith(other: T): T;
    describe(): string;

}

interface DiceConfig {
    number: number;
    faces: number;
}

class DiceGroup {

    private readonly _diceByFaces: Map<number, DiceConfig>;

    constructor(diceByFaces: Map<number, DiceConfig>) {
        this._diceByFaces = diceByFaces;
    }

    get diceByFaces(): Map<number, DiceConfig> {
        return new Map(this._diceByFaces);
    }

    combineWith(other: DiceGroup): DiceGroup {
        const targetDiceByFaces: Map<number, DiceConfig> = other.diceByFaces;
        Array.from(this._diceByFaces.keys())
            .forEach(faces => {
                if (targetDiceByFaces.has(faces)) {
                    const otherDice = targetDiceByFaces.get(faces);
                    otherDice.number += this._diceByFaces.get(faces).number;
                } else {
                    targetDiceByFaces.set(faces, this._diceByFaces.get(faces));
                }
            });
        return new DiceGroup(targetDiceByFaces);
    }

    get description(): string {
        return Array.from(this._diceByFaces.values())
            .sort((a, b) => b.faces - a.faces)
            .map(dice => `${dice.number}d${dice.faces}`)
            .join(" + ");
    }

}

interface Damage5e extends MechanicalEffect<Damage5e>{

    damageAmounts: Map<DamageType, DiceGroup>;

}

class DefaultDamage5e implements Damage5e {

    private readonly _damageAmounts: Map<DamageType, DiceGroup>;

    constructor(damage: Map<DamageType, DiceGroup>) {
        this._damageAmounts = damage;
    }

    describe(): string {
        return "Adds " + Array.from(this._damageAmounts.keys()).map(damageType => {
            const dice = this._damageAmounts.get(damageType);
            return `${dice.description} ${damageType} damage`
        }).join(", as well as ");
    }

    get damageAmounts(): Map<DND5e.DamageType, DiceGroup> {
        return new Map<DND5e.DamageType, DiceGroup>(this._damageAmounts);
    }

    combineWith(other: Damage5e): Damage5e {
        const target: Map<DamageType, DiceGroup> = other.damageAmounts;
        Array.from(this._damageAmounts.keys())
            .forEach(damageType => {
                if (target.has(damageType)) {
                    const initialDice = target.get(damageType);
                    const combinedDice = initialDice.combineWith(this._damageAmounts.get(damageType));
                    target.set(damageType, combinedDice);
                } else {
                    target.set(damageType, this._damageAmounts.get(damageType));
                }
            });
        return new DefaultDamage5e(target);
    }

}

interface DescriptiveEffect5eConfig {
    effectDetail: string;
    effectDescription: string;
}

/**
 * Used for Conditions
 */
class FlavourEffect5e extends AlchemicalEffect5e {

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



export {Dnd5EAlchemicalEffectType, DefaultDamage5e}