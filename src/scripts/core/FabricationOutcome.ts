import {FabricationAction} from "./FabricationAction";
import {Recipe} from "./Recipe";
import {ActionType} from "../game/CompendiumData";

enum OutcomeType {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

class FabricationOutcome {

    private readonly _type: OutcomeType;
    private readonly _recipe: Recipe;
    private readonly _actions: FabricationAction<Item.Data>[];
    private readonly _failureDetails: string;

    constructor(builder: FabricationOutcome.Builder) {
        this._type = builder.type;
        this._recipe = builder.recipe;
        this._actions = builder.actions;
        this._failureDetails = builder.failureDetails;
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
                    return 'Your alchemical combination failed to produce any results. ';
                }
        }
    }

    get failureDetails(): string {
        return this._failureDetails;
    }

    get actions(): FabricationAction<Item.Data>[] {
        return this._actions;
    }

    get removedComponents(): string[] {
        return this._actions.filter((action: FabricationAction<Item.Data>) => action.actionType === ActionType.REMOVE)
            .map((action: FabricationAction<Item.Data>) => `${action.quantity} ${action.itemType.name}` );
    }

    get addedItems(): FabricationAction<Item.Data>[] {
        return this._actions.filter((action: FabricationAction<Item.Data>) => action.actionType === ActionType.ADD);
    }

}

namespace FabricationOutcome {

    export class Builder {

        public type: OutcomeType;
        public recipe: Recipe;
        public actions: FabricationAction<Item.Data>[];
        public failureDetails: string;

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

        public withActions(value: FabricationAction<Item.Data>[]): Builder {
            this.actions = value;
            return this;
        }

        public withFailureDetails(value: string): Builder {
            this.failureDetails = value;
            return this;
        }
    }

}

export {FabricationOutcome, OutcomeType}