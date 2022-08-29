import {ModifierCalculator, GameSystemRollModifierProvider, RollModifierProviderFactory} from "../crafting/check/GameSystemRollModifierProvider";
import {Tool} from "../crafting/Tool";
import Character = data5e.Character;
import PatchActor5e = PatchTypes5e.PatchActor5e;
import CharacterAbility = PatchTypes5e.CharacterAbility;
import OwnedItemPatch5e = PatchTypes5e.OwnedItemPatch5e;
import PatchAttributes5e = PatchTypes5e.PatchAttributes5e;
import {DnD5ECraftingCheckSpec} from "../registries/system_definitions/interface/DnD5e";

class ToolProficiencyModifierCalculator implements ModifierCalculator<PatchActor5e> {

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

class CraftingAbilityModifierCalculator implements ModifierCalculator<PatchActor5e> {

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

class RollProvider5E implements GameSystemRollModifierProvider<PatchActor5e> {

    private readonly _modifierCalculators: ModifierCalculator<PatchActor5e>[];

    constructor({
        modifierCalculators = []
    }: {
        modifierCalculators?: ModifierCalculator<PatchActor5e>[];
    }) {
        this._modifierCalculators = modifierCalculators;
    }

    getForActor(actor: PatchActor5e): RollTerm[] {
        return this._modifierCalculators.map(calculator => calculator.calculate(actor));
    }


}

class RollProvider5EFactory implements RollModifierProviderFactory<PatchActor5e> {

    make(specification?: DnD5ECraftingCheckSpec): RollProvider5E {
        if (!specification) {
            return new RollProvider5E({});
        }

        const modifierCalculators: ModifierCalculator<PatchActor5e>[] = [];
        if (specification.addToolProficiency && specification.tool) {
            const tool = new Tool(specification.tool.name, specification.tool.skillProficiency);
            modifierCalculators.push(new ToolProficiencyModifierCalculator(tool));
        }
        modifierCalculators.push(new CraftingAbilityModifierCalculator(specification.ability));

        return new RollProvider5E({ modifierCalculators: modifierCalculators } );
    }

}

export { RollProvider5E, CraftingAbilityModifierCalculator, ToolProficiencyModifierCalculator, RollProvider5EFactory }