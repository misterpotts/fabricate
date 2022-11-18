import {FabricateItem} from "../common/Identifiable";

class CompendiumEntryReferencePopulationError extends Error {

    private readonly _fabricateItem: FabricateItem;

    constructor(fabricateItem: FabricateItem, cause: Error) {
        const message: string = `Unable to resolve Component references for Item '${fabricateItem.id}'. Caused by: ${cause.message}`;
        super(message);

        this._fabricateItem = fabricateItem;
    }

    get fabricateItem(): FabricateItem {
        return this._fabricateItem;
    }

}

export {CompendiumEntryReferencePopulationError}