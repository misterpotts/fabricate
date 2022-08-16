import {
    CraftingSystemSpecification,
    DnD5ECraftingCheckSpecification
} from "./specification/CraftingSystemSpecification";
import {CraftingSystem} from "./CraftingSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck, DefaultCraftingCheck, NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {GameSystem} from "./GameSystem";
import {ContributionCounter, ContributionCounterFactory} from "../crafting/check/ContributionCounter";
import {DiceRoller} from "../foundry/DiceRoller";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/DefaultComponentSelectionStrategy";
import {DefaultThresholdCalculator, ThresholdCalculator} from "../crafting/check/Threshold";
import {DefaultAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";
import {Tool} from "../crafting/Tool";
import {DefaultAlchemySpecification} from "../crafting/alchemy/AlchemySpecification";
import {EssenceIdentityProvider} from "../common/EssenceDefinition";
import {RollProvider5EFactory} from "../5e/RollProvider5E";

class CraftingSystemFactory {
    private readonly _specification: CraftingSystemSpecification;
    private readonly _partDictionary: PartDictionary;

    constructor(specification: CraftingSystemSpecification, partDictionary: PartDictionary) {
        this._specification = specification;
        this._partDictionary = partDictionary;
    }

    public make(): CraftingSystem {
        if (this._specification.gameSystem !== GameSystem.DND5E) {
            throw new Error("Fabricate only currently supports DnD 5th Edition. ");
        }
        const craftingCheck: CraftingCheck<Actor> = this.buildCraftingCheck(this._specification.gameSystem,
            this._specification.defaultCheck as DnD5ECraftingCheckSpecification);
        return new CraftingSystem({
            id: this._specification.id,
            essences: this._specification.essences,
            enabled: this._specification.enabled,
            gameSystem: this._specification.gameSystem,
            craftingCheck: craftingCheck,
            partDictionary: this._partDictionary,
            craftingAttemptFactory: new CraftingAttemptFactory({
                selectionStrategy: new DefaultComponentSelectionStrategy(),
                wastageType: this._specification.crafting.wastage
            }),
            alchemyAttemptFactory: new DefaultAlchemyAttemptFactory({
                wastage: this._specification.alchemy.wastage,
                components: {
                    min: this._specification.alchemy.constraints.components.min,
                    max: this._specification.alchemy.constraints.components.max
                },
                effectMatches: {
                    min: this._specification.alchemy.constraints.effects.min,
                    max: this._specification.alchemy.constraints.effects.max
                },
                alchemySpecification: new DefaultAlchemySpecification(EssenceIdentityProvider.for(this._specification.essences))
            })
        });
    }

    private buildCraftingCheck(gameSystem: GameSystem,
                               specification: DnD5ECraftingCheckSpecification): CraftingCheck<Actor> {
        const contributionCounterFactory = new ContributionCounterFactory({
            essenceContribution: specification.threshold.contributions.essence,
            ingredientContribution: specification.threshold.contributions.ingredient
        });
        const contributionCounter: ContributionCounter = contributionCounterFactory.make();
        const thresholdCalculator: ThresholdCalculator = new DefaultThresholdCalculator({
            baseValue: specification.threshold.baseValue,
            contributionCounter: contributionCounter,
            thresholdType: specification.threshold.type
        });

        switch (gameSystem) {
            case GameSystem.DND5E:
                const tool: Tool = new Tool(specification.tool.name, specification.tool.skillProficiency);
                return new DefaultCraftingCheck({
                    thresholdCalculator: thresholdCalculator,
                    rollProvider: new RollProvider5EFactory().make(specification.ability, tool),
                    diceRoller: new DiceRoller()
                });
            case GameSystem.PF2E:
                return new NoCraftingCheck();
            default:
                return new NoCraftingCheck();
        }
    }

}

export {CraftingSystemFactory}