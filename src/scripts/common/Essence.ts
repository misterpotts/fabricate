import Properties from "../Properties";
import {Identifiable, Serializable} from "./Identity";

interface EssenceJson {
    id: string;
    activeEffectSourceItemUuid: string;
    name: string;
    description: string;
    tooltip: string;
    iconCode: string;
}

class Essence implements Identifiable, Serializable<EssenceJson> {

    private readonly _name: string;
    private readonly _id: string;
    private readonly _activeEffectSourceItemUuid: string;
    private readonly _description: string;
    private readonly _tooltip: string;
    private readonly _iconCode: string;

    constructor({
        id,
        name,
        tooltip,
        description,
        activeEffectSourceItemUuid,
        iconCode = Properties.ui.defaults.essenceIconCode
    }: {
        id: string;
        name: string;
        tooltip: string;
        iconCode?: string;
        description: string;
        activeEffectSourceItemUuid?: string;
    }) {
        this._id = id;
        this._name = name;
        this._tooltip = tooltip;
        this._iconCode = iconCode;
        this._description = description;
        this._activeEffectSourceItemUuid = activeEffectSourceItemUuid;
    }

    toJson(): EssenceJson {
        return {
            id: this._id,
            name: this._name,
            tooltip: this._tooltip,
            iconCode: this._iconCode,
            description: this._description,
            activeEffectSourceItemUuid: this._activeEffectSourceItemUuid
        }
    }

    get id(): string {
        return this._id;
    }

    public hasActiveEffectSource() {
        return !!this._activeEffectSourceItemUuid;
    }

    get activeEffectSourceItemUuid(): string {
        return this._activeEffectSourceItemUuid;
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

    get icon(): string {
        if (this.iconCode) {
            return `<i class="fas fa-${this._iconCode}" title="${this.description}"></i>`;
        }
        return this.name;
    }

}

export { EssenceJson, Essence }