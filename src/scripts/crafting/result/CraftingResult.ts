import {Combination} from "../../common/Combination";
import {Recipe} from "../../common/Recipe";
import {CraftingCheckResult, NoCraftingCheckResult} from "../check/CraftingCheckResult";
import {CraftingComponent} from "../../common/CraftingComponent";

interface CraftingResult {

    consumed: Combination<CraftingComponent>;
    created: Combination<CraftingComponent>;
    isSuccessful: boolean;

}

export { CraftingResult }

class NoCraftingResult implements CraftingResult {

    constructor() {}

    get created(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    get isSuccessful(): boolean {
        return false;
    }

}

export {NoCraftingResult};

class DefaultCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _created: Combination<CraftingComponent>;
    private readonly _checkResult?: CraftingCheckResult;

    constructor({
        recipe,
        consumed = Combination.EMPTY(),
        created = Combination.EMPTY(),
        checkResult = new NoCraftingCheckResult()
    }: {
        recipe: Recipe;
        consumed?: Combination<CraftingComponent>;
        created?: Combination<CraftingComponent>;
        checkResult?: CraftingCheckResult;
    }) {
        this._recipe = recipe;
        this._consumed = consumed;
        this._created = created;
        this._checkResult = checkResult;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    get created(): Combination<CraftingComponent> {
        return this._created;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get checkResult(): CraftingCheckResult {
        return this._checkResult;
    }

    get isSuccessful(): boolean {
        return this._checkResult.isSuccessful;
    }

}

export {DefaultCraftingResult};