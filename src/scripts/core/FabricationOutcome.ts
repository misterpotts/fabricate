import {FabricationAction, FabricationActionType} from "./FabricationAction";
import {Recipe} from "./Recipe";

enum OutcomeType {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

class FabricationOutcome {

    private readonly _type: OutcomeType;
    private readonly _recipe: Recipe;
    private readonly _actions: FabricationAction[];
    private readonly _displayItems: Item[];

    constructor(builder: FabricationOutcome.Builder) {
        this._type = builder.type;
        this._recipe = builder.recipe;
        this._actions = builder.actions;
        this._displayItems = builder.displayItems;
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
                if (this._recipe) {
                    return `Successfully crafted "${this._recipe.name}"! `;
                } else {
                    return 'Crafting success! ';
                }
            case OutcomeType.FAILURE:
                if (this._recipe) {
                    return `Failed to craft ${this._recipe.name}. `;
                } else {
                    return 'Crafting failure. ';
                }
        }
    }
    get description(): string {
        return '';
    }

    get removedComponents(): { quantity: number, name: string }[] {
        return this.actions.filter((action: FabricationAction) => action.type === FabricationActionType.REMOVE)
            .map((removedComponent: FabricationAction) => { return { quantity: removedComponent.quantity, name: removedComponent.name } } );
    }

    get displayItems(): Item[] {
        return this._displayItems;
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
        public displayItems: Item[];

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

        public withDisplayItems(value: Item[]): Builder {
            this.displayItems = value;
            return this;
        }

    }

}

export {FabricationOutcome, OutcomeType}