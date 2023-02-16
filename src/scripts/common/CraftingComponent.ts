import {StringIdentity, Combination} from "./Combination";
import Properties from "../Properties";
import {Identifiable, Serializable} from "./Identity";
import {Essence} from "./Essence";

interface CraftingComponentJson {
    itemUuid: string;
    essences: Record<string, number>;
    salvage: Record<string, number>;
}

/**
 * A CraftingComponentSummary acts as a shallow copy of a Crafting Component. This allows components to reference the
 * shallow copy in salvage where referencing the object directly would create circular references that would make
 * loading difficult.
 */
class CraftingComponentSummary implements Identifiable {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;

    constructor({
        id,
        name,
        imageUrl
    }: {
        id: string;
        name: string;
        imageUrl: string;
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
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
}

class CraftingComponent implements Identifiable, Serializable<CraftingComponentJson> {

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
    private _essences: Combination<Essence>;
    private _salvage: Combination<CraftingComponentSummary>;

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.itemImageUrl,
        essences = Combination.EMPTY<Essence>(),
        salvage = Combination.EMPTY<CraftingComponentSummary>()
    }: {
        id: string;
        name: string;
        imageUrl?: string;
        essences?: Combination<Essence>;
        salvage?: Combination<CraftingComponentSummary>;
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

    get essences(): Combination<Essence> {
        return this._essences;
    }

    get salvage(): Combination<CraftingComponentSummary> {
        return this._salvage;
    }

    public get isSalvageable(): boolean {
        return !this.salvage.isEmpty();
    }

    public get hasEssences(): boolean {
        return !this.essences.isEmpty();
    }

    public toJson(): CraftingComponentJson {
        return {
            itemUuid: this._id,
            essences: this._essences.toJson(),
            salvage: this._salvage.toJson()
        }
    }

    set essences(value: Combination<Essence>) {
        this._essences = value;
    }

    set salvage(value: Combination<CraftingComponentSummary>) {
        this._salvage = value;
    }

    public summarise(): CraftingComponentSummary {
        return new CraftingComponentSummary({
            id: this._id,
            name: this._name,
            imageUrl: this._imageUrl
        });
    }

}

export { CraftingComponent, StringIdentity, CraftingComponentJson, CraftingComponentSummary }