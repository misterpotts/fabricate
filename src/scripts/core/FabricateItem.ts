abstract class FabricateItem {
    protected readonly _systemId: string;
    protected readonly _partId: string;
    private readonly _imageUrl: string;
    private readonly _name: string;

    protected constructor(systemId: string, partId: string, imageUrl: string, name: string) {
        this._systemId = systemId;
        this._partId = partId;
        this._imageUrl = imageUrl;
        this._name = name;
    }

    get partId(): string {
        return this._partId;
    }

    get systemId(): string {
        return this._systemId;
    }

    get compendiumEntry(): string {
        return `${this.systemId}.${this.partId}`
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get name(): string {
        return this._name;
    }

    sharesType(other: FabricateItem): boolean {
        if (!other) {
            return false;
        }
        return this.partId === other.partId
            && this.systemId === other.systemId;
    }

    isValid(): boolean {
        return this.partId && this.partId.length > 0
            && this.systemId && this.systemId.length > 0
            && this.imageUrl != null && this.imageUrl.length > 0
            && this.name != null && this.name.length > 0;
    }
}

export {FabricateItem}