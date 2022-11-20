import {StringIdentity, Combination} from "./Combination";
import Properties from "../Properties";
import {Identifiable} from "./Identity";

interface CraftingComponentJson {
    itemUuid: string;
    essences: Record<string, number>;
    salvage: Record<string, number>;
}

class CraftingComponent implements Identifiable {

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
    private _essences: Combination<StringIdentity>;
    private _salvage: Combination<StringIdentity>;

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
        essences?: Combination<StringIdentity>;
        salvage?: Combination<StringIdentity>;
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._essences = essences;
        this._salvage = salvage;
    }

    get id(): string {
        return this._id;
    }

    public static NONE() {
        return this._NONE;
    }

    get name(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get essences(): Combination<StringIdentity> {
        return this._essences;
    }

    get salvage(): Combination<StringIdentity> {
        return this._salvage;
    }

    public toJson(): CraftingComponentJson {
        return {
            itemUuid: this._id,
            essences: this._essences.toJson(),
            salvage: this._salvage.toJson()
        }
    }

    set essences(value: Combination<StringIdentity>) {
        this._essences = value;
    }

    set salvage(value: Combination<StringIdentity>) {
        this._salvage = value;
    }

}

export { CraftingComponent, StringIdentity, CraftingComponentJson }