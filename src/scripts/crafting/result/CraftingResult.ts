import {Combination} from "../../common/Combination";
import {Recipe} from "../recipe/Recipe";
import {Component} from "../component/Component";

interface CraftingResult {

    consumed: Combination<Component>;
    created: Combination<Component>;

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

}

export { NoCraftingResult };

class DefaultCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<Component>;
    private readonly _created: Combination<Component>;

    constructor({
        recipe,
        consumed = Combination.EMPTY(),
        created = Combination.EMPTY(),
    }: {
        recipe: Recipe;
        consumed?: Combination<Component>;
        created?: Combination<Component>;
    }) {
        this._recipe = recipe;
        this._consumed = consumed;
        this._created = created;
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

}

export { DefaultCraftingResult };