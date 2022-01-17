import { CraftingComponent } from '../common/CraftingComponent';
import { Unit } from '../common/Combination';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

enum ActionType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

class FabricationAction<D> {
  private readonly _actionType: ActionType;
  private readonly _unit: Unit<CraftingComponent>;
  private readonly _itemData: ItemData;
  private readonly _customData: boolean;

  constructor(builder: FabricationAction.Builder<D>) {
    this._actionType = builder.actionType;
    this._unit = builder.component;
    this._itemData = builder.itemData;
    this._customData = builder.customData;
  }

  public static builder<D>() {
    return new FabricationAction.Builder<D>();
  }

  get actionType(): ActionType {
    return this._actionType;
  }

  get unit(): Unit<CraftingComponent> {
    return this._unit;
  }

  get itemData(): ItemData {
    return this._itemData;
  }

  public hasItemData(): boolean {
    return !!this._itemData;
  }

  get customData(): boolean {
    return this._customData;
  }

  public withItemData(data: ItemData, isCustomized?: boolean): FabricationAction<D> {
    const hasCustomData: boolean = typeof isCustomized === 'undefined' ? this.customData : isCustomized;
    return FabricationAction.builder<D>()
      .withItemData(data)
      .withHasCustomData(hasCustomData)
      .withComponent(this._unit)
      .withActionType(this._actionType)
      .build();
  }
}

namespace FabricationAction {
  export class Builder<D> {
    public actionType: ActionType;
    public component: Unit<CraftingComponent>;
    public itemData: ItemData;
    public customData: boolean = false;

    public build(): FabricationAction<D> {
      return new FabricationAction<D>(this);
    }

    public withActionType(value: ActionType) {
      this.actionType = value;
      return this;
    }

    public withComponent(value: Unit<CraftingComponent>) {
      this.component = value;
      return this;
    }

    public withItemData(value: ItemData) {
      this.itemData = value;
      return this;
    }

    public withHasCustomData(value: boolean) {
      this.customData = value;
      return this;
    }
  }
}

export { FabricationAction, ActionType };
