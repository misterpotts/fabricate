import {GameSystem} from "../GameSystem";
import {EssenceDefinition} from "../../common/EssenceDefinition";
import {CraftingCheckSpecification} from "../../crafting/check/CraftingCheck";

interface CraftingSystemSpecification {
    name: string;
    id: string;
    summary: string;
    description: string;
    author: string;
    compendiumPacks: string[];
    supportedGameSystems: GameSystem[];
    essences: EssenceDefinition[];
    craftingCheckType: CraftingCheckType;
    craftingCheckSpecification?: CraftingCheckSpecification;
}

export {CraftingSystemSpecification}