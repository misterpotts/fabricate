import Properties from "../Properties";
import {Identifiable, Serializable} from "./Identity";

interface EssenceJson {
    id: string;
    name: string;
    description: string;
    tooltip: string;
    iconCode: string;
}

class Essence implements Identifiable, Serializable<EssenceJson> {

    private readonly _name: string;
    private readonly _id: string;
    private readonly _description: string;
    private readonly _tooltip: string;
    private readonly _iconCode: string;

    constructor({
        id,
        name,
        tooltip,
        iconCode = Properties.ui.defaults.essenceIconCode,
        description
    }: {
        id: string;
        name: string;
        tooltip: string;
        iconCode?: string;
        description: string;
    }) {
        this._id = id;
        this._name = name;
        this._tooltip = tooltip;
        this._iconCode = iconCode;
        this._description = description;
    }

    toJson(): EssenceJson {
        return {
            id: this._id,
            name: this._name,
            tooltip: this._tooltip,
            iconCode: this._iconCode,
            description: this._description
        }
    }

    get id(): string {
        return this._id;
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