import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";

interface SalvageResult {

    consumed: Combination<CraftingComponent>;
    created: Combination<CraftingComponent>;

}

export { SalvageResult }

class NoSalvageResult implements SalvageResult {

    constructor() {}

    get created(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

}

export {NoSalvageResult};

class SuccessfulSalvageResult implements SalvageResult {

    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _created: Combination<CraftingComponent>;

    constructor({
        consumed,
        created
    }: {
        consumed: Combination<CraftingComponent>;
        created: Combination<CraftingComponent>;
    }) {
        this._consumed = consumed;
        this._created = created;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    get created(): Combination<CraftingComponent> {
        return this._created;
    }

}

export { SuccessfulSalvageResult };

class UnsuccessfulSalvageResult implements SalvageResult {

    private readonly _consumed: Combination<CraftingComponent>;

    constructor({
        consumed
    }: {
        consumed: Combination<CraftingComponent>;
    }) {
        this._consumed = consumed;
    }

    get created(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

}

export { UnsuccessfulSalvageResult };