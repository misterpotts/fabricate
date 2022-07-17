import {
    CraftingCheckSpecification,
    CraftingSystemSpecification,
    DND5ERollModifiers
} from "./specification/CraftingSystemSpecification";
import {CraftingSystem} from "./CraftingSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck, DefaultCraftingCheck, NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {GameSystem} from "./GameSystem";
import {ContributionCounter, ContributionCounterFactory} from "../crafting/check/ContributionCounter";
import {RollTermProvider5E} from "../5e/RollTermProvider5E";
import {DiceRoller} from "../foundry/DiceRoller";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/DefaultComponentSelectionStrategy";
import {DefaultThresholdCalculator, ThresholdCalculator} from "../crafting/check/Threshold";

class CraftingSystemFactory {
    private readonly _specification: CraftingSystemSpecification;
    private readonly _partDictionary: PartDictionary;
    private readonly _enabled: boolean;

    constructor(specification: CraftingSystemSpecification, partDictionary: PartDictionary, enabled: boolean) {
        this._specification = specification;
        this._partDictionary = partDictionary;
        this._enabled = enabled;
    }

    public make(): CraftingSystem {
        const craftingCheck: CraftingCheck<Actor> = this.buildCraftingCheck(
            this._specification.gameSystem,
            this._specification.craftingCheckSpecification);
        return new CraftingSystem({
            id: this._specification.id,
            essences: this._specification.essences,
            enabled: this._enabled,
            gameSystem: this._specification.gameSystem,
            craftingCheck: craftingCheck,
            partDictionary: this._partDictionary,
            craftingAttemptFactory: new CraftingAttemptFactory({
                selectionStrategy: new DefaultComponentSelectionStrategy(),
                wastageType: this._specification.wastageType
            })
        });
    }

    private buildCraftingCheck(gameSystem: GameSystem, specification: CraftingCheckSpecification): CraftingCheck<Actor> {
        const contributionCounterFactory = new ContributionCounterFactory(specification.contributionCounterConfig);
        const contributionCounter: ContributionCounter = contributionCounterFactory.make();
        const thresholdCalculator: ThresholdCalculator = new DefaultThresholdCalculator({
            baseValue: specification.baseValue,
            contributionCounter: contributionCounter,
            thresholdType: specification.thresholdType
        });

        switch (gameSystem) {
            case GameSystem.DND5E:
                const dnd5eRollModifiers: DND5ERollModifiers = <DND5ERollModifiers>specification.systemProperties;
                return new DefaultCraftingCheck({
                    thresholdCalculator: thresholdCalculator,
                    rollTermProvider: new RollTermProvider5E(dnd5eRollModifiers),
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