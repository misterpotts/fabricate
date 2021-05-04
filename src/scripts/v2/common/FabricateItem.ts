/**
 * The Type of Fabricate Item described by this entry: Recipe or Component
 * */
enum FabricateItemType {
    /**
     * This entry describes a Recipe
     * */
    RECIPE = 'RECIPE',
    /**
     * This entry describes a Crafting Component
     * */
    COMPONENT = 'COMPONENT'
}

interface Identifiable {
    id: string;
}

abstract class FabricateItem {
    protected readonly _compendiumId: string;
    protected readonly _partId: string;
    protected readonly _id: string;
    protected readonly _imageUrl: string;
    protected readonly _name: string;

    protected constructor(builder: FabricateItem.Builder) {
        this._compendiumId = builder.compendiumId;
        this._partId = builder.partId;
        this._id = FabricateItem.globalIdentifier(builder.partId, builder.compendiumId);
        this._imageUrl = builder.imageUrl;
        this._name = builder.name;
    }

    get id(): string {
        return this._id;
    }

    get partId(): string {
        return this._partId;
    }

    get compendiumId(): string {
        return this._compendiumId;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get name(): string {
        return this._name;
    }

    equals(other: FabricateItem): boolean {
        if (!other) {
            return false;
        }
        return this.partId === other.partId
            && this.compendiumId === other.compendiumId
            && this.imageUrl === other.imageUrl
            && this.name === other.name;
    }

    public static globalIdentifier(partId: string, systemId: string): string {
        return `${partId}:${systemId}`;
    }

}

namespace FabricateItem {

    export abstract class Builder {

        public compendiumId: string;
        public partId: string;
        public imageUrl: string;
        public name: string;

        abstract build(): FabricateItem;

        public withCompendiumId(value: string): Builder {
            this.compendiumId = value;
            return this;
        }

        public withPartId(value: string): Builder {
            this.partId = value;
            return this;
        }

        public withImageUrl(value: string): Builder {
            this.imageUrl = value;
            return this;
        }

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

    }

}

export {Identifiable, FabricateItem, FabricateItemType}