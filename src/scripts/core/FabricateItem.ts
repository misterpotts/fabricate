abstract class FabricateItem {
    protected readonly _systemId: string;
    protected readonly _partId: string;

    protected constructor(systemId: string, partId: string) {
        this._systemId = systemId;
        this._partId = partId;
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

    sharesType(other: FabricateItem): boolean {
        if (!other) {
            return false;
        }
        return this.partId === other.partId
            && this.systemId === other.systemId;
    }

    isValid(): boolean {
        return this.partId && this.partId.length > 0 && this.systemId && this.systemId.length > 0;
    }
}