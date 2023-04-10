import Properties from "../../Properties";
import {Identifiable, Serializable} from "../../common/Identity";
import {FabricateItemData, ItemLoadingError} from "../../foundry/DocumentManager";

interface EssenceJson {
    activeEffectSourceItemUuid: string;
    name: string;
    description: string;
    tooltip: string;
    iconCode: string;
}

class Essence implements Identifiable, Serializable<EssenceJson> {

    private readonly _id: string;
    private readonly _craftingSystemId: string;
    private _name: string;
    private _activeEffectSource: FabricateItemData;
    private _description: string;
    private _tooltip: string;
    private _iconCode: string;

    constructor({
        id,
        craftingSystemId,
        name,
        tooltip,
        description,
        activeEffectSource,
        iconCode = Properties.ui.defaults.essenceIconCode
    }: {
        id: string;
        craftingSystemId: string;
        name: string;
        tooltip: string;
        iconCode?: string;
        description: string;
        activeEffectSource?: FabricateItemData;
    }) {
        this._id = id;
        this._craftingSystemId = craftingSystemId;
        this._name = name;
        this._tooltip = tooltip;
        this._iconCode = iconCode;
        this._description = description;
        this._activeEffectSource = activeEffectSource;
    }

    toJson(): EssenceJson {
        return {
            name: this._name,
            tooltip: this._tooltip,
            iconCode: this._iconCode,
            description: this._description,
            activeEffectSourceItemUuid: this._activeEffectSource?.uuid
        }
    }

    get id(): string {
        return this._id;
    }

    get craftingSystemId(): string {
        return this._craftingSystemId;
    }

    get hasActiveEffectSource(): boolean {
        return !!this._activeEffectSource;
    }

    get activeEffectSource(): FabricateItemData {
        return this._activeEffectSource;
    }


    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get tooltip(): string {
        return this._tooltip;
    }

    get iconCode(): string {
        return this._iconCode;
    }

    get hasErrors(): boolean {
        if (!this._activeEffectSource) {
            return false;
        }
        return this._activeEffectSource.hasErrors;
    }

    get errors(): ItemLoadingError[] {
        return this._activeEffectSource.errors;
    }

    set activeEffectSource(value: FabricateItemData) {
        this._activeEffectSource = value;
    }

    set name(value: string) {
        this._name = value;
    }

    set description(value: string) {
        this._description = value;
    }

    set tooltip(value: string) {
        this._tooltip = value;
    }

    set iconCode(value: string) {
        this._iconCode = value;
    }

}

export { EssenceJson, Essence }
