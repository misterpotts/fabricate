import {EssenceDefinition} from "../common/EssenceDefinition";
import {CraftingCheck} from "../crafting/CraftingCheck";
import {GameSystem} from "./GameSystem";

class CraftingSystemSpecification {
    private readonly _name: string;
    private readonly _id: string;
    private readonly _summary: string;
    private readonly _description: string;
    private readonly _compendiumPacks: string[];
    private readonly _supportedGameSystems: GameSystem[] = [];
    private readonly _essences: EssenceDefinition[] = [];
    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _craftingCheckEnabled: boolean;

    constructor(builder: CraftingSystemSpecification.Builder) {
        this._name = builder.name;
        this._id = builder.id;
        this._summary = builder.summary;
        this._description = builder.description;
        this._compendiumPacks = builder.compendiumPacks;
        this._supportedGameSystems = builder.supportedGameSystems;
        this._essences = builder.essences;
        this._craftingCheck = builder.craftingCheck;
        this._craftingCheckEnabled = builder.craftingCheckEnabled;
    }

    public static builder(): CraftingSystemSpecification.Builder {
        return new CraftingSystemSpecification.Builder();
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

    get craftingCheck(): CraftingCheck<Actor> {
        return this._craftingCheck;
    }

    get craftingCheckEnabled(): boolean {
        return this._craftingCheckEnabled;
    }
}

namespace CraftingSystemSpecification {

    export class Builder {

        public name: string;
        public id: string;
        public summary: string;
        public description: string;
        public compendiumPacks: string[] = [];
        public supportedGameSystems: GameSystem[] = [];
        public essences: EssenceDefinition[] = [];
        public craftingCheck: CraftingCheck<Actor>;
        public craftingCheckEnabled: boolean;

        public build(): CraftingSystemSpecification {
            return new CraftingSystemSpecification(this);
        }

        withName(value: string): Builder {
            this.name = value;
            return this;
        }

        withId(value: string): Builder {
            this.id = value;
            return this;
        }

        withSummary(value: string): Builder {
            this.summary = value;
            return this;
        }

        withDescription(value: string): Builder {
            this.description = value;
            return this;
        }

        withCompendiumPacks(value: string[]): Builder {
            this.compendiumPacks = value;
            return this;
        }

        withSupportedGameSystems(value: GameSystem[]): Builder {
            this.supportedGameSystems = value;
            return this;
        }

        withEssences(value: EssenceDefinition[]): Builder {
            this.essences = value;
            return this;
        }

        withEssence(value: EssenceDefinition): Builder {
            this.essences.push(value);
            return this;
        }

        withCraftingCheck(value: CraftingCheck<Actor>): Builder {
            this.craftingCheck = value;
            return this;
        }

        withCraftingCheckEnabled(value: boolean): Builder {
            this.craftingCheckEnabled = value;
            return this;
        }

        withCompendiumPack(value: string) {
            this.compendiumPacks.push(value);
            return this;
        }

        withSupportedGameSystem(value: GameSystem) {
            this.supportedGameSystems.push(value);
            return this;
        }

    }

}

export {CraftingSystemSpecification}