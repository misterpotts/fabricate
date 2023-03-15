import {ComponentSelection} from "../../component/ComponentSelection";
import {TrackedCombination} from "../../common/TrackedCombination";
import {Essence} from "../../common/Essence";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";

interface CraftingAttempt {

    isPossible: boolean;
    essenceAmounts: TrackedCombination<Essence>;
    ingredientAmounts: TrackedCombination<CraftingComponent>;
    catalystAmounts: TrackedCombination<CraftingComponent>;
    requiresEssences: boolean;
    requiresIngredients: boolean;
    requiresCatalysts: boolean;
    essenceSources: Combination<CraftingComponent>;

}

export {CraftingAttempt}

class DefaultCraftingAttempt implements CraftingAttempt {

    private readonly _componentSelection: ComponentSelection;
    private readonly _possible: boolean;

    constructor({
        componentSelection,
        possible
    }: {
        componentSelection: ComponentSelection;
        ingredientOptionName: string;
        possible: boolean;
    }) {
        this._componentSelection = componentSelection;
        this._possible = possible;
    }

    get isPossible(): boolean {
        return this._possible;
    }

    get essenceAmounts(): TrackedCombination<Essence> {
        return this._componentSelection.essences;
    }

    get ingredientAmounts(): TrackedCombination<CraftingComponent> {
        return this._componentSelection.ingredients;
    }

    get catalystAmounts(): TrackedCombination<CraftingComponent> {
        return this._componentSelection.catalysts;
    }

    get essenceSources(): Combination<CraftingComponent> {
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

    get consumedComponents(): Combination<CraftingComponent> {
        return this._componentSelection.essenceSources
            .combineWith(this._componentSelection.ingredients.actual);
    }

}

export {DefaultCraftingAttempt};

class NoCraftingAttempt implements CraftingAttempt {

    private static readonly _INSTANCE: NoCraftingAttempt = new NoCraftingAttempt();

    private constructor() {}

    static get INSTANCE(): NoCraftingAttempt {
        return NoCraftingAttempt._INSTANCE;
    }

    get isPossible(): boolean {
        return false;
    }

    get catalystAmounts(): TrackedCombination<CraftingComponent> {
        return TrackedCombination.EMPTY();
    }

    get essenceAmounts(): TrackedCombination<Essence> {
        return TrackedCombination.EMPTY();
    }

    get ingredientAmounts(): TrackedCombination<CraftingComponent> {
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

    get essenceSources(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

}

export {NoCraftingAttempt};