import {FabricateDataExchanger, MasterCraftedDataExchanger} from "./CraftingSystemDataExchanger";

/**
 * The API for data exchange to and from external formats.
 */
interface DataExchangeAPI {

    /**
     * The API for exchanging data in Fabricate's external format.
     */
    fabricate: FabricateDataExchanger;

    /**
     * The API for exchanging data in MasterCrafted's external format.
     */
    masterCrafted: MasterCraftedDataExchanger;

    /**
     * Downloads a copy of all Fabricate data as a JSON file. This function is used for debugging and troubleshooting.
     * If you want to export data from Fabricate for use in another Foundry VTT world, use {@link FabricateAPI#export}
     */
    downloadData(): void;

}

export {DataExchangeAPI};

class DefaultDataExchangeAPI implements DataExchangeAPI {

    private readonly _fabricateDataExchanger: FabricateDataExchanger;
    private readonly _masterCraftedDataExchanger: MasterCraftedDataExchanger;

    constructor({
        fabricateDataExchanger,
        masterCraftedDataExchanger
    }: {
        fabricateDataExchanger: FabricateDataExchanger,
        masterCraftedDataExchanger: MasterCraftedDataExchanger
    }) {
        this._fabricateDataExchanger = fabricateDataExchanger;
        this._masterCraftedDataExchanger = masterCraftedDataExchanger;
    }

    get fabricate(): FabricateDataExchanger {
        return this._fabricateDataExchanger;
    }

    get masterCrafted(): MasterCraftedDataExchanger {
        return this._masterCraftedDataExchanger;
    }

    downloadData(): void {
        const allFabricateSettingValues = Array.from(game.settings.storage.get("world").values())
            .filter((setting: any) => setting.key.search(new RegExp("fabricate", "i")) >= 0);
        const fileContents = JSON.stringify(allFabricateSettingValues, null, 2);
        const dateTime = new Date();
        const postfix = dateTime.toISOString()
            .replace(/:\s*/g, "-")
            .replace(".", "-");
        const fileName = `fabricate-data-extract-${postfix}.json`;
        saveDataToFile(fileContents, "application/json", fileName);
    }

}

export {DefaultDataExchangeAPI};
