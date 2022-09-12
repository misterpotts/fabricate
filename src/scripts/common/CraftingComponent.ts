import {Identifiable} from "./Identifiable";
import {Combination} from "./Combination";
import {Essence} from "./Essence";

class CraftingComponent implements Identifiable {

    private static readonly _NONE: CraftingComponent = new CraftingComponent({
        id: "NO_ID",
        essences: Combination.EMPTY(),
        salvage: Combination.EMPTY()
    });

    private readonly _id: string;
    private readonly _essences: Combination<Essence>;
    private readonly _salvage: Combination<CraftingComponent>;

    constructor({
        id,
        essences,
        salvage
    }: {
        id: string;
        essences?: Combination<Essence>;
        salvage?: Combination<CraftingComponent>;
    }) {
        this._id = id;
        this._essences = essences ?? Combination.EMPTY();
        this._salvage = salvage ?? Combination.EMPTY();
    }

    public static NONE() {
        return this._NONE;
    }

    get id(): string {
        return this._id;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    get salvage(): Combination<CraftingComponent> {
        return this._salvage;
    }

}

export {CraftingComponent}