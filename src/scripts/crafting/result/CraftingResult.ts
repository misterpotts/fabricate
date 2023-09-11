import {Combination, DefaultCombination} from "../../common/Combination";
import {Recipe} from "../recipe/Recipe";
import {Component} from "../component/Component";

interface CraftingResult {

    recipe: Recipe;
    sourceActorId: string;
    targetActorId: string;
    description: string;
    consumed: Combination<Component>;
    produced: Combination<Component>;

}

export { CraftingResult }

class NoCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _targetActorId: string;

    constructor({
        recipe,
        description,
        sourceActorId,
        targetActorId,
    }: {
        recipe: Recipe;
        description: string;
        sourceActorId: string;
        targetActorId: string;
    }) {
        this._recipe = recipe;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
    }

    get description(): string {
        return this._description;
    }

    get produced(): Combination<Component> {
        return DefaultCombination.EMPTY();
    }

    get consumed(): Combination<Component> {
        return DefaultCombination.EMPTY();
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

}

export { NoCraftingResult };

class SuccessfulCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<Component>;
    private readonly _produced: Combination<Component>;
    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _targetActorId: string;

    constructor({
        recipe,
        consumed = DefaultCombination.EMPTY(),
        produced = DefaultCombination.EMPTY(),
        description,
        sourceActorId,
        targetActorId,
    }: {
        recipe: Recipe;
        consumed?: Combination<Component>;
        produced?: Combination<Component>;
        description: string;
        sourceActorId: string;
        targetActorId: string;
    }) {
        this._recipe = recipe;
        this._consumed = consumed;
        this._produced = produced;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
    }

    get description(): string {
        return this._description;
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    get produced(): Combination<Component> {
        return this._produced;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

}

export { SuccessfulCraftingResult };