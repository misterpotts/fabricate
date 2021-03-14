import {Fabricator} from "./Fabricator";
import {EssenceDefinition} from "./CraftingSystem";

class CraftingSystemSpecification<T> {
    private readonly _compendiumPackKey: string;
    private readonly _name: string;
    private readonly _description: string;
    private readonly _enableHint: string;
    private readonly _enabled: boolean;
    private readonly _supportedGameSystems: string[] = [];
    private readonly _fabricator: Fabricator<T>;
    private readonly _essences: EssenceDefinition[] = [];

    constructor(builder: CraftingSystemSpecification.Builder<T>) {
        this._compendiumPackKey = builder.compendiumPackKey;
        this._name = builder.name;
        this._description = builder.description;
        this._enableHint = builder.enableHint;
        this._enabled = builder.enabled;
        this._supportedGameSystems = builder.supportedGameSystems;
        this._fabricator = builder.fabricator;
        this._essences = builder.essences;
    }

    public static builder<T>(): CraftingSystemSpecification.Builder<T> {
        return new CraftingSystemSpecification.Builder();
    }

    get compendiumPackKey(): string {
        return this._compendiumPackKey;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get enableHint(): string {
        return this._enableHint;
    }

    get supportedGameSystems(): string[] {
        return this._supportedGameSystems;
    }

    get fabricator(): Fabricator<T> {
        return this._fabricator;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    get essences(): EssenceDefinition[] {
        return this._essences;
    }

}

namespace CraftingSystemSpecification {

    export class Builder<T> {

        public compendiumPackKey!: string;
        public name!: string;
        public description!: string;
        public enableHint!: string;
        public enabled!: boolean;
        public supportedGameSystems: string[] = [];
        public fabricator!: Fabricator<T>;
        public essences: EssenceDefinition[] = [];

        public build() : CraftingSystemSpecification<T> {
            return new CraftingSystemSpecification(this);
        }

        public withName(value: string): Builder<T> {
            this.name = value;
            return this;
        }

        public withCompendiumPackKey(value: string): Builder<T> {
            this.compendiumPackKey = value;
            return this;
        }

        public withFabricator(value: Fabricator<T>): Builder<T> {
            this.fabricator = value;
            return this;
        }

        public withSupportedGameSystems(value: string[]): Builder<T> {
            this.supportedGameSystems = value;
            return this;
        }

        public withSupportedGameSystem(value: string): Builder<T> {
            this.supportedGameSystems.push(value);
            return this;
        }

        public withEnableHint(value: string): Builder<T> {
            this.enableHint = value;
            return this;
        }

        public isEnabled(value: boolean): Builder<T> {
            this.enabled = value;
            return this;
        }

        withDescription(value: string): Builder<T> {
            this.description = value;
            return this;
        }

        public withEssence(value: EssenceDefinition): Builder<T> {
            this.essences.push(value);
            return this;
        }

        public withEssences(value: EssenceDefinition[]): Builder<T> {
            this.essences = value;
            return this;
        }

    }

}

export {CraftingSystemSpecification}