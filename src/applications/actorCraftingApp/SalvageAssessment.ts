import {Essence} from "../../scripts/crafting/essence/Essence";
import {Unit} from "../../scripts/common/Unit";

type SelectableSalvageOptionSummary = { name: string, id: string };

export { SelectableSalvageOptionSummary }

interface SalvageAssessment {

    quantity: number;

    isSalvageable: boolean;

    hasSalvage: boolean;

    isDisabled: boolean;

    componentId: string;

    componentName: string;

    imageUrl: string;

    selectableOptions: SelectableSalvageOptionSummary[];

    hasEssences: boolean;

    needsCatalysts: boolean;

    essences: Unit<Essence>[];

}

export { SalvageAssessment }

class DefaultSalvageAssessment implements SalvageAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _quantity: number;
    private readonly _essences: Unit<Essence>[];
    private readonly _disabled: boolean;
    private readonly _hasSalvage: boolean;
    private readonly _salvageable: boolean;
    private readonly _needsCatalysts: boolean;
    private readonly _selectableOptions: SelectableSalvageOptionSummary[];

    constructor({
        id,
        name,
        imageUrl,
        quantity,
        essences = [],
        disabled = false,
        hasSalvage = false,
        salvageable = false,
        needsCatalysts = false,
        selectableOptions = []
    }: {
        id: string;
        name: string;
        imageUrl: string;
        quantity: number;
        essences?: Unit<Essence>[];
        disabled?: boolean;
        hasSalvage?: boolean;
        salvageable?: boolean;
        needsCatalysts?: boolean;
        selectableOptions?: SelectableSalvageOptionSummary[];
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._quantity = quantity;
        this._essences = essences;
        this._disabled = disabled;
        this._hasSalvage = hasSalvage;
        this._salvageable = salvageable;
        this._needsCatalysts = needsCatalysts;
        this._selectableOptions = selectableOptions;
    }

    get needsCatalysts(): boolean {
        return this._needsCatalysts;
    }

    get hasEssences(): boolean {
        return this._essences.length > 0;
    }

    get essences(): Unit<Essence>[] {
        return this._essences;
    }

    get quantity(): number {
        return this._quantity;
    }

    get isSalvageable(): boolean {
        return this._salvageable;
    }

    get hasSalvage(): boolean {
        return this._hasSalvage;
    }

    get isDisabled(): boolean {
        return this._disabled;
    }

    get componentId(): string {
        return this._id;
    }

    get componentName(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get selectableOptions(): SelectableSalvageOptionSummary[] {
        return this._selectableOptions;
    }

}

export { DefaultSalvageAssessment }