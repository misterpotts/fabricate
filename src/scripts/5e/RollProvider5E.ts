import {RollProvider} from "../crafting/check/RollProvider";
import {Tool} from "../crafting/Tool";
import AbilityType = DND5e.AbilityType;
import Character = data5e.Character;
import PatchActor5e = PatchTypes5e.PatchActor5e;
import CharacterAbility = PatchTypes5e.CharacterAbility;
import OwnedItemPatch5e = PatchTypes5e.OwnedItemPatch5e;
import PatchAttributes5e = PatchTypes5e.PatchAttributes5e;

interface ModifierCalculator {

    calculate(actor: PatchActor5e): RollTerm;

}

class ToolProficiencyModifierCalculator implements ModifierCalculator {

    private readonly _tool: Tool;

    constructor(tool: Tool) {
        this._tool = tool;
    }

    calculate(actor: PatchTypes5e.PatchActor5e): RollTerm {
        const characterData: Character = actor.getRollData() as Character;
        const allToolProficiencies: string[] = characterData.traits.toolProf.custom.split(',')
            .map((customProficiency: string) => customProficiency.trim())
            .concat(characterData.traits.toolProf.value);
        const hasToolProficiency: string = allToolProficiencies
            .find((toolProficiency: string) => this._tool.proficiencyLabel.localeCompare(toolProficiency, undefined, {sensitivity: 'base'}) === 0);
        if (!hasToolProficiency) {
            return new NumericTerm({ number: 0 });
        }
        const ownsTool: OwnedItemPatch5e = actor.items
            .find((item: OwnedItemPatch5e) => this._tool.displayName.localeCompare(item.data.name, undefined, {sensitivity: 'base'}) === 0);
        if (!ownsTool) {
            return new NumericTerm({ number: 0 });
        }
        const characterAttributes: PatchAttributes5e = characterData.attributes as PatchAttributes5e;
        return new NumericTerm({ number: characterAttributes.prof });
    }

}

class CraftingAbilityModifierCalculator implements ModifierCalculator {

    private readonly _ability: DND5e.AbilityType;

    constructor(ability: DND5e.AbilityType) {
        this._ability = ability;
    }

    calculate(actor: PatchTypes5e.PatchActor5e): RollTerm {
        const characterData: Character = actor.getRollData() as Character;
        const craftingAbility = characterData.abilities[this._ability] as CharacterAbility;
        return new NumericTerm({ number: craftingAbility.mod });
    }

}

interface RollProvider5EConfig {

    modifierCalculators: ModifierCalculator[];

}

class RollProvider5E implements RollProvider<PatchActor5e> {

    private readonly _modifierCalculators: ModifierCalculator[];

    constructor(config: RollProvider5EConfig) {
        this._modifierCalculators = config.modifierCalculators;
    }

    fromExpression(expression:string): Roll {
        return new Roll(expression);
    }

    getForActor(actor: PatchActor5e): Roll {
        const rollTerms: RollTerm[] = this._modifierCalculators.map(calculator => calculator.calculate(actor))
            .flatMap((rollTerm: RollTerm) => [rollTerm, new OperatorTerm({ operator: "+" })]);
        return Roll.fromTerms(rollTerms);
    }

    combine(left: Roll, right: Roll) {
        const simplifiedTerms: RollTerm[] = Roll.simplifyTerms(left.terms.concat(right.terms));
        return Roll.fromTerms(simplifiedTerms);
    }
}

class RollProvider5EFactory {

    make(ability: AbilityType, tool?: Tool): RollProvider5E {
        const modifierCalculators: ModifierCalculator[] = [];

        const abilityModifierCalculator: CraftingAbilityModifierCalculator = new CraftingAbilityModifierCalculator(ability);
        modifierCalculators.push(abilityModifierCalculator);

        if (tool) {
            const proficiencyModifierCalculator = new ToolProficiencyModifierCalculator(tool);
            modifierCalculators.push(proficiencyModifierCalculator);
        }

        return new RollProvider5E({ modifierCalculators: modifierCalculators } );
    }

}

export { RollProvider5E, CraftingAbilityModifierCalculator, ToolProficiencyModifierCalculator, RollProvider5EFactory }