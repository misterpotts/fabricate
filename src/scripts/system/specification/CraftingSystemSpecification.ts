import {GameSystem} from "../GameSystem";
import {EssenceDefinition} from "../../common/EssenceDefinition";
import {ThresholdType} from "../../crafting/check/Threshold";
import AbilityType = DND5e.AbilityType;
import {AlchemicalEffectType} from "../../crafting/alchemy/AlchemicalEffect";
import {Dnd5EAlchemicalEffectType} from "../../5e/AlchemicalEffect5E";

enum WastageType {
    NONPUNITIVE,
    PUNITIVE
}

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

interface Pf2ECraftingCheckSpecification {

}

interface ComponentConstraint {
    min: number
    max: number
}

interface AlchemyConstraints {
    components: ComponentConstraint;
    effects: ComponentConstraint;
}

interface DnD5EAlchemyEffectConfig {
    name: string,
    modifier: AlchemicalEffectType,
    type: Dnd5EAlchemicalEffectType,
    description: string,
    essenceMatch: Record<string, number>
}

interface DnD5EDamageEffectConfig extends DnD5EAlchemyEffectConfig {
    type: Dnd5EAlchemicalEffectType.DAMAGE
    damage: {
        expression: string,
        type: DND5e.DamageType
    }
}

interface DnD5EAoEExtensionEffectConfig extends DnD5EAlchemyEffectConfig {
    type: Dnd5EAlchemicalEffectType.AOE_EXTENSION
    aoe: {
        units: DND5e.Unit,
        value: number
    }
}

interface DnD5EDamageMultiplierEffectConfig extends DnD5EAlchemyEffectConfig {
    type: Dnd5EAlchemicalEffectType.DAMAGE_MULTIPLIER
    diceMultiplier: number
}

interface DnD5ESaveModifierEffectConfig extends DnD5EAlchemyEffectConfig {
    type: Dnd5EAlchemicalEffectType.SAVE_MODIFIER
    saveModifier: number
}

interface AlchemyFormula {
    basePartID: string;
    constraints: AlchemyConstraints;
    effects: (DnD5EAlchemyEffectConfig
        | DnD5EDamageEffectConfig
        | DnD5EAoEExtensionEffectConfig
        | DnD5EDamageMultiplierEffectConfig
        | DnD5ESaveModifierEffectConfig)[]
}

interface CraftingSpecification {
    performCheck: boolean;
    wastage: WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpecification;
}

interface AlchemySpecification {
    performCheck: boolean;
    wastage: WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpecification;
    formulae: AlchemyFormula[]
}

interface DnD5ECraftingCheckSpecification {
    ability: AbilityType;
    tool: DnD5EToolSpecification;
    threshold: DnD5EThresholdSpecification
    baseValue: number;
    thresholdType: ThresholdType;
    crafting: CraftingSpecification;
    alchemyEnabled: boolean;
    alchemy?: AlchemySpecification;
}

interface CraftingSystemSpecification {
    id: string;
    gameSystem: GameSystem;
    name: string;
    compendia: string[];
    description: string;
    summary: string;
    author: string;
    enabled: boolean,
    essences: EssenceDefinition[];
    defaultCheck: DnD5ECraftingCheckSpecification | Pf2ECraftingCheckSpecification
}

export {CraftingSystemSpecification, DnD5ECraftingCheckSpecification, WastageType}