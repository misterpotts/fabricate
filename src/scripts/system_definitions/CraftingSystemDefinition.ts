import {
    DnD5EAlchemyEffectSpec,
    DnD5EAoEExtensionEffectSpec,
    DnD5ECraftingCheckSpec,
    DnD5EDamageEffectSpec,
    DnD5EDamageMultiplierEffectSpec,
    DnD5ESaveModifierEffectSpec
} from "./DnD5e";
import {EssenceDefinition} from "../common/Essence";

interface ComponentConstraintDefinition {
    min: number
    max: number
}

interface AlchemyConstraintDefinition {
    components: ComponentConstraintDefinition;
    effects: ComponentConstraintDefinition;
}

interface AlchemyFormulaDefinition {
    basePartId: string;
    constraints: AlchemyConstraintDefinition;
    effects: (DnD5EAlchemyEffectSpec
        | DnD5EDamageEffectSpec
        | DnD5EAoEExtensionEffectSpec
        | DnD5EDamageMultiplierEffectSpec
        | DnD5ESaveModifierEffectSpec)[]
}

interface AlchemyDefinition {
    enabled: boolean;
    performCheck: boolean;
    formulae?: Record<string, AlchemyFormulaDefinition>;
    constraints?: AlchemyConstraintDefinition;
}

interface CraftingSystemDefinition {
    id: string;
    details: {
        name: string,
        summary: string,
        description: string,
        author: string
    };
    locked: boolean;
    enabled: boolean;
    componentIds: string[];
    recipeIds: string[];
    checks: {
        enabled: boolean;
        hasCustomAlchemyCheck: boolean;
        recipe?: DnD5ECraftingCheckSpec;
        alchemy?: DnD5ECraftingCheckSpec;
    }
    essences: Record<string, EssenceDefinition>;
    alchemy: AlchemyDefinition;
}

export {
    CraftingSystemDefinition,
    AlchemyDefinition,
    AlchemyFormulaDefinition
}