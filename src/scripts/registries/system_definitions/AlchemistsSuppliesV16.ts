import {AoeExtension5e, Condition5e, Damage5e, DiceMultiplier5e, SavingThrowModifier5e} from "../../5e/AlchemicalEffect5E";
import {EssenceDefinition} from "../../common/EssenceDefinition";
import {DND5ECraftingSystemSpecification} from "../../system/specification/DND5ECraftingSystemSpecification";
import {Combination, Unit} from "../../common/Combination";
import {AlchemySpecification} from "../../system/specification/AlchemySpecification";
import {Tool} from "../../crafting/Tool";
import {CraftingCheck5E} from "../../5e/CraftingCheck5E";
import {IngredientContributionCounter} from "../../crafting/ContributionCounter";

const elementalWater: EssenceDefinition = EssenceDefinition.builder()
    .withName('Water')
    .withDescription('Elemental water, one of the fundamental forces of nature')
    .withIconCode('tint')
    .withTooltip('Elemental water')
    .build();
const elementalEarth: EssenceDefinition = EssenceDefinition.builder()
    .withName('Earth')
    .withDescription('Elemental earth, one of the fundamental forces of nature')
    .withIconCode('mountain')
    .withTooltip('Elemental earth')
    .build();
const elementalAir: EssenceDefinition = EssenceDefinition.builder()
    .withName('Air')
    .withDescription('Elemental air, one of the fundamental forces of nature')
    .withIconCode('wind')
    .withTooltip('Elemental air')
    .build();
const elementalFire: EssenceDefinition = EssenceDefinition.builder()
    .withName('Fire')
    .withDescription('Elemental fire, one of the fundamental forces of nature')
    .withIconCode('fire')
    .withTooltip('Elemental fire')
    .build();
const negativeEnergy: EssenceDefinition = EssenceDefinition.builder()
    .withName('Negative Energy')
    .withDescription('Negative Energy\', \'Negative Energy - The essence of death and destruction')
    .withIconCode('moon')
    .withTooltip('Negative energy')
    .build();
const positiveEnergy: EssenceDefinition = EssenceDefinition.builder()
    .withName('Positive Energy')
    .withDescription('Positive Energy - The essence of life and creation')
    .withIconCode('sun')
    .withTooltip('Positive energy')
    .build();

const systemEssences: EssenceDefinition[] = [
    elementalWater,
    elementalEarth,
    elementalAir,
    elementalFire,
    positiveEnergy,
    negativeEnergy
];

const blinded = Condition5e.builder()
    .withDescription('Release a burst of stinging dust. Affected targets are blinded for the next round. ')
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 2)
    ]))
    .build();

const prone = Condition5e.builder()
    .withDescription('Release a puddle of slippery oil. Affected targets immediately fall prone. ')
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalWater, 2)
    ]))
    .build();

const lightningDamage = Damage5e.builder()
    .withDescription('Deal 1d4 lightning damage on contact. Double damage to targets touching a metal surface or using metal weapons or armor. ')
    .withDamage({expression: '1d4', type: 'lightning'})
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalAir, 2)
    ]))
    .build();

const fireDamage = Damage5e.builder()
    .withDescription('Deal 1d4 fire damage on contact. Double damage to targets with cloth or leather armor. ')
    .withDamage({expression: '1d4', type: 'fire'})
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalFire, 2)
    ]))
    .build();

const persistentDamage = Condition5e.builder()
    .withDescription('Release gel that sticks to targets. Each round, any damage-dealing effects continue to ' +
        'deal 1 damage each until an action is used to remove the gel with a DC 10 Dexterity check .')
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalEarth, 1),
        new Unit<EssenceDefinition>(elementalWater, 1)
    ]))
    .build();

const coldDamage = Damage5e.builder()
    .withDescription('Deal 1d4 cold damage on contact. Reduce target speed by 10 feet for the next round. ')
    .withDamage({expression: '1d4', type: 'cold'})
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalWater, 1),
        new Unit<EssenceDefinition>(elementalAir, 1)
    ]))
    .build();

const aoeExtension = AoeExtension5e.builder()
    .withDescription('Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. ')
    .withAoEExtension({units: 'ft', value: 5})
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalAir, 1),
        new Unit<EssenceDefinition>(elementalFire, 1)
    ]))
    .build();

const acidDamage = Damage5e.builder()
    .withDescription('Deal 1d8 acid damage on contact. ')
    .withDamage({expression: '1d8', type: 'acid'})
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(elementalFire, 1),
        new Unit<EssenceDefinition>(elementalEarth, 1)
    ]))
    .build();

const diceMultiplier = DiceMultiplier5e.builder()
    .withDescription('Roll double the number of all damage dice. ')
    .withDiceMultiplier(2)
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(positiveEnergy, 1)
    ]))
    .build();

const savingThrowModifier = SavingThrowModifier5e.builder()
    .withDescription('Increase the DC to avoid bomb effects by 2. ')
    .withSavingThrowModifier(2)
    .withEssenceCombination(Combination.ofUnits([
        new Unit<EssenceDefinition>(negativeEnergy, 1)
    ]))
    .build();

const alchemicalCombinerSpec: AlchemySpecification<Item5e.Data.Data> = AlchemySpecification.builder<Item5e.Data.Data>()
    .withMaxComponents(6)
    .withMaxEssences(6)
    .withAlchemicalEffect(blinded)
    .withAlchemicalEffect(prone)
    .withAlchemicalEffect(lightningDamage)
    .withAlchemicalEffect(fireDamage)
    .withAlchemicalEffect(persistentDamage)
    .withAlchemicalEffect(coldDamage)
    .withAlchemicalEffect(aoeExtension)
    .withAlchemicalEffect(acidDamage)
    .withAlchemicalEffect(diceMultiplier)
    .withAlchemicalEffect(savingThrowModifier)
    .withWastage(true)
    .withBaseComponentPartId('90z9nOwmGnP4aUUk')
    .build();

const craftingCheck: CraftingCheck5E = new CraftingCheck5E({
    ability: 'int',
    baseDC: 6,
    tool: new Tool('Alchemist\'s Supplies', 'Alchemy'),
    contributionCounter: new IngredientContributionCounter(1),
    exceedThreshold: false
});

const AlchemistsSuppliesSystemSpec: DND5ECraftingSystemSpecification = new DND5ECraftingSystemSpecification({
    name:'Alchemist\'s Supplies v1.6',
    compendiumPacks: ['fabricate.alchemists-supplies-v16'],
    description: 'Alchemy is the skill of exploiting unique properties of certain plants, minerals, and ' +
        'creature parts, combining them to produce fantastic substances. This allows even non-spellcasters to mimic ' +
        'minor magical effects, although the creations themselves are nonmagical.',
    essences: systemEssences,
    id: 'alchemists-supplies-v1.6',
    summary: '',
    author: 'u/calculusChild'
});

export {AlchemistsSuppliesSystemSpec};