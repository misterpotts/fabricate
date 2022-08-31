import {GameSystem} from "../../system/GameSystem";
import {WastageType} from "../../common/ComponentConsumptionCalculator";
import {
    DnD5EAlchemyEffectSpec,
    DnD5EAoEExtensionEffectSpec,
    DnD5ECraftingCheckSpec,
    DnD5EDamageEffectSpec,
    DnD5EDamageMultiplierEffectSpec,
    DnD5ESaveModifierEffectSpec
} from "./DnD5e";

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

interface RecipeDefinition {
    performCheck: boolean;
    wastage: keyof typeof WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpec;
}

interface AlchemyDefinition {
    enabled: boolean;
    performCheck: boolean;
    wastage: keyof typeof WastageType;
    useCustomCheck: boolean;
    customCheck?: DnD5ECraftingCheckSpec;
    formulae: AlchemyFormulaDefinition[];
    constraints: AlchemyConstraintDefinition;
}

interface CraftingSystemDefinition {
    id: string;
    gameSystem: `${GameSystem}`;
    name: string;
    compendia: string[];
    description: string;
    summary: string;
    author: string;
    enabled: boolean;
    essences: {
        iconCode: string;
        tooltip: string;
        description: string;
        slug: string;
        name: string;
    }[];
    defaultCheck: DnD5ECraftingCheckSpec;
    hasCraftingChecks: boolean;
    recipes: RecipeDefinition;
    alchemy: AlchemyDefinition;
}

export {
    CraftingSystemDefinition,
    AlchemyDefinition,
    AlchemyFormulaDefinition
}