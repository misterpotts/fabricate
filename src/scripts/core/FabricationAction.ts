import {CraftingComponent} from "./CraftingComponent";
import {ActionType} from "./ActionType";
import {FabricateResultFlags} from "../game/CompendiumData";
import {FabricateItem} from "./FabricateItem";

class FabricationAction extends FabricateItem {
    private readonly _component: CraftingComponent;
    private readonly _quantity: number;
    private readonly _type: ActionType;
    private readonly _customData: any;

    constructor(builder: FabricationAction.Builder) {
        super(builder.component.systemId, builder.component.partId, builder.component.imageUrl, builder.component.name);
        this._component = builder.component;
        this._quantity = builder.quantity;
        this._type = builder.action;
        this._customData = builder.customData;
    }

    public static builder(): FabricationAction.Builder {
        return new FabricationAction.Builder();
    }

    public describe(): string {
        const actionDescription = this._type === ActionType.ADD ? 'Added' : 'Removed';
        return `${actionDescription} ${this._quantity} ${this._component.name}`;
    }

    get component(): CraftingComponent {
        return this._component;
    }

    get quantity(): number {
        return this._quantity;
    }

    get type(): ActionType {
        return this._type;
    }

    get customData(): any {
        return this._customData;
    }

    public static fromFlags(flags: FabricateResultFlags, systemId: string): FabricationAction {
        return this.builder()
            .withAction(flags.action)
            .withQuantity(flags.quantity)
            .withComponent(CraftingComponent.builder()
                .withSystemId(systemId)
                .withPartId(flags.partId)
                .build())
            .build();
    }

    public static manyFromFlags(flags: FabricateResultFlags[], systemId: string): FabricationAction[] {
        return flags.map((flagData) => FabricationAction.fromFlags(flagData, systemId));
    }

    isValid(): boolean {
        return (this.quantity != null && this.quantity > 0)
            && (this.type != null)
            && (this.type == ActionType.ADD || this.type == ActionType.REMOVE)
            && this.component.isValid()
            && super.isValid();
    }
}

namespace FabricationAction {
    export class Builder {
        public component!: CraftingComponent;
        public quantity!: number;
        public action!: ActionType;
        public customData: any;

        public withComponent(value: CraftingComponent): Builder {
            this.component = value;
            return this;
        }

        public withQuantity(value: number): Builder {
            this.quantity = value;
            return this;
        }

        public withAction(value: ActionType): Builder {
            this.action = value;
            return this;
        }

        public build(): FabricationAction {
            return new FabricationAction(this);
        }

        withCustomData(value: any) {
            this.customData = value;
            return this;
        }
    }
}

export {FabricationAction}