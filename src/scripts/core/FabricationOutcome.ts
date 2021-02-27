import {FabricationAction} from "./FabricationAction";

enum OutcomeType {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

class FabricationOutcome {
    private readonly _type: OutcomeType;
    private readonly _userMessage: string;
    private readonly _actions: FabricationAction[];
    private readonly _displayItems: Item[];

    constructor(outcome: OutcomeType, userMessage: string, fabricationActions: FabricationAction[], displayItems: Item[] = []) {
        this._type = outcome;
        this._userMessage = userMessage;
        this._actions = fabricationActions;
        this._displayItems = displayItems;
    }

    get type(): OutcomeType {
        return this._type;
    }

    get userMessage(): string {
        return this._userMessage;
    }

    get displayItems(): Item[] {
        return this._displayItems;
    }

    get actions(): FabricationAction[] {
        return this._actions;
    }

}

export {FabricationOutcome, OutcomeType}