import {Tool} from "../crafting/Tool";
import {CraftingCheck} from "../crafting/CraftingCheck";
import AbilityType = DND5e.AbilityType;
import Character = Actor5e.Data.Character;
import {DiceUtility} from "../foundry/DiceUtility";

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

class CraftingCheck5e extends CraftingCheck<Actor5e> {
    private readonly _ability: AbilityType;
    private readonly _tool: Tool;

    constructor(builder: CraftingCheck5e.Builder) {
        super(false, builder.baseDC, builder.ingredientDCModifier, builder.essenceDCModifier, builder.diceRoller);
        this._ability = builder.ability;
        this._tool = builder.tool;
    }

    public static builder(): CraftingCheck5e.Builder {
        return new CraftingCheck5e.Builder();
    }

    protected getRollTermData(actor: Actor5e): DiceTerm.TermData {
        const modifiers: string[] = this.getModifiers(actor, this.ability, this.tool);
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

    get ability(): AbilityType {
        return this._ability;
    }

    get tool(): Tool {
        return this._tool;
    }
}

namespace CraftingCheck5e {

    export class Builder {

        public ability: AbilityType;
        public baseDC: number;
        public ingredientDCModifier: number;
        public essenceDCModifier: number;
        public tool: Tool;
        public diceRoller: DiceUtility = new DiceUtility();

        public build(): CraftingCheck5e {
            return new CraftingCheck5e(this);
        }

        public withAbility(value: AbilityType): Builder {
            this.ability = value;
            return this;
        }

        public withBaseDC(value: number): Builder {
            this.baseDC = value;
            return this;
        }

        public withIngredientDCModifier(value: number): Builder {
            this.ingredientDCModifier = value;
            return this;
        }

        public withEssenceDCModifier(value: number): Builder {
            this.essenceDCModifier = value;
            return this;
        }

        public withTool(value: Tool): Builder {
            this.tool = value;
            return this;
        }

        public withDiceRoller(value: DiceUtility): Builder {
            this.diceRoller = value;
            return this;
        }

    }

}

export {CraftingCheck5e};