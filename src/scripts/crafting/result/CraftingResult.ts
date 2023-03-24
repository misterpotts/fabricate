import {Combination} from "../../common/Combination";
import {Recipe} from "../../common/Recipe";
import {CraftingCheckResult, NoCraftingCheckResult} from "../check/CraftingCheckResult";
import {Component} from "../../common/Component";

interface CraftingResult {

    consumed: Combination<Component>;
    created: Combination<Component>;
    isSuccessful: boolean;

}

export { CraftingResult }

class NoCraftingResult implements CraftingResult {

    constructor() {}

    get created(): Combination<Component> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<Component> {
        return Combination.EMPTY();
    }

    get isSuccessful(): boolean {
        return false;
    }

}

export {NoCraftingResult};

class DefaultCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<Component>;
    private readonly _created: Combination<Component>;
    private readonly _checkResult?: CraftingCheckResult;

    constructor({
        recipe,
        consumed = Combination.EMPTY(),
        created = Combination.EMPTY(),
        checkResult = new NoCraftingCheckResult()
    }: {
        recipe: Recipe;
        consumed?: Combination<Component>;
        created?: Combination<Component>;
        checkResult?: CraftingCheckResult;
    }) {
        this._recipe = recipe;
        this._consumed = consumed;
        this._created = created;
        this._checkResult = checkResult;
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    get created(): Combination<Component> {
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