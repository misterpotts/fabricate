import {FabricateCompendiumData, FabricateItemType} from "./CompendiumData";

class CompendiumEntry {
    private readonly _compendiumKey;
    private readonly _entryId;

    constructor(compendiumKey: string, entryId: string) {
        this._compendiumKey = compendiumKey;
        this._entryId = entryId;
    }

    get compendiumKey() {
        return this._compendiumKey;
    }

    get entryId() {
        return this._entryId;
    }

    public equals(other: CompendiumEntry): boolean {
        if (!other) {
            return false;
        }
        return (this.entryId === other.entryId)
            && (this.compendiumKey === other.compendiumKey);
    }

    isValid(): boolean {
        return (this.entryId != null && this.entryId.length > 0)
            && (this.compendiumKey != null && this.compendiumKey.length > 0);
    }
}

class CraftingComponent {
    private readonly _name: string;
    private readonly _compendiumEntry: CompendiumEntry;
    private readonly _essences: string[];
    private _imageUrl: string;

    constructor(builder: CraftingComponent.Builder) {
        this._name = builder.name;
        this._compendiumEntry = builder.compendiumEntry;
        this._essences = builder.essences;
        this._imageUrl = builder.imageUrl;
    }

    get name(): string {
        return this._name;
    }

    get compendiumEntry(): CompendiumEntry {
        return this._compendiumEntry;
    }

    get essences(): string[] {
        return this._essences;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    set imageUrl(imageUrl: string) {
        this._imageUrl = imageUrl;
    }

    public static builder() {
        return new CraftingComponent.Builder();
    }

    public static fromFlags(fabricateFlags: FabricateCompendiumData, imageUrl?: string): CraftingComponent {
        if (fabricateFlags.type !== FabricateItemType.COMPONENT) {
            throw new Error(`Error attempting to instantiate a Fabricate Crafting Component from ${fabricateFlags.type} data. `);
        }
        const compendiumEntryConfig = fabricateFlags.component.compendiumEntry;
        const builder = CraftingComponent.builder()
            .withName(fabricateFlags.component.name)
            .withCompendiumEntry(compendiumEntryConfig.compendiumKey, compendiumEntryConfig.entryId)
            .withEssences(fabricateFlags.component.essences);
        if (imageUrl && imageUrl.length > 0) {
            builder.withImageUrl(imageUrl);
        }
        return builder.build();
    }

    public equals(other: CraftingComponent): boolean {
        if (!other) {
            return false;
        }
        return this._compendiumEntry.equals(other.compendiumEntry);
    }

    isValid(): boolean {
        return (this.name != null && this.name.length > 0)
            && (this.essences != null)
            && this.compendiumEntry.isValid();
    }
}

namespace CraftingComponent {
    export class Builder {
        public name!: string;
        public compendiumEntry!: CompendiumEntry;
        public essences: string[] = [];
        public imageUrl: string;

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        public withCompendiumEntry(key: string, id: string): Builder {
            this.compendiumEntry = new CompendiumEntry(key, id);
            return this;
        }

        public withEssences(value: string[]): Builder {
            this.essences = value;
            return this;
        }

        public withEssence(value: string): Builder {
            this.essences.push(value);
            return this;
        }

        withImageUrl(value: string) {
            this.imageUrl = value;
            return this;
        }

        public build(): CraftingComponent {
            return new CraftingComponent(this);
        }

    }
}

export {CraftingComponent}