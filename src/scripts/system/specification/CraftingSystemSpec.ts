import {GameSystem} from "../GameSystem";
import {EssenceDefinitionConfig} from "../../common/EssenceDefinition";
import {ThresholdType} from "../../crafting/check/Threshold";
import AbilityType = DND5e.AbilityType;
import {Dnd5EAlchemicalEffectName} from "../../5e/AlchemicalEffect5E";
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
    type: Dnd5EAlchemicalEffectName,
    description: string,
    essenceMatch: Record<string, number>
}

interface DnD5EDamageEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectName.DAMAGE
    damage: {
        expression: string,
        type: DND5e.DamageType
    }
}

interface DnD5EAoEExtensionEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectName.AOE_EXTENSION
    aoe: {
        units: DND5e.Unit,
        value: number
    }
}

interface DnD5EDamageMultiplierEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectName.DAMAGE_MULTIPLIER
    diceMultiplier: number
}

interface DnD5ESaveModifierEffectSpec extends DnD5EAlchemyEffectSpec {
    type: Dnd5EAlchemicalEffectName.SAVE_MODIFIER
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

interface RecipeSpec {
    performCheck: boolean;
    wastage: WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpec;
}

interface DnD5ECraftingCheckSpec {
    ability: AbilityType;
    addToolProficiency: boolean;
    tool: DnD5EToolSpecification;
    threshold: DnD5EThresholdSpecification
}

interface AlchemySpec {
    enabled: boolean;
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
    hasCraftingChecks: boolean;
    recipes: RecipeSpec;
    alchemy: AlchemySpec;
}

export {CraftingSystemSpec,
    AlchemySpec,
    AlchemyFormulaSpec,
    DnD5ECraftingCheckSpec,
    Pf2ECraftingCheck,
    DnD5EAlchemyEffectSpec,
    DnD5EDamageEffectSpec,
    DnD5EAoEExtensionEffectSpec,
    DnD5EDamageMultiplierEffectSpec,
    DnD5ESaveModifierEffectSpec
}