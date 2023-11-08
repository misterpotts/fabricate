type SelectableRequirementOptionSummary = { name: string, id: string };

export { SelectableRequirementOptionSummary }

interface CraftingAssessment {

    isCraftable: boolean;

    isDisabled: boolean;

    recipeId: string;

    recipeName: string;

    imageUrl: string;

    selectableOptions: SelectableRequirementOptionSummary[];

}

export { CraftingAssessment }

class DisabledCraftingAssessment implements CraftingAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;

    constructor({ id, name, imageUrl }: { id: string, name: string; imageUrl: string; }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
    }

    get isCraftable(): boolean {
        return false;
    }

    get isDisabled(): boolean {
        return true;
    }

    get recipeId(): string {
        return this._id;
    }

    get recipeName(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get selectableOptions(): SelectableRequirementOptionSummary[] {
        return [];
    }

}

export { DisabledCraftingAssessment }

class DefaultCraftingAssessment implements CraftingAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _selectableOptions: SelectableRequirementOptionSummary[];

    constructor({
        id,
        name,
        imageUrl,
        selectableOptions = []
    }: {
        id: string,
        name: string,
        imageUrl: string,
        selectableOptions?: SelectableRequirementOptionSummary[]
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._selectableOptions = selectableOptions;
    }

    get isCraftable(): boolean {
        return true;
    }

    get isDisabled(): boolean {
        return false;
    }

    get recipeId(): string {
        return this._id;
    }

    get recipeName(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get selectableOptions(): SelectableRequirementOptionSummary[] {
        return this._selectableOptions;
    }

}

export { DefaultCraftingAssessment }

class ImpossibleCraftingAssessment implements CraftingAssessment {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;

    constructor({ id, name, imageUrl }: { id: string, name: string; imageUrl: string; }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
    }

    get isCraftable(): boolean {
        return false;
    }

    get isDisabled(): boolean {
        return false;
    }

    get recipeId(): string {
        return this._id;
    }

    get recipeName(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get selectableOptions(): SelectableRequirementOptionSummary[] {
        return [];
    }

}

export { ImpossibleCraftingAssessment }