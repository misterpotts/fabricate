import {FabricationAction} from "./FabricationAction";
import {Recipe} from "./Recipe";
import {ActionType} from "./ActionType";

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

    public describe(): string {
        const descriptionParts: string[] = [];
        switch (this.type) {
            case OutcomeType.SUCCESS:
                if (this._recipe) {
                    descriptionParts.push(`Successfully crafted "${this._recipe.name}"! `)
                } else {
                    descriptionParts.push('Crafting success! ');
                }
            break;
            case OutcomeType.FAILURE:
                if (this._recipe) {
                    descriptionParts.push(`Failed to craft ${this._recipe.name}. `)
                } else {
                    descriptionParts.push('Crafting failure. ');
                }
            break;
        }
        if (this.actions && this.actions.length > 0) {
            const removedParts: string = this.actions.filter((action: FabricationAction) => action.type === ActionType.REMOVE)
                .map((action: FabricationAction) => action.quantity + ' ' + action.name)
                .join(', ');
            if (removedParts && removedParts.length > 0) {
                descriptionParts.push(`Removed: ${removedParts}. `)
            }
            const addedParts: string = this.actions.filter((action: FabricationAction) => action.type === ActionType.ADD)
                .map((action: FabricationAction) => action.quantity + ' ' + action.name)
                .join(', ');
            if (addedParts && addedParts.length > 0) {
                descriptionParts.push(`Added: ${addedParts}. `)
            }
        }
        return descriptionParts.map((line: string) => '<p>' + line + '</p>').join('\n');
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