import {
    AlchemyDefinition,
    AlchemyFormulaDefinition,
    CraftingSystemDefinition
} from "../system_definitions/CraftingSystemDefinition";
import {CraftingSystem} from "./CraftingSystem";
import {CraftingCheck, DefaultCraftingCheck, NoCraftingCheck} from "../crafting/check/CraftingCheck";
import {ContributionCounter, ContributionCounterFactory} from "../crafting/check/ContributionCounter";
import {DiceRoller} from "../foundry/DiceRoller";
import {CraftingAttemptFactory} from "../crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../crafting/selection/DefaultComponentSelectionStrategy";
import {DefaultThresholdCalculator, ThresholdCalculator, ThresholdType} from "../crafting/check/Threshold";
import {DefaultAlchemyAttemptFactory, DisabledAlchemyAttemptFactory} from "../crafting/alchemy/AlchemyAttemptFactory";
import {AlchemyFormula, DefaultAlchemyFormula} from "../crafting/alchemy/AlchemyFormula";
import {Essence, EssenceIdentityProvider} from "../common/Essence";
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
} from "../system_definitions/DnD5e";
import {PartDictionary} from "./PartDictionary";

class CraftingSystemFactory {
    
    private readonly _rollProviderFactory: RollModifierProviderFactory<Actor>;
    private readonly _diceRoller: DiceRoller;
    private readonly _consumptionCalculatorFactory;

    constructor({
        rollProviderFactory,
        diceRoller,
        consumptionCalculatorFactory
    }: {
        rollProviderFactory?: RollModifierProviderFactory<Actor>;
        diceRoller?: DiceRoller;
        consumptionCalculatorFactory?: ComponentConsumptionCalculatorFactory;
    }) {
        this._rollProviderFactory = rollProviderFactory;
        this._diceRoller = diceRoller;
        this._consumptionCalculatorFactory = consumptionCalculatorFactory ?? new ComponentConsumptionCalculatorFactory();
    }

    public make(systemDefinition: CraftingSystemDefinition): CraftingSystem {

        const essenceDefinitions = Object.values(systemDefinition.essences).map(essenceConfig => new Essence(essenceConfig));
        const essenceIdentityProvider = EssenceIdentityProvider.for(essenceDefinitions);

        const recipeCraftingCheck = systemDefinition.checks.enabled ? this.buildCraftingCheck(systemDefinition.checks.recipe) : new NoCraftingCheck();
        const alchemyCraftingCheck = systemDefinition.checks.hasCustomAlchemyCheck ? this.buildCraftingCheck(systemDefinition.checks.alchemy) : recipeCraftingCheck;

        return new CraftingSystem({
            name: systemDefinition.name,
            id: systemDefinition.id,
            locked: systemDefinition.locked,
            author: systemDefinition.author,
            description: systemDefinition.description,
            partDictionary: new PartDictionary({}),
            summary: systemDefinition.summary,
            essences: essenceDefinitions,
            enabled: systemDefinition.enabled,
            craftingChecks: {
                alchemy: alchemyCraftingCheck,
                recipe: recipeCraftingCheck
            },
            craftingAttemptFactory: new CraftingAttemptFactory({
                selectionStrategy: new DefaultComponentSelectionStrategy(),
                wastageType: WastageType["PUNITIVE"] // todo: this belongs in the checks, not in the attempts
            }),
            alchemyAttemptFactory: this.buildAlchemyAttemptFactory(systemDefinition.alchemy,
                this._consumptionCalculatorFactory,
                essenceIdentityProvider)
        });
    }

    private buildAlchemyAttemptFactory(alchemyDefinition: AlchemyDefinition,
                                       componentConsumptionCalculatorFactory: ComponentConsumptionCalculatorFactory,
                                       essenceIdentityProvider: EssenceIdentityProvider) {
        if (!alchemyDefinition?.enabled) {
            return new DisabledAlchemyAttemptFactory()
        }
        return new DefaultAlchemyAttemptFactory({
            componentConsumptionCalculator: componentConsumptionCalculatorFactory.make(WastageType["PUNITIVE"]), // Todo : attempts don't need to be punitive/nonpunitive as they might auto succeed
            alchemicalCombiner: new AlchemicalCombiner5e(),
            constraints: alchemyDefinition.constraints,
            alchemyFormulae: Object.values(alchemyDefinition.formulae).map(formula => this.buildAlchemyFormula(essenceIdentityProvider, formula))
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
                essenceCombination: Combination<Essence>,
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