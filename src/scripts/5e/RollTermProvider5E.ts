import {RollTermProvider} from "../crafting/check/RollTermProvider";
import {Tool} from "../crafting/Tool";
import AbilityType = DND5e.AbilityType;
import Character = Actor5e.Data.Character;

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

interface RollTermProvider5EConfig {

    ability: AbilityType;
    tool?: Tool;

}

class RollTermProvider5E implements RollTermProvider<Actor5e> {

    private readonly _ability: DND5e.AbilityType;
    private readonly _tool?: Tool;

    constructor(config: RollTermProvider5EConfig) {
        this._ability = config.ability;
        this._tool = config.tool;
    }

    getFor(actor: Actor5e): DiceTerm.TermData {
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

}

export {RollTermProvider5E}