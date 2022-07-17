import {GameSystem} from "../GameSystem";
import {EssenceDefinition} from "../../common/EssenceDefinition";
import {ThresholdType} from "../../crafting/check/Threshold";
import {Tool} from "../../crafting/Tool";
import AbilityType = DND5e.AbilityType;
import {ContributionCounterConfig} from "../../crafting/check/ContributionCounter";

enum WastageType {
    NONPUNITIVE,
    PUNITIVE
}

interface PF2EERollModifiers {

}

interface DND5ERollModifiers {
    ability: AbilityType;
    tool: Tool;
}

interface CraftingCheckSpecification {
    enabled: boolean;
    die: {
        faces: 2 | 4 | 6 | 8 | 10 | 12 | 20 | 100,
        number: number
    };
    baseValue: number;
    thresholdType: ThresholdType;
    contributionCounterConfig: ContributionCounterConfig;
    systemProperties: DND5ERollModifiers | PF2EERollModifiers
}

interface CraftingSystemSpecification {
    name: string;
    id: string;
    summary: string;
    description: string;
    author: string;
    compendiumPacks: string[];
    wastageType: WastageType;
    gameSystem: GameSystem;
    essences: EssenceDefinition[];
    craftingCheckSpecification?: CraftingCheckSpecification
}

export {CraftingSystemSpecification, CraftingCheckSpecification, DND5ERollModifiers, WastageType}