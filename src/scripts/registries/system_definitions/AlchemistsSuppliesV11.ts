import {AlchemicalResult} from "../../core/AlchemicalResult";
import {ItemData5e} from "../../../global";
import {AlchemicalResult5E} from "../../dnd5e/AlchemicalResult5E";
import {AlchemicalResultSet} from "../../core/AlchemicalResultSet";
import {EssenceCombiner} from "../../core/EssenceCombiner";
import {DefaultEssenceCombiner5E} from "../../dnd5e/DefaultEssenceCombiner5E";
import {EssenceCombiningFabricator} from "../../core/Fabricator";
import {CraftingSystem} from "../../core/CraftingSystem";
import {GameSystemType} from "../../core/GameSystemType";

const blinding: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['EARTH', 'EARTH'])
    .withDescription('Release a burst of stinging dust. Affected ' +
        'targets are blinded for the next round.')
    .build();

const prone: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['WATER', 'WATER'])
    .withDescription('Release a puddle of slippery oil. Affected ' +
        'targets immediately fall prone.')
    .build();

const lightning: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['AIR', 'AIR'])
    .withDescription('Deal 1d4 lightning damage on contact. ' +
        'Double damage to targets touching a metal ' +
        'surface or using metal weapons or armor.')
    .withRolledDamage({faces: 4, amount: 1}, 'lightning')
    .withTarget('none', 1, 'creature')
    .build();

const fire: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['FIRE', 'FIRE'])
    .withDescription('Deal 1d4 fire damage on contact. Double ' +
        'damage to targets with cloth or leather armor.')
    .withRolledDamage({faces: 4, amount: 1}, 'fire')
    .withTarget('none', 1, 'creature')
    .build();

const gel: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['EARTH', 'WATER'])
    .withDescription('Release gel that sticks to targets. Each round,' +
        'any damage-dealing effects continue to deal 1 ' +
        'damage each until an action is used to remove ' +
        'the gel with a DC 10 Dexterity check.')
    .withFixedDamage(1, 'none')
    .withSavingThrow('dex', 10, 'flat')
    .withDuration('special')
    .build();

const slow: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['WATER', 'AIR'])
    .withDescription('Deal 1d4 cold damage on contact. Reduce ' +
        'target speed by 10 feet for the next round.')
    .withRolledDamage({faces: 4, amount: 1}, 'cold')
    .withTarget('none', 1, 'creature')
    .build();

const spray: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['AIR', 'FIRE'])
    .withDescription('Release concentrated mist in all directions. ' +
        'Increase the radius of all effects by 5 feet.')
    .withAoEExtender('ADD', 5, 'radius')
    .build();

const acid: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['FIRE', 'EARTH'])
    .withDescription('Deal 1d8 acid damage on contact.')
    .withRolledDamage({faces: 8, amount: 1}, 'acid')
    .withTarget('none', 1, 'creature')
    .build();

const doubleDamageDie: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['POSITIVE_ENERGY'])
    .withDescription('Roll double the number of all damage dice.')
    .withDamageModifier('MULTIPLY',2)
    .build();

const increaseDC: AlchemicalResult<ItemData5e> = AlchemicalResult5E.builder()
    .withEssenceCombination(['NEGATIVE_ENERGY'])
    .withDescription('Increase the DC to avoid bomb effects by 2.')
    .withSavingThrowModifier('ADD', 2)
    .build();

const knownAlchemicalResults: AlchemicalResultSet<ItemData5e> = AlchemicalResultSet.builder()
    .withResult(blinding)
    .withResult(prone)
    .withResult(lightning)
    .withResult(fire)
    .withResult(gel)
    .withResult(slow)
    .withResult(spray)
    .withResult(acid)
    .withResult(doubleDamageDie)
    .withResult(increaseDC)
    .build();

const essenceCombiner: EssenceCombiner<ItemData5e> = DefaultEssenceCombiner5E.builder()
    .withMaxComponents(6)
    .withMaxEssences(6)
    .withKnownAlchemicalResults(knownAlchemicalResults)
    .withResultantItem('fabricate.fabricate-test', 'xyz123')
    .build();

const fabricator: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>(essenceCombiner);

const AlchemistsSuppliesSystemSpec: CraftingSystem.Builder = CraftingSystem.builder()
    .withName('Alchemist\'s Supplies v1.1')
    .withCompendiumPackKey('fabricate.alchemists-supplies-v11')
    .withEnableHint('Enable the Alchemist\'s Supplies v1.1 crafting system by /u/calculusChild?')
    .withSupportedGameSystem(GameSystemType.DND5E)
    .withFabricator(fabricator);

export {AlchemistsSuppliesSystemSpec};