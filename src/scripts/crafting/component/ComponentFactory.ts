import {Component, ComponentJson, DefaultComponent} from "./Component";
import {DocumentManager} from "../../foundry/DocumentManager";
import {EntityFactory} from "../../repository/EntityFactory";
import {Salvage, SalvageJson, SalvageOptionJson} from "./Salvage";
import {EssenceReference} from "../essence/EssenceReference";
import {DefaultCombination} from "../../common/Combination";
import {DefaultSerializableOption, DefaultSerializableOptions, SerializableOptions} from "../../common/Options";

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

        return new DefaultComponent({
            itemData,
            id: componentJson.id,
            embedded: componentJson.embedded,
            disabled: componentJson.disabled,
            craftingSystemId: componentJson.craftingSystemId,
            essences: DefaultCombination.fromRecord(componentJson.essences, EssenceReference.fromEssenceId),
            salvageOptions: this.buildSalvageOptions(componentJson.salvageOptions)
        });

    }

    private buildSalvageOptions(salvageOptionsJson: Record<string, SalvageOptionJson>): SerializableOptions<SalvageJson, Salvage> {
        // todo: BREAKING remove this method and perform data migration
        const options = Object.values(salvageOptionsJson)
            .map(json => new DefaultSerializableOption({
                id: json.id,
                name: json.name,
                value: Salvage.fromJson({ results: json.results, catalysts: json.catalysts })
            })
        );
        return new DefaultSerializableOptions<SalvageJson, Salvage>(options);
    }

}

export { ComponentFactory };