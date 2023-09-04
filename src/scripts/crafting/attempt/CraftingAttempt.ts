import {ComponentSelection} from "../../component/ComponentSelection";
import {TrackedCombination} from "../../common/TrackedCombination";
import {Essence} from "../essence/Essence";
import {Component} from "../component/Component";
import {Combination} from "../../common/Combination";

interface CraftingAttempt {

    isPossible: boolean;
    description: string;
    targetActorId: string;
    sourceActorId: string;
    recipeId: string;
    essenceAmounts: TrackedCombination<Essence>;
    ingredientAmounts: TrackedCombination<Component>;
    catalystAmounts: TrackedCombination<Component>;
    essenceSources: Combination<Component>;
    requiresEssences: boolean;
    requiresIngredients: boolean;
    requiresCatalysts: boolean;

}

export { CraftingAttempt }

class ImpossibleCraftingAttempt implements CraftingAttempt {

    private readonly _description: string;
    private readonly _targetActorId: string;
    private readonly _sourceActorId: string;
    private readonly _recipeId: string;

    constructor({
        recipeId,
        description,
        targetActorId,
        sourceActorId,
    }: {
        recipeId: string;
        description: string;
        targetActorId: string;
        sourceActorId: string;
    }) {
        this._recipeId = recipeId;
        this._description = description;
        this._targetActorId = targetActorId;
        this._sourceActorId = sourceActorId;
    }


    get description(): string {
        return this._description;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get recipeId(): string {
        return this._recipeId;
    }

    get isPossible(): boolean {
        return false;
    }

    get catalystAmounts(): TrackedCombination<Component> {
        return TrackedCombination.EMPTY();
    }

    get essenceAmounts(): TrackedCombination<Essence> {
        return TrackedCombination.EMPTY();
    }

    get ingredientAmounts(): TrackedCombination<Component> {
        return TrackedCombination.EMPTY();
    }

    get requiresCatalysts(): boolean {
        return false;
    }

    get requiresEssences(): boolean {
        return false;
    }

    get requiresIngredients(): boolean {
        return false;
    }

    get essenceSources(): Combination<Component> {
        return Combination.EMPTY();
    }

}

export { ImpossibleCraftingAttempt };

class DefaultCraftingAttempt implements CraftingAttempt {

    private readonly _description: string;
    private readonly _targetActorId: string;
    private readonly _sourceActorId: string;
    private readonly _recipeId: string;
    private readonly _componentSelection: ComponentSelection;
    private readonly _possible: boolean;

    constructor({
        recipeId,
        possible,
        description,
        targetActorId,
        sourceActorId,
        componentSelection,
    }: {
        recipeId: string;
        possible: boolean;
        description: string;
        targetActorId: string;
        sourceActorId: string;
        componentSelection: ComponentSelection;
    }) {
        this._recipeId = recipeId;
        this._possible = possible;
        this._description = description;
        this._targetActorId = targetActorId;
        this._sourceActorId = sourceActorId;
        this._componentSelection = componentSelection;
    }

    get description(): string {
        return this._description;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get recipeId(): string {
        return this._recipeId;
    }

    get isPossible(): boolean {
        return this._possible;
    }

    get essenceAmounts(): TrackedCombination<Essence> {
        return this._componentSelection.essences;
    }

    get ingredientAmounts(): TrackedCombination<Component> {
        return this._componentSelection.ingredients;
    }

    get catalystAmounts(): TrackedCombination<Component> {
        return this._componentSelection.catalysts;
    }

    get essenceSources(): Combination<Component> {
        return this._componentSelection.essenceSources;
    }

    get requiresEssences(): boolean {
        return !this._componentSelection.essences.isEmpty;
    }

    get requiresIngredients(): boolean {
        return !this._componentSelection.ingredients.isEmpty;
    }

    get requiresCatalysts(): boolean {
        return !this._componentSelection.catalysts.isEmpty;
    }

    get consumedComponents(): Combination<Component> {
        return this._componentSelection.essenceSources
            .combineWith(this._componentSelection.ingredients.target);
    }

}

export {DefaultCraftingAttempt};

class NoCraftingAttempt implements CraftingAttempt {

    private readonly _description: string;

    private constructor({
        description ,
    }: {
        description: string;
    }) {
        this._description = description;
    }

    get isPossible(): boolean {
        return false;
    }

    get catalystAmounts(): TrackedCombination<Component> {
        return TrackedCombination.EMPTY();
    }

    get essenceAmounts(): TrackedCombination<Essence> {
        return TrackedCombination.EMPTY();
    }

    get ingredientAmounts(): TrackedCombination<Component> {
        return TrackedCombination.EMPTY();
    }

    get requiresCatalysts(): boolean {
        return false;
    }

    get requiresEssences(): boolean {
        return false;
    }

    get requiresIngredients(): boolean {
        return false;
    }

    get essenceSources(): Combination<Component> {
        return Combination.EMPTY();
    }

    get description(): string {
        return this._description;
    }

    get targetActorId(): string {
        return "";
    }

    get sourceActorId(): string {
        return "";
    }

    get recipeId(): string {
        return "";
    }

}

export {NoCraftingAttempt};