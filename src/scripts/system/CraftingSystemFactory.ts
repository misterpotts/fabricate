import {
    CraftingSystemSpec,
    DnD5ECraftingCheckSpec
} from "./specification/CraftingSystemSpec";
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
import {AlchemyFormula, DefaultAlchemyFormula} from "../crafting/alchemy/AlchemyFormula";
import {EssenceDefinition, EssenceIdentityProvider} from "../common/EssenceDefinition";
import {RollProvider5EFactory} from "../5e/RollProvider5E";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalEffect} from "../crafting/alchemy/AlchemicalEffect";
import {AlchemicalCombiner} from "../crafting/alchemy/AlchemicalCombiner";

class CraftingSystemFactory {

    private readonly _specification: CraftingSystemSpec;
    private readonly _partDictionary: PartDictionary;

    constructor(specification: CraftingSystemSpec, partDictionary: PartDictionary) {
        this._specification = specification;
        this._partDictionary = partDictionary;
    }

    public make(): CraftingSystem {
        if (this._specification.gameSystem !== GameSystem.DND5E) {
            throw new Error("Fabricate only currently supports DnD 5th Edition. ");
        }
        const craftingCheck: CraftingCheck<Actor> = this.buildCraftingCheck(this._specification.gameSystem, this._specification.defaultCheck as DnD5ECraftingCheckSpec);

        const essenceDefinitions: EssenceDefinition[] = this._specification.essences.map(essenceConfig => new EssenceDefinition(essenceConfig));

        const essenceIdentityProvider = EssenceIdentityProvider.for(essenceDefinitions);

        return new CraftingSystem({
            id: this._specification.id,
            essences: essenceDefinitions,
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
                combiner: new AlchemicalCombiner({

                }),
                constraints: this._specification.alchemy.constraints,
                alchemyFormulae: this._specification.alchemy.formulae.map(formula => this.buildAlchemyFormula(essenceIdentityProvider, formula))
            })
        });
    }

    private buildAlchemyFormula(essenceIdentityProvider: EssenceIdentityProvider, alchemyFormula: AlchemyFormula<ItemData>): AlchemyFormula<ItemData> {
        return new DefaultAlchemyFormula({
            basePartId: alchemyFormula.basePartID,
            essenceIdentityProvider: essenceIdentityProvider,
            effectsByEssenceIdentity: new Map<number, AlchemicalEffect<ItemData>>()
        });
    }

    private buildCraftingCheck(gameSystem: GameSystem,
                               specification: DnD5ECraftingCheckSpec): CraftingCheck<Actor> {
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