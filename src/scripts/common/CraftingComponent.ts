import { FabricateItem } from './FabricateItem';
import { Combination } from './Combination';
import type { EssenceDefinition } from './EssenceDefinition';

class CraftingComponent extends FabricateItem {
  private readonly _essences: Combination<EssenceDefinition>;
  private readonly _salvage: Combination<CraftingComponent>;

  constructor(builder: CraftingComponent.Builder) {
    super(builder);
    this._essences = builder.essences;
    this._salvage = builder.salvage;
  }

  public static builder() {
    return new CraftingComponent.Builder();
  }

  public toBuilder(): CraftingComponent.Builder {
    return new CraftingComponent.Builder()
      .withPartId(this._partId)
      .withCompendiumId(this._systemId)
      .withImageUrl(this._imageUrl)
      .withName(this._name)
      .withEssences(this._essences)
      .withSalvage(this._salvage);
  }

  get essences(): Combination<EssenceDefinition> {
    return this._essences;
  }

  get salvage(): Combination<CraftingComponent> {
    return this._salvage;
  }
}

namespace CraftingComponent {
  export class Builder extends FabricateItem.Builder {
    public essences: Combination<EssenceDefinition> = Combination.EMPTY();
    public salvage: Combination<CraftingComponent> = Combination.EMPTY();

    public build(): CraftingComponent {
      return new CraftingComponent(this);
    }

    public withEssences(value: Combination<EssenceDefinition>) {
      this.essences = value;
      return this;
    }

    public withSalvage(value: Combination<CraftingComponent>) {
      this.salvage = value;
      return this;
    }

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

export { CraftingComponent };
