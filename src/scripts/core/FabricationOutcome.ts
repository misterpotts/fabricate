import {FabricationAction, FabricationActionType} from "./FabricationAction";
import {Recipe} from "./Recipe";
import {InventoryModification} from "../game/Inventory";
import {CraftingComponent} from "./CraftingComponent";

enum OutcomeType {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

class FabricationOutcome {

    private readonly _type: OutcomeType;
    private readonly _recipe: Recipe;
    private readonly _actions: FabricationAction[];
    private readonly _addedItems: InventoryModification<CraftingComponent>[];

    constructor(builder: FabricationOutcome.Builder) {
        this._type = builder.type;
        this._recipe = builder.recipe;
        this._actions = builder.actions;
        this._addedItems = builder.addedItems;
    }

    public static builder(): FabricationOutcome.Builder {
        return new FabricationOutcome.Builder();
    }

    get type(): OutcomeType {
        return this._type;
    }

    get title(): string {
        switch (this.type) {
            case OutcomeType.SUCCESS:
                return 'Crafting success ';
            case OutcomeType.FAILURE:
                return 'Crafting failure ';
        }
    }

    get description(): string {
        switch (this.type) {
            case OutcomeType.SUCCESS:
                if (this._recipe) {
                    return `Successfully crafted "${this._recipe.name}". `;
                } else {
                    return 'Your alchemical combination worked. ';
                }
            case OutcomeType.FAILURE:
                if (this._recipe) {
                    return `Failed to craft ${this._recipe.name}. `;
                } else {
                    return 'Your alchemical combination failed. ';
                }
        }
    }

    get removedComponents(): string[] {
        return this.actions.filter((action: FabricationAction) => action.type === FabricationActionType.REMOVE)
            .map((removedComponent: FabricationAction) => `${removedComponent.quantity} ${removedComponent.name}` );
    }

    get addedItems(): InventoryModification<CraftingComponent>[] {
        return this._addedItems;
    }

    get actions(): FabricationAction[] {
        return this._actions;
    }

}

namespace FabricationOutcome {

    export class Builder {

        public type: OutcomeType;
        public recipe: Recipe;
        public actions: FabricationAction[];
        public addedItems: InventoryModification<CraftingComponent>[];

        public build(): FabricationOutcome {
            return new FabricationOutcome(this);
        }

        public withOutcomeType(value: OutcomeType): Builder {
            this.type = value;
            return this;
        }

        public withRecipe(value: Recipe): Builder {
            this.recipe = value;
            return this;
        }

        public withActions(value: FabricationAction[]): Builder {
            this.actions = value;
            return this;
        }

        public withAddedItems(value: InventoryModification<CraftingComponent>[]): Builder {
            this.addedItems = value;
            return this;
        }

    }

}

export {FabricationOutcome, OutcomeType}