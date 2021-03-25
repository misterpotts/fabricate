interface Identifiable {
    id: string;
}

interface FabricateItem extends Identifiable {
    systemId: string;
    partId: string;
    imageUrl: string;
    name: string;
    equals(other: FabricateItem): boolean;
}

abstract class AbstractFabricateItem implements FabricateItem {
    protected readonly _systemId: string;
    protected readonly _partId: string;
    protected readonly _id: string;
    protected readonly _imageUrl: string;
    protected readonly _name: string;

    protected constructor(builder: FabricateItem.Builder) {
        this._systemId = builder.systemId;
        this._partId = builder.partId;
        this._id = `${builder.partId}:${builder.systemId}`;
        this._imageUrl = builder.imageUrl;
        this._name = builder.name;
    }

    get id(): string {
        return this._id;
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

    equals(other: FabricateItem): boolean {
        if (!other) {
            return false;
        }
        return this.partId === other.partId
            && this.systemId === other.systemId
            && this.imageUrl === other.imageUrl
            && this.name === other.name;
    }

}

namespace FabricateItem {

    export class Builder {

        public systemId: string;
        public partId: string;
        public imageUrl: string;
        public name: string;

    }

}

export {Identifiable, FabricateItem, AbstractFabricateItem}