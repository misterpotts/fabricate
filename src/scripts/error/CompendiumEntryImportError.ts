import {FabricateCompendiumData} from "../compendium/CompendiumData";

class CompendiumEntryImportError extends Error {

    private readonly _fabricateCompendiumData: FabricateCompendiumData;
    private readonly _cause: Error;

    constructor(compendiumPackKey: string,
                entryId: string,
                fabricateItem: FabricateCompendiumData,
                systemId: string,
                cause: Error) {
        const message: string =
            `Unable to import ${fabricateItem.type} with Fabricate Part ID '${fabricateItem.identity.partId}' from Compendium Document with ID '${entryId}' specified in Compendium with Pack Key '${compendiumPackKey}' into System '${systemId}'. Caused by: ${cause.message}`;
        super(message);
        this._fabricateCompendiumData = fabricateItem;
        this._cause = cause;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CompendiumEntryImportError);
        }
    }

    get fabricateCompendiumData(): FabricateCompendiumData {
        return this._fabricateCompendiumData;
    }

    get cause(): Error {
        return this._cause;
    }

}

export {CompendiumEntryImportError}