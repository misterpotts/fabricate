import {expect} from 'chai';

import {AlchemicalResult} from "../src/scripts/core/AlchemicalResult";
import {DefaultEssenceCombiner5E} from "../src/scripts/dnd5e/DefaultEssenceCombiner5E";
import {AlchemicalResultSet} from "../src/scripts/core/AlchemicalResultSet";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {AlchemicalResult5E} from "../src/scripts/dnd5e/AlchemicalResult5E";
import {ItemData5e} from "../src/global";

describe('Default Essence Combiner 5E |', () => {

    const luminousCapDust: CraftingComponent = CraftingComponent.builder()
        .withName('Luminous Cap Dust')
        .withCompendiumEntry('alchemists-supplies-v11', 'a23xyz')
        .withEssences(['FIRE', 'AIR'])
        .build();
    const wrackwortBulbs: CraftingComponent = CraftingComponent.builder()
        .withName('Wrackwort Bulbs')
        .withCompendiumEntry('alchemists-supplies-v11', 'a56xyz')
        .withEssences(['EARTH', 'FIRE'])
        .build();
    const radiantSynthSeed: CraftingComponent = CraftingComponent.builder()
        .withName('Radiant Synthseed')
        .withCompendiumEntry('alchemists-supplies-v11', 'a67xyz')
        .withEssences(['POSITIVE_ENERGY'])
        .build();

    describe('Alchemical Result Combination |', () => {

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

        it('Should produce a valid result for a combination', () => {

            const underTest = DefaultEssenceCombiner5E.builder()
                .withKnownAlchemicalResults(knownAlchemicalResults)
                .withMaxComponents(6)
                .withMaxEssences(6)
                .build();

            const result: AlchemicalResult<ItemData5e> = underTest.combine([luminousCapDust, wrackwortBulbs, radiantSynthSeed]);
            expect(result).to.exist;
            expect(result.description).to.contain('Release concentrated mist in all directions. Increase the radius of all effects by 5 feet.');
            expect(result.description).to.contain('Deal 1d8 acid damage on contact.');
            expect(result.description).to.contain('Roll double the number of all damage dice.');
            expect(result.effects.length).to.equal(2);
            expect(result.effects).to.deep.include({method: 'ROLLED', type: 'acid', die: { faces: 8, amount: 1}, 'amount': undefined, 'bonus': undefined});
            expect(result.effects).to.deep.include({units: 'none', value: 1, type: 'creature'});
            expect(result.effectModifiers.length).to.equal(2);
            expect(result.effectModifiers).to.deep.include({mode: 'ADD', amount: 5, areaType: 'radius'});
            expect(result.effectModifiers).to.deep.include({mode: 'MULTIPLY', amount: 2});
            const itemData5e = result.asItemData();
            expect(itemData5e).to.exist;
            expect(itemData5e.description).to.contain('Release concentrated mist in all directions. Increase the radius of all effects by 5 feet.');
            expect(itemData5e.description).to.contain('Deal 1d8 acid damage on contact.');
            expect(itemData5e.description).to.contain('Roll double the number of all damage dice.');
            expect(itemData5e.target.value).to.equal(5);
            expect(itemData5e.target.units).to.equal('ft');
            expect(itemData5e.target.type).to.equal('radius');
            expect(itemData5e.damage.versatile).to.equal('');
            expect(itemData5e.damage.parts.length).to.equal(1);
            expect(itemData5e.damage.parts[0][0]).to.equal('2d8');
            expect(itemData5e.damage.parts[0][1]).to.equal('acid');
        });

    });

});