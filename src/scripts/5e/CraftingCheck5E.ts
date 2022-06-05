import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {OutcomeType} from "../core/OutcomeType";
import {DiceUtility, RollResult} from "../foundry/DiceUtility";
import {ContributionCounter} from "../crafting/check/ContributionCounter";
import {Tool} from "../crafting/Tool";
import {CraftingCheck} from "../crafting/check/CraftingCheck";
import AbilityType = DND5e.AbilityType;
import Character = Actor5e.Data.Character;
import {CraftingCheckResult} from "../crafting/check/CraftingCheckResult";

interface PatchAbility5e {
    value: number;
    proficient: number;
    mod: number;
    saveBonus: number;
    checkBonus: number;
    save: number | typeof NaN;
    prof: number | typeof NaN;
    dc: number | typeof NaN;
}

type PatchCharacter5e = Character & {attributes: {prof: number}};

interface CraftingCheck5EConfig {
    ability: AbilityType;
    tool: Tool;
    exceedThreshold: boolean,
    baseDC: number,
    contributionCounter: ContributionCounter;
    diceRoller?: DiceUtility;
}

class CraftingCheck5E implements CraftingCheck<Actor5e>{
    private readonly _ability: AbilityType;
    private readonly _tool: Tool;
    private readonly _rollMustExceedThreshold: boolean;
    private readonly _diceRoller: DiceUtility;
    private readonly _baseThreshold: number;
    private readonly _contributionCounter: ContributionCounter;
    
    public constructor(config: CraftingCheck5EConfig) {
        this._tool = config.tool;
        this._ability = config.ability;
        this._diceRoller = config.diceRoller ? config.diceRoller : new DiceUtility();
        this._rollMustExceedThreshold = config.exceedThreshold;
        this._baseThreshold = config.baseDC;
        this._contributionCounter = config.contributionCounter;
    }

    public perform(actor: Actor5e, components: Combination<CraftingComponent>): CraftingCheckResult {
        if (!this.getSupportedActorTypes().includes(actor.data.type)) {
            throw new Error(`The only Actor types that can perform Crafting Checks are 
            "${this.getSupportedActorTypes().join(', ')}". ${actor.name} is a ${actor.data.type}`);
        }
        const dieData: DiceTerm.TermData = this.getRollTermData(actor);
        const rolledResult: RollResult = this._diceRoller.roll(dieData);
        const successThreshold = this.getSuccessThreshold(components);
        const outcome: OutcomeType = this.compare(rolledResult.value, successThreshold, this._rollMustExceedThreshold);
        return new CraftingCheckResult(outcome, rolledResult.expression, rolledResult.value, successThreshold);
    }

    private compare(result: number, threshold: number, exceedThreshold: boolean): OutcomeType {
        switch (exceedThreshold) {
            case true:
                return result > threshold ? OutcomeType.SUCCESS : OutcomeType.FAILURE;
            case false:
                return result >= threshold ? OutcomeType.SUCCESS : OutcomeType.FAILURE;
        }
    }

    /**
    * Converts one or more numeric values (positive or negative) into modifier expressions with the appropriate sign
     * ('+' or '-') prepended to each modifier (preserves ordering)
     *
     * @param values the numeric values to convert
     * @returns string[] the converted expression parts in the same order
    * */
    protected convertToModifierExpression(...values: number[]): string[] {
        if (!values || values.length === 0) {
            return [];
        }
        return values.map((value => `${Math.sign(value) < 1 ? '-' : '+'}${value}`));
    }

    protected getSuccessThreshold(components: Combination<CraftingComponent>): number {
        const dcModifier: number = this._contributionCounter.determineDCModifier(components);
        return this._baseThreshold + dcModifier;
    }

    protected getRollTermData(actor: Actor5e): DiceTerm.TermData {
        const modifiers: string[] = this.getModifiers(actor, this._ability, this._tool);
        return {
            number: 1,
            faces: 20,
            modifiers:
            modifiers,
            options: {}
        };
    }

    private getModifiers(actor: Actor5e, ability: AbilityType, tool?: Tool): string[] {
        const craftingAbility: PatchAbility5e = <PatchAbility5e>actor.data.data.abilities[ability];
        if (!craftingAbility) {
            throw new Error(`No ability definition for '${ability}' was found on Actor ${actor.name}`);
        }
        if (!tool) {
            return this.convertToModifierExpression(craftingAbility.mod);
        }
        const character: PatchCharacter5e = <PatchCharacter5e>actor.data.data;
        const allToolProficiencies: string[] = character.traits.toolProf.custom.split(',')
            .map((customProficiency: string) => customProficiency.trim())
            .concat(character.traits.toolProf.values);
        const hasToolProficiency: string = allToolProficiencies
            .find((toolProficiency: string) => tool.proficiencyLabel.localeCompare(toolProficiency, undefined, {sensitivity: 'base'}) === 0);
        if (!hasToolProficiency) {
            return this.convertToModifierExpression(craftingAbility.mod);
        }
        const ownsTool: Item5e = actor.items
            .find((item: Item5e) => item.type === 'tool' && tool.displayName.localeCompare(item.name, undefined, {sensitivity: 'base'}) === 0);
        if (!ownsTool) {
            return this.convertToModifierExpression(craftingAbility.mod);
        }
        return this.convertToModifierExpression(craftingAbility.mod, character.attributes.prof);
    }

    protected getSupportedActorTypes(): string[] {
        return ['creature', 'npc'];
    }

    get baseThreshold(): number {
        return this._baseThreshold;
    }

}

export {CraftingCheck5E, CraftingCheck5EConfig}