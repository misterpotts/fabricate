import {CompendiumEntry, FabricateCompendiumData, FabricateItemType} from "../game/CompendiumData";

class CraftingComponent extends FabricateItem {
    private readonly _name: string;
    private readonly _essences: string[];
    private readonly _imageUrl: string;

    constructor(builder: CraftingComponent.Builder) {
        super(builder.systemId, builder.partId);
        this._name = builder.name;
        this._essences = builder.essences;
        this._imageUrl = builder.imageUrl;
    }

    get name(): string {
        return this._name;
    }

    get essences(): string[] {
        return this._essences;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    public static builder() {
        return new CraftingComponent.Builder();
    }

    public static fromFlags(fabricateFlags: FabricateCompendiumData, systemId: string, partId: string, name: string, imageUrl: string): CraftingComponent {
        if (fabricateFlags.type !== FabricateItemType.COMPONENT) {
            throw new Error(`Error attempting to instantiate a Fabricate Crafting Component from ${fabricateFlags.type} data. `);
        }
        return CraftingComponent.builder()
            .withName(name)
            .withSystemId(systemId)
            .withPartId(partId)
            .withEssences(fabricateFlags.component.essences)
            .withImageUrl(imageUrl)
            .build();
    }

    isValid(): boolean {
        return (this.name != null && this.name.length > 0)
            && (this.imageUrl != null && this.imageUrl.length > 0)
            && (this.essences != null)
            && super.isValid();
    }

}

namespace CraftingComponent {
    export class Builder {
        public name!: string;
        public compendiumEntry!: CompendiumEntry;
        public essences: string[] = [];
        public imageUrl: string;
        public systemId: string;
        public partId: string;

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        public withSystemId(value: string): Builder {
            this.systemId = value;
            return this;
        }

        public withPartId(value: string): Builder {
            this.partId = value;
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