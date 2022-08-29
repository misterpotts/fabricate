import {
    AlchemyFormulaDefinition,
    CraftingSystemDefinition
} from "../registries/system_definitions/interface/CraftingSystemDefinition";
import {CraftingSystem} from "./CraftingSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck, DefaultCraftingCheck, NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {GameSystem} from "./GameSystem";
import {ContributionCounter, ContributionCounterFactory} from "../crafting/check/ContributionCounter";
import {DiceRoller} from "../foundry/DiceRoller";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/DefaultComponentSelectionStrategy";
import {DefaultThresholdCalculator, ThresholdCalculator, ThresholdType} from "../crafting/check/Threshold";
import {DefaultAlchemyAttemptFactory, DisabledAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";
import {AlchemyFormula, DefaultAlchemyFormula} from "../crafting/alchemy/AlchemyFormula";
import {EssenceDefinition, EssenceIdentityProvider} from "../common/EssenceDefinition";
import {ComponentConsumptionCalculatorFactory, WastageType} from "../common/ComponentConsumptionCalculator";
import {
    AlchemicalCombination5e,
    AlchemicalCombiner5e,
    AoeExtension5e,
    Damage5e, DescriptiveEffect5e, DiceMultiplier5e,
    Dnd5EAlchemicalEffectName, SavingThrowModifier5e
} from "../5e/AlchemicalEffect5E";
import {Combination} from "../common/Combination";
import {AlchemicalEffect} from "../crafting/alchemy/AlchemicalEffect";
import {RollModifierProviderFactory} from "../crafting/check/GameSystemRollModifierProvider";
import {
    DnD5EAlchemyEffectSpec,
    DnD5EAoEExtensionEffectSpec,
    DnD5ECraftingCheckSpec, DnD5EDamageEffectSpec,
    DnD5EDamageMultiplierEffectSpec,
    DnD5ESaveModifierEffectSpec
} from "../registries/system_definitions/interface/DnD5e";

class CraftingSystemFactory {

    private readonly _specification: CraftingSystemDefinition;
    private readonly _partDictionary: PartDictionary;
    private readonly _rollProviderFactory: RollModifierProviderFactory<Actor>;
    private readonly _diceRoller: DiceRoller;

    constructor({
        specification,
        partDictionary,
        rollProviderFactory,
        diceRoller
    }: {
        specification: CraftingSystemDefinition;
        partDictionary: PartDictionary;
        rollProviderFactory: RollModifierProviderFactory<Actor>;
        diceRoller: DiceRoller;
    }) {
        this._specification = specification;
        this._partDictionary = partDictionary;
        this._rollProviderFactory = rollProviderFactory;
        this._diceRoller = diceRoller;
    }

    public make(): CraftingSystem {
        if (this._specification.gameSystem !== GameSystem.DND5E) {
            throw new Error("Fabricate only currently supports DnD 5th Edition. ");
        }

        const essenceDefinitions = this._specification.essences.map(essenceConfig => new EssenceDefinition(essenceConfig));
        const essenceIdentityProvider = EssenceIdentityProvider.for(essenceDefinitions);
        const consumptionCalculatorFactory = new ComponentConsumptionCalculatorFactory();

        const defaultCraftingCheck = this._specification.hasCraftingChecks ? this.buildCraftingCheck(this._specification.defaultCheck) : new NoCraftingCheck();
        const recipeCraftingCheck = this._specification.recipes.useCustomCheck ? this.buildCraftingCheck(this._specification.recipes.customCheck) : defaultCraftingCheck;
        const alchemyCraftingCheck = this._specification.alchemy.useCustomCheck ? this.buildCraftingCheck(this._specification.alchemy.customCheck) : defaultCraftingCheck;

        return new CraftingSystem({
            id: this._specification.id,
            essences: essenceDefinitions,
            enabled: this._specification.enabled,
            gameSystem: GameSystem[this._specification.gameSystem],
            craftingChecks: {
                alchemy: alchemyCraftingCheck,
                recipe: recipeCraftingCheck
            },
            partDictionary: this._partDictionary,
            craftingAttemptFactory: new CraftingAttemptFactory({
                selectionStrategy: new DefaultComponentSelectionStrategy(),
                wastageType: WastageType[this._specification.recipes.wastage]
            }),
            alchemyAttemptFactory: this.buildAlchemyAttemptFactory(this._specification.alchemy.enabled,
                consumptionCalculatorFactory,
                essenceIdentityProvider)
        });
    }

    private buildAlchemyAttemptFactory(enabled: boolean,
                                       componentConsumptionCalculatorFactory: ComponentConsumptionCalculatorFactory,
                                       essenceIdentityProvider: EssenceIdentityProvider) {
        if (!enabled) {
            return new DisabledAlchemyAttemptFactory()
        }
        return new DefaultAlchemyAttemptFactory({
            componentConsumptionCalculator: componentConsumptionCalculatorFactory.make(WastageType[this._specification.alchemy.wastage]),
            alchemicalCombiner: new AlchemicalCombiner5e(),
            constraints: this._specification.alchemy.constraints,
            alchemyFormulae: this._specification.alchemy.formulae.map(formula => this.buildAlchemyFormula(essenceIdentityProvider, formula))
        });
    }

    private buildAlchemyFormula(essenceIdentityProvider: EssenceIdentityProvider,
                                alchemyFormulaSpec: AlchemyFormulaDefinition): AlchemyFormula {
        const alchemyFormula = new DefaultAlchemyFormula({
            basePartId: alchemyFormulaSpec.basePartId,
            essenceIdentityProvider: essenceIdentityProvider
        });
        alchemyFormulaSpec.effects.map(alchemyEffectSpec => {
            let result: {
                essenceCombination: Combination<EssenceDefinition>,
                alchemicalEffect: AlchemicalEffect<AlchemicalCombination5e>
            } = {
                alchemicalEffect: null,
                essenceCombination: null
            };
            result.essenceCombination = Object.keys(alchemyEffectSpec.essenceMatch)
                .map(essenceSlug => Combination.of(essenceIdentityProvider.getEssenceDefinitionBySlug(essenceSlug), alchemyEffectSpec.essenceMatch[essenceSlug]))
                .reduce((left, right) => left.combineWith(right));
            switch (alchemyEffectSpec.type) {
                case Dnd5EAlchemicalEffectName.AOE_EXTENSION:
                    const aoe = (alchemyEffectSpec as DnD5EAoEExtensionEffectSpec).aoe;
                    const aoeEffect = new AoeExtension5e({
                        units: aoe.units,
                        value: aoe.value
                    });
                    result.alchemicalEffect = aoeEffect;
                    break;
                case Dnd5EAlchemicalEffectName.DAMAGE:
                    const damageSpec = alchemyEffectSpec as DnD5EDamageEffectSpec;
                    const damageEffect = new Damage5e({
                        type: damageSpec.damage.type,
                        roll: this._diceRoller.fromExpression(damageSpec.damage.expression),
                        diceRoller: this._diceRoller
                    })
                    result.alchemicalEffect = damageEffect;
                    break;
                case Dnd5EAlchemicalEffectName.DESCRIPTIVE:
                    const description = (alchemyEffectSpec as DnD5EAlchemyEffectSpec).description;
                    const descriptiveEffect = new DescriptiveEffect5e(description);
                    result.alchemicalEffect = descriptiveEffect;
                    break;
                case Dnd5EAlchemicalEffectName.DAMAGE_MULTIPLIER:
                    const multiplierValue = (alchemyEffectSpec as DnD5EDamageMultiplierEffectSpec).diceMultiplier;
                    const diceMultiplier = new DiceMultiplier5e({
                        multiplierValue: multiplierValue,
                        diceRoller: this._diceRoller
                    });
                    result.alchemicalEffect = diceMultiplier
                    break;
                case Dnd5EAlchemicalEffectName.SAVE_MODIFIER:
                    const saveModifier = (alchemyEffectSpec as DnD5ESaveModifierEffectSpec).saveModifier;
                    const savingThrowModifier = new SavingThrowModifier5e({
                        value: saveModifier
                    });
                    result.alchemicalEffect = savingThrowModifier;
                    break;
            }
            return result;
        }).forEach(result => alchemyFormula.registerEffect(result.essenceCombination, result.alchemicalEffect));
        return alchemyFormula;
    }

    private buildCraftingCheck(specification?: DnD5ECraftingCheckSpec): CraftingCheck<Actor> {
        if (!specification) {
            return new NoCraftingCheck();
        }
        const contributionCounterFactory = new ContributionCounterFactory({
            essenceContribution: specification.threshold.contributions.essence,
            ingredientContribution: specification.threshold.contributions.ingredient
        });
        const contributionCounter: ContributionCounter = contributionCounterFactory.make();
        const thresholdCalculator: ThresholdCalculator = new DefaultThresholdCalculator({
            baseValue: specification.threshold.baseValue,
            contributionCounter: contributionCounter,
            thresholdType: ThresholdType[specification.threshold.type]
        });
        const rollProvider = this._rollProviderFactory.make(specification);
        return new DefaultCraftingCheck({
            thresholdCalculator: thresholdCalculator,
            gameSystemRollModifierProvider: rollProvider,
            diceRoller: this._diceRoller
        });
    }

}

export {CraftingSystemFactory}