import {expect} from 'chai';
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {AlchemicalEffect5E} from "../src/scripts/core/AlchemicalEffect";
import {EssenceCombiner5e} from "../src/scripts/dnd5e/EssenceCombiner5e";



describe('Default Essence Combiner 5E |', () => {

    const luminousCapDust: CraftingComponent = CraftingComponent.builder()
        .withName('Luminous Cap Dust')
        .withPartId('a23xyz')
        .withSystemId('alchemists-supplies-v11')
        .withEssences(['FIRE', 'AIR'])
        .build();
    const wrackwortBulbs: CraftingComponent = CraftingComponent.builder()
        .withName('Wrackwort Bulbs')
        .withPartId('a56xyz')
        .withSystemId('alchemists-supplies-v11')
        .withEssences(['EARTH', 'FIRE'])
        .build();
    const radiantSynthSeed: CraftingComponent = CraftingComponent.builder()
        .withName('Radiant Synthseed')
        .withPartId('a67xyz')
        .withSystemId('alchemists-supplies-v11')
        .withEssences(['POSITIVE_ENERGY'])
        .build();

    describe('Alchemical Result Combination |', () => {

        const underTest: EssenceCombiner5e = EssenceCombiner5e.builder()
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['earth', 'earth'])
                .withCondition('blinded')
                .withDescription('Release a burst of stinging dust. Affected targets are blinded for the next round. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['water', 'water'])
                .withCondition('prone')
                .withDescription('Release a puddle of slippery oil. Affected targets immediately fall prone. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['air', 'air'])
                .withDamage('1d4', 'lightning')
                .withDescription('Deal 1d4 lightning damage on contact. Double damage to targets touching a metal surface or ' +
                    'using metal weapons or armor. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['fire', 'fire'])
                .withDamage('1d4', 'fire')
                .withDescription('Deal 1d4 fire damage on contact. Double damage to targets with cloth or leather armor. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['earth', 'water'])
                .withDescription('Release gel that sticks to targets. Each round, any damage-dealing effects continue to ' +
                    'deal 1 damage each until an action is used to remove the gel with a DC 10 Dexterity check .')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['water', 'air'])
                .withDamage('1d4', 'cold')
                .withDescription('Deal 1d4 cold damage on contact. Reduce target speed by 10 feet for the next round. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['air', 'fire'])
                .withAoeExtension(5, 'ft')
                .withDescription('Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['fire', 'earth'])
                .withDamage('1d8', 'acid')
                .withDescription('Deal 1d8 acid damage on contact. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['positive-energy'])
                .withDiceMultiplier(2)
                .withDescription('Roll double the number of all damage dice. ')
                .build())
            .withAlchemicalEffect(AlchemicalEffect5E.builder()
                .withEssenceCombination(['negative-energy'])
                .withSavingThrowModifier(2)
                .withDescription('Increase the DC to avoid bomb effects by 2. ')
                .build())
            .build();

        it('Should produce a valid result for a combination', () => {

            const underTest = EssenceCombiner5E.builder()
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
            expect(itemData5e.description.value).to.contain('Release concentrated mist in all directions. Increase the radius of all effects by 5 feet.');
            expect(itemData5e.description.value).to.contain('Deal 1d8 acid damage on contact.');
            expect(itemData5e.description.value).to.contain('Roll double the number of all damage dice.');
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