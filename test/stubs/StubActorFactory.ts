import {StubItem} from "./StubItem";

class StubActorFactory {

    private readonly _ownedItems: Map<string, StubItem> ;

    constructor({ ownedItems = new Map() }: { ownedItems?: Map<string, StubItem> }) {
        this._ownedItems = ownedItems;
    }

    public make(): Actor {
        const result: Actor = <Actor><unknown>{
            items: this._ownedItems
        };
        return result;
    }

}

export { StubActorFactory }