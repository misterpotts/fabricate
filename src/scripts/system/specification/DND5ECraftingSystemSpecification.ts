import {EssenceDefinition} from "../../common/EssenceDefinition";
import {GameSystem} from "../GameSystem";
import {CraftingSystemSpecification} from "./CraftingSystemSpecification";
import {CraftingCheckConfig} from "../../crafting/check/CraftingCheck";
import {Tool} from "../../crafting/Tool";
import AbilityType = DND5e.AbilityType;

interface DND5ECraftingCheckSpecification extends CraftingCheckConfig {
    ability: AbilityType;
    tool: Tool;
}

interface DND5ECraftingSystemSpecificationConfig {
    name: string;
    id: string;
    summary: string;
    description: string;
    author: string;
    compendiumPacks: string[];
    essences: EssenceDefinition[];
    craftingCheckSpecification?: DND5ECraftingCheckSpecification
}

class DND5ECraftingSystemSpecification implements CraftingSystemSpecification {
    private readonly _name: string;
    private readonly _id: string;
    private readonly _summary: string;
    private readonly _description: string;
    private readonly _author: string;
    private readonly _compendiumPacks: string[];
    private readonly _essences: EssenceDefinition[] = [];
    private readonly _supportedGameSystems: GameSystem[] = [GameSystem.DND5E];
    private readonly _craftingCheckType: CraftingCheckType = CraftingCheckType.DND5E;

    constructor(config: DND5ECraftingSystemSpecificationConfig) {
        this._name = config.name;
        this._id = config.id;
        this._summary = config.summary;
        this._description = config.description;
        this._compendiumPacks = config.compendiumPacks;
        this._essences = config.essences;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._id;
    }

    get summary(): string {
        return this._summary;
    }

    get description(): string {
        return this._description;
    }

    get compendiumPacks(): string[] {
        return this._compendiumPacks;
    }

    get supportedGameSystems(): GameSystem[] {
        return this._supportedGameSystems;
    }

    get essences(): EssenceDefinition[] {
        return this._essences;
    }

    get craftingCheckType(): CraftingCheckType {
        return this._craftingCheckType;
    }

    get author(): string {
        return this._author;
    }
}

export {DND5ECraftingSystemSpecification, DND5ECraftingSystemSpecificationConfig, DND5ECraftingCheckSpecification}