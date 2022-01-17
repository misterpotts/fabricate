import { EssenceCombiner } from '../../core/EssenceCombiner';
import { GameSystemType } from '../../core/GameSystemType';
import { CraftingComponent } from '../../core/CraftingComponent';
import { CraftingSystemSpecification } from '../../core/CraftingSystemSpecification';
import {
  AoeExtension5e,
  Condition5e,
  Damage5e,
  DiceMultiplier5e,
  SavingThrowModifier5e,
} from '../../dnd5e/AlchemicalEffect5E';
import { AlchemySpecification, Fabricator } from '../../core/Fabricator';
import { EssenceDefinition } from '../../core/CraftingSystem';
import { CraftingCheck5e, Tool } from '../../core/CraftingCheck';

const blinded = new Condition5e(
  ['earth', 'earth'],
  'Release a burst of stinging dust. Affected targets are blinded for the next round. ',
);

const prone = new Condition5e(
  ['water', 'water'],
  'Release a puddle of slippery oil. Affected targets immediately fall prone. ',
);

const lightningDamage = new Damage5e(
  ['air', 'air'],
  'Deal 1d4 lightning damage on contact. Double damage to targets touching a metal surface or using metal weapons or armor. ',
  { expression: '1d4', type: 'lightning' },
);

const fireDamage = new Damage5e(
  ['fire', 'fire'],
  'Deal 1d4 fire damage on contact. Double damage to targets with cloth or leather armor. ',
  { expression: '1d4', type: 'fire' },
);

const persistentDamage = new Condition5e(
  ['earth', 'water'],
  'Release gel that sticks to targets. Each round, any damage-dealing effects continue to ' +
    'deal 1 damage each until an action is used to remove the gel with a DC 10 Dexterity check .',
);

const coldDamage = new Damage5e(
  ['water', 'air'],
  'Deal 1d4 cold damage on contact. Reduce target speed by 10 feet for the next round. ',
  { expression: '1d4', type: 'cold' },
);

const aoeExtension = new AoeExtension5e(
  ['air', 'fire'],
  'Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. ',
  { units: 'ft', value: 5 },
);

const acidDamage = new Damage5e(['fire', 'earth'], 'Deal 1d8 acid damage on contact. ', {
  expression: '1d8',
  type: 'acid',
});

const diceMultiplier = new DiceMultiplier5e(['positive-energy'], 'Roll double the number of all damage dice. ', 2);

const savingThrowModifier = new SavingThrowModifier5e(
  ['negative-energy'],
  'Increase the DC to avoid bomb effects by 2. ',
  2,
);

const essenceCombiner: EssenceCombiner<ItemData5e> = EssenceCombiner.builder<ItemData5e>()
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
  .build();

const alchemistsSuppliesV16 = 'fabricate.alchemists-supplies-v16';

const alchemySpecification = new AlchemySpecification(
  essenceCombiner,
  CraftingComponent.builder()
    .withName('Alchemical Bomb')
    .withImageUrl('systems/dnd5e/icons/items/inventory/bomb.jpg')
    .withPartId('90z9nOwmGnP4aUUk')
    .withSystemId(alchemistsSuppliesV16)
    .withEssences([])
    .build(),
);

const craftingCheck: CraftingCheck5e = CraftingCheck5e.builder()
  .withAbility('int')
  .withBaseDC(6)
  .withTool(new Tool("Alchemist's Supplies", 'Alchemy'))
  .withIngredientDCModifier(2)
  .build();

const fabricator: Fabricator<ItemData5e, ActorData5e> = Fabricator.builder<ItemData5e, ActorData5e>()
  .withCraftingCheck(craftingCheck)
  .withAlchemySpecification(alchemySpecification)
  .build();

const AlchemistsSuppliesSystemSpec: CraftingSystemSpecification = CraftingSystemSpecification.builder()
  .withName("Alchemist's Supplies v1.6")
  .withCompendiumPackKey(alchemistsSuppliesV16)
  .withEnableHint("Enable the Alchemist's Supplies v1.6 crafting system by /u/calculusChild?")
  .withDescription(
    'Alchemy is the skill of exploiting unique properties of certain plants, minerals, and ' +
      'creature parts, combining them to produce fantastic substances. This allows even non-spellcasters to mimic ' +
      'minor magical effects, although the creations themselves are nonmagical.',
  )
  .withSupportedGameSystem(GameSystemType.DND5E)
  .withFabricator(fabricator)
  .withEssence(new EssenceDefinition('Earth', 'Elemental earth, one of the fundamental forces of nature', 'mountain'))
  .withEssence(new EssenceDefinition('Water', 'Elemental water, one of the fundamental forces of nature', 'tint'))
  .withEssence(new EssenceDefinition('Air', 'Elemental air, one of the fundamental forces of nature', 'wind'))
  .withEssence(new EssenceDefinition('Fire', 'Elemental fire, one of the fundamental forces of nature', 'fire'))
  .withEssence(new EssenceDefinition('Positive Energy', 'Positive Energy - The essence of life and creation', 'sun'))
  .withEssence(
    new EssenceDefinition('Negative Energy', 'Negative Energy - The essence of death and destruction', 'moon'),
  )
  .build();

export { AlchemistsSuppliesSystemSpec };
