import {Combination, StringIdentity} from "../../common/Combination";
import {Recipe} from "../Recipe";
import {CraftingCheckResult} from "../check/CraftingCheckResult";
import {CraftingComponent} from "../../common/CraftingComponent";

interface CraftingResult {

    consumed: Combination<CraftingComponent>;
    created: Combination<StringIdentity>;

}

export { CraftingResult }

class NoCraftingResult implements CraftingResult {

    constructor() {}

    get created(): Combination<StringIdentity> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

}

export {NoCraftingResult};

class SuccessfulCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _created: Combination<StringIdentity>;
    private readonly _checkResult?: CraftingCheckResult;

    constructor({
        recipe,
        consumed,
        created,
        checkResult
    }: {
        recipe: Recipe;
        consumed: Combination<CraftingComponent>;
        created: Combination<StringIdentity>;
        checkResult: CraftingCheckResult;
    }) {
        this._recipe = recipe;
        this._consumed = consumed;
        this._created = created;
        this._checkResult = checkResult;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    get created(): Combination<StringIdentity> {
        return this._created;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get checkResult(): CraftingCheckResult {
        return this._checkResult;
    }
}

export {SuccessfulCraftingResult};

class UnsuccessfulCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _checkResult: CraftingCheckResult;

    constructor({
        recipe,
        consumed,
        checkResult
    }: {
        recipe: Recipe;
        consumed: Combination<CraftingComponent>;
        checkResult: CraftingCheckResult;

    }) {
        this._recipe = recipe;
        this._consumed = consumed;
        this._checkResult = checkResult;
    }

    get created(): Combination<StringIdentity> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get checkResult(): CraftingCheckResult {
        return this._checkResult;
    }
}

export {UnsuccessfulCraftingResult};