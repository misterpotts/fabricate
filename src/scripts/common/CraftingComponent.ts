import {Identifiable, Identity} from "./Identifiable";
import {Combinable, Combination} from "./Combination";
import {EssenceId} from "./Essence";
import Properties from "../Properties";

interface CraftingComponentJson {
    itemUuid: string;
    essences: Record<string, number>;
    salvage: Record<string, number>;
}

class CraftingComponentId implements Identity, Combinable {

    private static readonly _NO_ID: CraftingComponentId = new CraftingComponentId("");

    private readonly _value: string;

    constructor(value: string) {
        this._value = value;
    }

    public static NO_ID() {
        return this._NO_ID;
    }

    get value(): string {
        return this._value;
    }

    get elementId(): string {
        return this.value;
    }

}

class CraftingComponent implements Identifiable<CraftingComponentId>, Combinable {

    private static readonly _NONE: CraftingComponent = new CraftingComponent({
        id: CraftingComponentId.NO_ID(),
        name: "NO_NAME",
        imageUrl: Properties.ui.defaults.itemImageUrl,
        essences: Combination.EMPTY(),
        salvage: Combination.EMPTY()
    });

    private readonly _id: CraftingComponentId;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _essences: Combination<EssenceId>;
    private readonly _salvage: Combination<CraftingComponentId>;

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.itemImageUrl,
        essences = Combination.EMPTY(),
        salvage = Combination.EMPTY()
    }: {
        id: CraftingComponentId;
        name: string;
        imageUrl?: string;
        essences?: Combination<EssenceId>;
        salvage?: Combination<CraftingComponentId>;
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._essences = essences;
        this._salvage = salvage;
    }

    get elementId(): string {
        return this._id.elementId;
    }

    public static NONE() {
        return this._NONE;
    }

    get id(): CraftingComponentId {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get essences(): Combination<EssenceId> {
        return this._essences;
    }

    get salvage(): Combination<CraftingComponentId> {
        return this._salvage;
    }

    public toJson(): CraftingComponentJson {
        return {
            itemUuid: this._id.value,
            essences: this._essences.toJson(),
            salvage: this._salvage.toJson()
        }
    }

}

export { CraftingComponent, CraftingComponentId, CraftingComponentJson }