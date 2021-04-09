import {CraftingComponent} from "./CraftingComponent";
import {Unit} from "./Combination";

enum ActionType {
    ADD = 'ADD',
    REMOVE = 'REMOVE'
}

class FabricationAction<D> {
    private readonly _actionType: ActionType;
    private readonly _unit: Unit<CraftingComponent>;
    private readonly _itemData: Item.Data<D>;

    constructor(builder: FabricationAction.Builder<D>) {
        this._actionType = builder.actionType;
        this._unit = builder.component;
        this._itemData = builder.itemData;
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

    get itemData(): Item.Data<D> {
        return this._itemData;
    }

    public hasItemData(): boolean {
        return !!this._itemData;
    }

    withItemData(data: Item.Data<D>): FabricationAction<D> {
        return FabricationAction.builder<D>()
            .withItemData(data)
            .withComponent(this._unit)
            .withActionType(this._actionType)
            .build();
    }
}

namespace FabricationAction {

    export class Builder<D> {
        public actionType: ActionType;
        public component: Unit<CraftingComponent>;
        public itemData: Item.Data<D>;

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

        public withItemData(value: Item.Data<D>) {
            this.itemData = value;
            return this;
        }
    }

}

export {FabricationAction, ActionType}