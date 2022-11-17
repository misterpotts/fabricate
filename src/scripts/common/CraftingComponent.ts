import {Combinable, CombinableString, Combination} from "./Combination";
import Properties from "../Properties";

interface CraftingComponentJson {
    itemUuid: string;
    essences: Record<string, number>;
    salvage: Record<string, number>;
}

class CraftingComponent implements Combinable {

    private static readonly _NONE: CraftingComponent = new CraftingComponent({
        id: "NO_ID",
        name: "NO_NAME",
        imageUrl: Properties.ui.defaults.itemImageUrl,
        essences: Combination.EMPTY(),
        salvage: Combination.EMPTY()
    });

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private _essences: Combination<CombinableString>;
    private _salvage: Combination<CombinableString>;

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.itemImageUrl,
        essences = Combination.EMPTY(),
        salvage = Combination.EMPTY()
    }: {
        id: string;
        name: string;
        imageUrl?: string;
        essences?: Combination<CombinableString>;
        salvage?: Combination<CombinableString>;
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._essences = essences;
        this._salvage = salvage;
    }

    get elementId(): string {
        return this._id;
    }

    public static NONE() {
        return this._NONE;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get essences(): Combination<CombinableString> {
        return this._essences;
    }

    get salvage(): Combination<CombinableString> {
        return this._salvage;
    }

    public toJson(): CraftingComponentJson {
        return {
            itemUuid: this._id,
            essences: this._essences.toJson(),
            salvage: this._salvage.toJson()
        }
    }

    set essences(value: Combination<CombinableString>) {
        this._essences = value;
    }

    set salvage(value: Combination<CombinableString>) {
        this._salvage = value;
    }
}

export { CraftingComponent, CombinableString, CraftingComponentJson }