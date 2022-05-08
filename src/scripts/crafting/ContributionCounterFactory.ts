import {
    CombinedContributionCounter,
    ContributionCounter,
    EssenceContributionCounter, IngredientContributionCounter,
    NoContributionCounter
} from "./ContributionCounter";

interface ContributionCounterFactoryConfig {
    ingredientContribution: number;
    essenceContribution: number;
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

    constructor(config: ContributionCounterFactoryConfig) {
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

export {ContributionCounterFactory}