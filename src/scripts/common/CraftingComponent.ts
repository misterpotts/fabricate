import {StringIdentity, Combination} from "./Combination";
import Properties from "../Properties";
import {Identifiable, Serializable} from "./Identity";
import {Essence} from "./Essence";
import {SelectableOptions} from "./SelectableOptions";

interface CraftingComponentJson {
    id: string;
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: Record<string, SalvageOptionJson>;
}

type SalvageOptionJson = Record<string, number>;

class SalvageOption implements Identifiable, Serializable<SalvageOptionJson> {

    private readonly _salvage: Combination<CraftingComponent>;
    private readonly _name: string;

    constructor({
        name,
        salvage
    }: {
        name: string;
        salvage: Combination<CraftingComponent>;
    }) {
        this._name = name;
        this._salvage = salvage;
    }

    get salvage(): Combination<CraftingComponent> {
        return this._salvage;
    }

    get isEmpty(): boolean {
        return this._salvage.isEmpty();
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._name;
    }

    toJson(): SalvageOptionJson {
        return this._salvage.toJson();
    }

}

class CraftingComponent implements Identifiable, Serializable<CraftingComponentJson> {

    private static readonly _NONE: CraftingComponent = new CraftingComponent({
        id: "NO_ID",
        itemUuid: "NO_ITEM_ID",
        name: "NO_NAME",
        disabled: true,
        imageUrl: Properties.ui.defaults.itemImageUrl,
        essences: Combination.EMPTY(),
        salvageOptions: new SelectableOptions({})
    });

    private readonly _id: string;
    private readonly _itemUuid: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private _essences: Combination<Essence>;
    private _salvageOptions: SelectableOptions<SalvageOptionJson, SalvageOption>;
    private _disabled: boolean;

    constructor({
        id,
        itemUuid,
        name,
        disabled = false,
        imageUrl = Properties.ui.defaults.itemImageUrl,
        essences = Combination.EMPTY<Essence>(),
        salvageOptions = new SelectableOptions({})
    }: {
        id: string;
        itemUuid: string;
        name: string;
        disabled?: boolean;
        imageUrl?: string;
        essences?: Combination<Essence>;
        salvageOptions?: SelectableOptions<SalvageOptionJson, SalvageOption>;
    }) {
        this._id = id;
        this._itemUuid = itemUuid;
        this._name = name;
        this._disabled = disabled;
        this._imageUrl = imageUrl;
        this._essences = essences;
        this._salvageOptions = salvageOptions;
    }

    get id(): string {
        return this._id;
    }

    get itemUuid(): string {
        return this._itemUuid;
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

    get salvage(): Combination<CraftingComponent> {
        return this._salvageOptions.selectedOption.salvage;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    get isSalvageable(): boolean {
        if (this._salvageOptions.isEmpty) {
            return true;
        }
        return this._salvageOptions.options
            .map(option => option.salvage.isEmpty())
            .reduce((left, right) => left && right, true);
    }

    public get hasEssences(): boolean {
        return !this.essences.isEmpty();
    }

    public toJson(): CraftingComponentJson {
        return {
            id: this._id,
            disabled: this._disabled,
            itemUuid: this._itemUuid,
            essences: this._essences.toJson(),
            salvageOptions: this._salvageOptions.toJson()
        }
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    set essences(value: Combination<Essence>) {
        this._essences = value;
    }

    public addSalvageOption(value: SalvageOption) {
        if (this._salvageOptions.has(value.id)) {
            throw new Error(`Result option ${value.id} already exists in this recipe. `);
        }
        this._salvageOptions.add(value);
    }

    public setSalvageOption(value: SalvageOption) {
        this._salvageOptions.set(value);
    }

    public deleteSalvageOptionById(id: string) {
        this._salvageOptions.deleteById(id);
    }

}

export { CraftingComponent, StringIdentity, CraftingComponentJson, SalvageOptionJson, SalvageOption }