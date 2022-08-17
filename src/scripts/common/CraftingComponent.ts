import {FabricateItem, FabricateItemConfig} from "./FabricateItem";
import {Combination} from "./Combination";
import {EssenceDefinition} from "./EssenceDefinition";

interface CraftingComponentMutation {
    item?: {
        imageUrl?: string;
        name?: string;
    }
    essences?: Combination<EssenceDefinition>;
    salvage?: Combination<CraftingComponent>;
}

interface CraftingComponentConfig {
    item: FabricateItemConfig,
    essences: Combination<EssenceDefinition>;
    salvage: Combination<CraftingComponent>;
}

class CraftingComponent extends FabricateItem {

    private readonly _essences: Combination<EssenceDefinition>;
    private readonly _salvage: Combination<CraftingComponent>;

    constructor(config: CraftingComponentConfig) {
        super(config.item);
        this._essences = config.essences;
        this._salvage = config.salvage;
    }

    public mutate(mutation: CraftingComponentMutation): CraftingComponent {
        if (!mutation.essences && !mutation.salvage && !mutation.item) {
            console.warn(`A no-op mutation was performed on Component ID: "${this.id}". This should not happen. `);
            return this;
        }
        return new CraftingComponent({
            item: {
                systemId: this.systemId,
                partId: this.partId,
                compendiumId: this.compendiumId,
                name: mutation.item?.name ? mutation.item.name : this.name,
                imageUrl: mutation.item?.imageUrl ? mutation.item.imageUrl : this.imageUrl
            },
            salvage: mutation.salvage ? mutation.salvage : this._salvage,
            essences: mutation.essences ? mutation.essences : this._essences
        });
    }

    get essences(): Combination<EssenceDefinition> {
        return this._essences;
    }

    get salvage(): Combination<CraftingComponent> {
        return this._salvage;
    }
}

export {CraftingComponent, CraftingComponentConfig}