import {Identifiable} from "./Identifiable";
import {Combination} from "./Combination";
import {Essence} from "./Essence";
import Properties from "../Properties";

interface CraftingComponentJson {
    essences: Record<string, number>;
    salvage: Record<string, number>;
}

class CraftingComponent implements Identifiable {

    private static readonly _NONE: CraftingComponent = new CraftingComponent({
        id: "NO_ID",
        name: "NO_NAME",
        imageUrl: Properties.settings.defaultImageUrl,
        essences: Combination.EMPTY(),
        salvage: Combination.EMPTY()
    });

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _essences: Combination<Essence>;
    private readonly _salvage: Combination<CraftingComponent>;

    constructor({
        id,
        name,
        imageUrl,
        essences,
        salvage
    }: {
        id: string;
        name: string;
        imageUrl: string;
        essences?: Combination<Essence>;
        salvage?: Combination<CraftingComponent>;
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._essences = essences ?? Combination.EMPTY();
        this._salvage = salvage ?? Combination.EMPTY();
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

    get essences(): Combination<Essence> {
        return this._essences;
    }

    get salvage(): Combination<CraftingComponent> {
        return this._salvage;
    }

    public setSalvage(value: Combination<CraftingComponent>): CraftingComponent {
        return new CraftingComponent({
            id: this._id,
            name: this._name,
            imageUrl: this._imageUrl,
            essences: this._essences,
            salvage: value
        })
    }

    public toJson(): CraftingComponentJson {
        return {
            essences: this._essences.toJson(),
            salvage: this._salvage.toJson()
        }
    }

}

export { CraftingComponent, CraftingComponentJson }