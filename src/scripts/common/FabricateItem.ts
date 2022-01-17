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
  COMPONENT = 'COMPONENT',
}

interface Identifiable {
  id: string;
}

abstract class FabricateItem {
  protected readonly _systemId: string;
  protected readonly _partId: string;
  protected readonly _compendiumId: string;
  protected readonly _id: string;
  protected readonly _imageUrl: string;
  protected readonly _name: string;

  protected constructor(builder: FabricateItem.Builder) {
    this._systemId = builder.systemId;
    this._compendiumId = builder.compendiumId;
    this._partId = builder.partId;
    this._id = FabricateItem.globalIdentifier(builder.partId, builder.systemId);
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
    return this.partId === other.partId && this.systemId === other.systemId;
  }

  // isValid(): boolean {
  //   return this.partId && this.partId.length > 0
  //       && this.systemId && this.systemId.length > 0
  //       && this.imageUrl != null && this.imageUrl.length > 0
  //       && this.name != null && this.name.length > 0;
  // }

  equals(other: FabricateItem): boolean {
    if (!other) {
      return false;
    }
    return (
      this.partId === other.partId &&
      this.compendiumId === other.compendiumId &&
      this.systemId === other.systemId &&
      this.imageUrl === other.imageUrl &&
      this.name === other.name
    );
  }

  public static globalIdentifier(partId: string, systemId: string): string {
    return `${partId}:${systemId}`;
  }
}

namespace FabricateItem {
  export abstract class Builder {
    public partId: string;
    public compendiumId: string;
    public systemId: string;
    public imageUrl: string;
    public name: string;

    abstract build(): FabricateItem;

    public withPartId(value: string): Builder {
      this.partId = value;
      return this;
    }

    public withCompendiumId(value: string): Builder {
      this.compendiumId = value;
      return this;
    }

    public withSystemId(value: string): Builder {
      this.systemId = value;
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

export { Identifiable, FabricateItem, FabricateItemType };
