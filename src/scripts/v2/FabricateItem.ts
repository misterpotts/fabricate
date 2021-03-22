interface FabricateItem {
    systemId: string;
    partId: string;
    imageUrl: string;
    name: string;
}

abstract class AbstractFabricateItem implements FabricateItem {
    protected readonly _systemId: string;
    protected readonly _partId: string;
    protected readonly _imageUrl: string;
    protected readonly _name: string;

    protected constructor(builder: FabricateItem.Builder) {
        this._systemId = builder.systemId;
        this._partId = builder.partId;
        this._imageUrl = builder.imageUrl;
        this._name = builder.name;
    }

    get partId(): string {
        return this._partId;
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

namespace FabricateItem {

    export class Builder {

        public systemId: string;
        public partId: string;
        public imageUrl: string;
        public name: string;

        public withSystemId(value: string): Builder {
            this.systemId = value;
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

export {FabricateItem, AbstractFabricateItem}