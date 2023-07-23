import {Component, ComponentJson} from "./Component";
import {DocumentManager} from "../../foundry/DocumentManager";
import {Combination} from "../../common/Combination";
import {SelectableOptions} from "../selection/SelectableOptions";
import {EntityFactory} from "../../repository/EntityFactory";
import {SalvageOption, SalvageOptionJson} from "./SalvageOption";
import {EssenceReference} from "../essence/EssenceReference";

class ComponentFactory implements EntityFactory<ComponentJson, Component> {

    private readonly documentManager: DocumentManager;

    constructor({
        documentManager
    }: {
        documentManager: DocumentManager;
    }) {
        this.documentManager = documentManager;
    }

    public async make(componentJson: ComponentJson): Promise<Component> {

        const itemData = this.documentManager.prepareItemDataByDocumentUuid(componentJson.itemUuid);

        return new Component({
            itemData,
            id: componentJson.id,
            embedded: componentJson.embedded,
            disabled: componentJson.disabled,
            craftingSystemId: componentJson.craftingSystemId,
            essences: Combination.fromRecord(componentJson.essences, EssenceReference.fromEssenceId),
            salvageOptions: this.buildSalvageOptions(componentJson.salvageOptions)
        });

    }

    private buildSalvageOptions(salvageOptionsJson: Record<string, SalvageOptionJson>): SelectableOptions<SalvageOptionJson, SalvageOption> {
        const options = Object.values(salvageOptionsJson)
            .map(json => SalvageOption.fromJson(json));
        return new SelectableOptions<SalvageOptionJson, SalvageOption>({ options });
    }

}

export { ComponentFactory };