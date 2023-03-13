import {CraftingSystem, CraftingSystemJson} from "./CraftingSystem";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {WastageType} from "../common/ComponentConsumptionCalculator";
import {CraftingSystemDetails} from "./CraftingSystemDetails";
import {PartDictionaryFactory} from "./PartDictionary";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";
import {NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {DisabledAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/ComponentSelectionStrategy";

class CraftingSystemFactory {

    private readonly _documentManager: DocumentManager;

    constructor({
        documentManager = new DefaultDocumentManager()
    }: {
        documentManager?: DocumentManager
    }) {
        this._documentManager = documentManager
    }

    public async make(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {

        const partDictionaryFactory = new PartDictionaryFactory({documentManager: this._documentManager});
        const partDictionary = partDictionaryFactory.make(craftingSystemJson.parts);

        return new CraftingSystem({
            id: craftingSystemJson.id,
            details: new CraftingSystemDetails(craftingSystemJson.details),
            locked: craftingSystemJson.locked,
            enabled: craftingSystemJson.enabled,
            partDictionary: partDictionary,
            craftingChecks: {
                alchemy: new NoCraftingCheck(), // todo: implement user-defined, system-agnostic, flexible macro-based checks in the UI
                recipe: new NoCraftingCheck() // todo: implement user-defined, system-agnostic, flexible macro-based checks in the UI
            },
            craftingAttemptFactory: new CraftingAttemptFactory({
                selectionStrategy: new DefaultComponentSelectionStrategy()
            }),
            alchemyAttemptFactory: new DisabledAlchemyAttemptFactory() // todo: implement user-defined, system-agnostic, flexible macro-based alchemy in the UI
        });
    }

}

export {CraftingSystemFactory}