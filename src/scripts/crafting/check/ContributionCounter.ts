import {Combination, Unit} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";

/**
 * Determines how a Combination of Crafting Components impacts the difficulty of a Crafting check (if at all)
 * */
interface ContributionCounter {

    /**
     * Determine the modifier value for the given Combination of Crafting Components
     *
     * @param components The components to be considered for the Crafting Check
     * @returns number The numeric modifier for the providedComponents to apply to the Check
     * */
    determineDCModifier(components: Combination<CraftingComponent>): number;

}

/**
 * Determines how the number of different types of Essences contribute to the difficulty of the check
 * */
class EssenceContributionCounter implements ContributionCounter {

    /**
     * The numeric value to apply for each unique Essence type. Can be positive or negative
     * */
    private readonly _essenceModifier: number;

    constructor(essenceModifier: number) {
        this._essenceModifier = essenceModifier;
    }

    /**
     * Determine the modifier value for the given Combination of Crafting Components by only considering the number
     * of unique essences in that Combination of Components
     *
     * @param components The components to be considered for the Crafting Check
     * @returns number The numeric modifier for the providedComponents to apply to the Check
     * */
    determineDCModifier(components: Combination<CraftingComponent>): number {
        return components.explode((component: CraftingComponent) => component.essences)
            .members.map((() => this._essenceModifier))
            .reduce((left: number, right: number) => left + right, 0);
    }

}

/**
 * Determines how the number of Ingredients contribute to the difficulty of the check
 * */
class IngredientContributionCounter implements ContributionCounter {

    /**
     * The numeric value to apply for each Ingredient (also considering quantity). Can be positive or negative
     * */
    private readonly _ingredientModifier: number;

    constructor(ingredientModifier: number) {
        this._ingredientModifier = ingredientModifier;
    }

    /**
     * Determine the modifier value for the given Combination of Crafting Components by only considering the quantity of
     * Ingredients in that Combination of Components
     *
     * @param components The components to be considered for the Crafting Check
     * @returns number The numeric modifier for the providedComponents to apply to the Check
     * */
    determineDCModifier(components: Combination<CraftingComponent>): number {
        return components.units.map((unit: Unit<CraftingComponent>) => this._ingredientModifier * unit.quantity)
            .reduce((left: number, right: number) => left + right, 0);
    }

}

/**
 * Determines how the number of Ingredients and the number of Essences contribute to the difficulty of the check
 * */
class CombinedContributionCounter implements ContributionCounter {

    /**
     * The numeric value to apply for each unique Essence type. Can be positive or negative
     * */
    private readonly _essenceContributionCounter: EssenceContributionCounter;
    /**
     * The numeric value to apply for each Ingredient (also considering quantity). Can be positive or negative
     * */
    private readonly _ingredientContributionCounter: IngredientContributionCounter;

    constructor(ingredientModifier: number, essenceModifier: number) {
        this._essenceContributionCounter = new EssenceContributionCounter(essenceModifier);
        this._ingredientContributionCounter = new IngredientContributionCounter(ingredientModifier);
    }

    /**
     * Determine the modifier value for the given Combination of Crafting Components by considering both the quantity of
     * Ingredients in and the number of unique essences in that Combination of Components
     *
     * @param components The components to be considered for the Crafting Check
     * @returns number The numeric modifier for the providedComponents to apply to the Check
     * */
    determineDCModifier(components: Combination<CraftingComponent>): number {
        const ingredientContribution: number = this._ingredientContributionCounter.determineDCModifier(components);
        const essenceContribution: number = this._essenceContributionCounter.determineDCModifier(components);
        return ingredientContribution + essenceContribution;
    }

}

/**
 * Determines that no amount or arrangement of Essences or Ingredients can contribute to the difficulty of the Check
 * */
class NoContributionCounter implements ContributionCounter {
    /**
     * Returns zero, as no amount or arrangement of Essences or Ingredients can contribute to the difficulty of the
     * Check
     *
     * @returns number zero, for no contribution
     * */
    determineDCModifier(): number {
        return 0;
    }
}

export {ContributionCounter, CombinedContributionCounter, EssenceContributionCounter, IngredientContributionCounter, NoContributionCounter}