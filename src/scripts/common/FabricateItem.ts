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

interface FabricateItemConfig {
    systemId: string;
    partId: string;
    compendiumId: string;
    imageUrl: string;
    name: string;
}

abstract class FabricateItem {
    protected readonly _systemId: string;
    protected readonly _partId: string;
    protected readonly _compendiumId: string;
    protected readonly _id: string;
    protected readonly _imageUrl: string;
    protected readonly _name: string;

    protected constructor(config: FabricateItemConfig) {
        this._systemId = config.systemId;
        this._compendiumId = config.compendiumId;
        this._partId = config.partId;
        this._id = FabricateItem.globalIdentifier(config.partId, config.systemId);
        this._imageUrl = config.imageUrl;
        this._name = config.name;
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

    get systemId(): string {
        return this._systemId;
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
            && this.systemId === other.systemId
            && this.imageUrl === other.imageUrl
            && this.name === other.name;
    }

    public static globalIdentifier(partId: string, systemId: string): string {
        return `${partId}:${systemId}`;
    }

}

export {Identifiable, FabricateItem, FabricateItemType, FabricateItemConfig}