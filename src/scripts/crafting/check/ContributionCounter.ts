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
            .units
            .map(((unit) => this._essenceModifier * unit.quantity))
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

interface ContributionCounterConfig {
    ingredientContribution: number | 0;
    essenceContribution: number | 0;
}

/**
 * Provides the appropriate ContributionCounter based on the values selected for Essence type and Ingredient quantity
 * contributions to the difficulty of the Check
 * */
class ContributionCounterFactory {

    /**
     * The numeric value to apply for each unique Essence type. Can be positive or negative
     * */
    private readonly _essenceContribution: number;
    /**
     * The numeric value to apply for each Ingredient (also considering quantity). Can be positive or negative
     * */
    private readonly _ingredientContribution: number;

    constructor(config: ContributionCounterConfig) {
        this._ingredientContribution = config.ingredientContribution;
        this._essenceContribution = config.essenceContribution;
    }

    /**
     * Creates and returns a concrete ContributionCounter based on the values provided for Ingredient and Essence
     * contribution.
     *
     * | Ingredient Contribution | Essence Contribution     | ContributionCounter             |
     * | :---------------------- | :----------------------  | :------------------------------ |
     * | 0                       | 0                        | NoContributionCounter           |
     * | 0                       | 1                        | EssenceContributionCounter      |
     * | 1                       | 0                        | IngredientContributionCounter   |
     * | 1                       | 1                        | CombinedContributionCounter     |
     *
     * @returns ContributionCounter the appropriate ContributionCounter
     * */
    public make(): ContributionCounter {
        const essenceCountContributes = this._essenceContribution && this._essenceContribution > 0;
        const ingredientCountContributes = this._ingredientContribution && this._ingredientContribution > 0;
        if (!essenceCountContributes && !ingredientCountContributes) {
            return new NoContributionCounter();
        }
        if (essenceCountContributes && ingredientCountContributes) {
            return new CombinedContributionCounter(this._ingredientContribution, this._essenceContribution);
        }
        if (ingredientCountContributes) {
            return new IngredientContributionCounter(this._ingredientContribution);
        }
        if (essenceCountContributes) {
            return new EssenceContributionCounter(this._essenceContribution);
        }
    }
}

export {ContributionCounterFactory};
export {ContributionCounterConfig};