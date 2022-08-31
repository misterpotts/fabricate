import {Dnd5EAlchemicalEffectName} from "../../5e/AlchemicalEffect5E";
import {ThresholdType} from "../../crafting/check/Threshold";
import AbilityType = DND5e.AbilityType;

interface DnD5EToolSpecification {
    name: string;
    skillProficiency: string;
}

interface DnD5EThresholdSpecification {
    baseValue: number;
    type: keyof typeof ThresholdType;
    contributions: {
        ingredient: number,
        essence: number
    };
}

interface DnD5EAlchemyEffectSpec {
    name: string,
    type: keyof typeof Dnd5EAlchemicalEffectName,
    description?: string,
    essenceMatch: Record<string, number>
}

interface DnD5EDamageEffectSpec extends DnD5EAlchemyEffectSpec {
    damage: {
        expression: string,
        type: DND5e.DamageType
    }
}

interface DnD5EAoEExtensionEffectSpec extends DnD5EAlchemyEffectSpec {
    aoe: {
        units: DND5e.Unit,
        value: number
    }
}

interface DnD5EDamageMultiplierEffectSpec extends DnD5EAlchemyEffectSpec {
    diceMultiplier: number
}

interface DnD5ESaveModifierEffectSpec extends DnD5EAlchemyEffectSpec {
    saveModifier: number
}

interface DnD5ECraftingCheckSpec {
    ability: AbilityType;
    addToolProficiency: boolean;
    tool: DnD5EToolSpecification;
    threshold: DnD5EThresholdSpecification
}

export {
    DnD5ECraftingCheckSpec,
    DnD5ESaveModifierEffectSpec,
    DnD5EDamageMultiplierEffectSpec,
    DnD5EAoEExtensionEffectSpec,
    DnD5EDamageEffectSpec,
    DnD5EAlchemyEffectSpec
};