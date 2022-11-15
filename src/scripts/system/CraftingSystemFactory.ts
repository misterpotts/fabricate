import {CraftingSystem, CraftingSystemJson} from "./CraftingSystem";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/DefaultComponentSelectionStrategy";
import {WastageType} from "../common/ComponentConsumptionCalculator";
import {CraftingSystemDetails} from "./CraftingSystemDetails";
import {PartDictionaryFactory, PartLoader} from "./PartDictionary";
import {DefaultDocumentManager} from "../foundry/DocumentManager";
import {NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {DisabledAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";

class CraftingSystemFactory {
    
    private readonly _partDictionaryFactory;

    constructor({
        partDictionaryFactory = new PartDictionaryFactory(new PartLoader(new DefaultDocumentManager()))
    }: {
        partDictionaryFactory?: PartDictionaryFactory
    }) {
        this._partDictionaryFactory = partDictionaryFactory
    }

    public async make(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {

        return new CraftingSystem({
            id: craftingSystemJson.id,
            details: new CraftingSystemDetails(craftingSystemJson.details),
            locked: craftingSystemJson.locked,
            enabled: craftingSystemJson.enabled,
            partDictionary: await this._partDictionaryFactory.make(craftingSystemJson.parts),
            craftingChecks: {
                alchemy: new NoCraftingCheck(), // todo: implement user-defined, system-agnostic, flexible macro-based checks in the UI
                recipe: new NoCraftingCheck() // todo: implement user-defined, system-agnostic, flexible macro-based checks in the UI
            },
            craftingAttemptFactory: new CraftingAttemptFactory({
                selectionStrategy: new DefaultComponentSelectionStrategy(),
                wastageType: WastageType["PUNITIVE"] // todo: move this to the checks, not the attempts
            }),
            alchemyAttemptFactory: new DisabledAlchemyAttemptFactory() // todo: implement user-defined, system-agnostic, flexible macro-based alchemy in the UI
        });
    }

}

export {CraftingSystemFactory}