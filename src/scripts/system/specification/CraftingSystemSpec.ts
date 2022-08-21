import {GameSystem} from "../GameSystem";
import {EssenceDefinitionConfig} from "../../common/EssenceDefinition";
import {ThresholdType} from "../../crafting/check/Threshold";
import AbilityType = DND5e.AbilityType;
import {AlchemicalEffectType} from "../../crafting/alchemy/AlchemicalEffect";
import {Dnd5EAlchemicalEffectType} from "../../5e/AlchemicalEffect5E";
import {WastageType} from "../../common/ComponentConsumptionCalculator";

interface DnD5EToolSpecification {
    name: string;
    skillProficiency: string;
}

interface DnD5EThresholdSpecification {
    baseValue: number;
    type: ThresholdType;
    contributions: {
        ingredient: number,
        essence: number
    };
}

interface Pf2ECraftingCheck {

}

interface ComponentConstraint {
    min: number
    max: number
}

interface AlchemyConstraintSpec {
    components: ComponentConstraint;
    effects: ComponentConstraint;
}

interface DnD5EAlchemyEffectSpec {
    name: string,
    modifier: AlchemicalEffectType,
    type: Dnd5EAlchemicalEffectType,
    description: string,
    essenceMatch: Record<string, number>
}

interface DnD5EDamageEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectType.DAMAGE
    damage: {
        expression: string,
        type: DND5e.DamageType
    }
}

interface DnD5EAoEExtensionEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectType.AOE_EXTENSION
    aoe: {
        units: DND5e.Unit,
        value: number
    }
}

interface DnD5EDamageMultiplierEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectType.DAMAGE_MULTIPLIER
    diceMultiplier: number
}

interface DnD5ESaveModifierEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectType.SAVE_MODIFIER
    saveModifier: number
}

interface AlchemyFormulaSpec {
    basePartId: string;
    constraints: AlchemyConstraintSpec;
    effects: (DnD5EAlchemyEffectSpec
        | DnD5EDamageEffectSpec
        | DnD5EAoEExtensionEffectSpec
        | DnD5EDamageMultiplierEffectSpec
        | DnD5ESaveModifierEffectSpec)[]
}

interface CraftingSpec {
    performCheck: boolean;
    wastage: WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpec;
}

interface DnD5ECraftingCheckSpec {
    ability: AbilityType;
    tool: DnD5EToolSpecification;
    threshold: DnD5EThresholdSpecification
}

interface AlchemySpec {
    performCheck: boolean;
    wastage: WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpec;
    formulae: AlchemyFormulaSpec[];
    constraints: AlchemyConstraintSpec;
}

interface CraftingSystemSpec {
    id: string;
    gameSystem: GameSystem;
    name: string;
    compendia: string[];
    description: string;
    summary: string;
    author: string;
    enabled: boolean;
    essences: EssenceDefinitionConfig[];
    defaultCheck: DnD5ECraftingCheckSpec;
    crafting: CraftingSpec;
    alchemyEnabled: boolean;
    alchemy: AlchemySpec;
}

export {CraftingSystemSpec, AlchemySpec, AlchemyFormulaSpec, DnD5ECraftingCheckSpec, Pf2ECraftingCheck}