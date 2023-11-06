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

}

export { SalvageAssessment }

class DisabledSalvageAssessment implements SalvageAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _quantity: number;
    private readonly _hasSalvage: boolean;

    constructor({ id, name, imageUrl, quantity, hasSalvage }: { id: string, name: string; imageUrl: string; quantity: number; hasSalvage: boolean; }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._quantity = quantity;
        this._hasSalvage = hasSalvage;
    }

    get quantity(): number {
        return this._quantity;
    }

    get isSalvageable(): boolean {
        return false;
    }

    get hasSalvage(): boolean {
        return this._hasSalvage;
    }

    get isDisabled(): boolean {
        return true;
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
        return [];
    }

}

export { DisabledSalvageAssessment }

class DefaultSalvageAssessment implements SalvageAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _quantity: number;
    private readonly _hasSalvage: boolean;
    private readonly _selectableOptions: SelectableSalvageOptionSummary[];

    constructor({
        id,
        name,
        imageUrl,
        quantity,
        hasSalvage = false,
        selectableOptions = []
    }: {
        id: string,
        name: string,
        imageUrl: string,
        quantity: number,
        hasSalvage?: boolean,
        selectableOptions?: SelectableSalvageOptionSummary[]
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._quantity = quantity;
        this._hasSalvage = hasSalvage;
        this._selectableOptions = selectableOptions;
    }

    get quantity(): number {
        return this._quantity;
    }

    get isSalvageable(): boolean {
        return true;
    }

    get hasSalvage(): boolean {
        return this._hasSalvage;
    }

    get isDisabled(): boolean {
        return false;
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

class ImpossibleSalvageAssessment implements SalvageAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _hasSalvage: boolean;
    private readonly _quantity: number;

    constructor({ id, name, imageUrl, hasSalvage = false, quantity }: { id: string, name: string; imageUrl: string; hasSalvage?: boolean; quantity: number; }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._hasSalvage = hasSalvage;
        this._quantity = quantity;
    }

    get quantity(): number {
        return this._quantity;
    }

    get isSalvageable(): boolean {
        return false;
    }

    get hasSalvage(): boolean {
        return this._hasSalvage;
    }

    get isDisabled(): boolean {
        return false;
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
        return [];
    }

}

export { ImpossibleSalvageAssessment }