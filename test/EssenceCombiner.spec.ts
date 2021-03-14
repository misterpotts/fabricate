import {expect} from 'chai';
import * as Sinon from 'sinon';

import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {EssenceCombiner} from "../src/scripts/core/EssenceCombiner";
import {
    AoeExtension5e,
    Condition5e,
    Damage5e,
    DiceMultiplier5e,
    SavingThrowModifier5e
} from "../src/scripts/dnd5e/AlchemicalEffect5E";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

before(() => {

    global.duplicate = (object: any) => object;

    // @ts-ignore
    global.DiceTerm = {
        fromExpression: Sandbox.stub()
    };
    const mock1D4DiceTerm = <DiceTerm><unknown>{
        number: 1,
        expression: '2d8'
    };
    // @ts-ignore
    global.DiceTerm.fromExpression.withArgs('1d8').returns(mock1D4DiceTerm);

});

describe('Default Essence Combiner 5E |', () => {

    const luminousCapDust: CraftingComponent = CraftingComponent.builder()
        .withName('Luminous Cap Dust')
        .withPartId('a23xyz')
        .withSystemId('alchemists-supplies-v11')
        .withEssences(['fire', 'air'])
        .build();
    const wrackwortBulbs: CraftingComponent = CraftingComponent.builder()
        .withName('Wrackwort Bulbs')
        .withPartId('a56xyz')
        .withSystemId('alchemists-supplies-v11')
        .withEssences(['earth', 'fire'])
        .build();
    const radiantSynthSeed: CraftingComponent = CraftingComponent.builder()
        .withName('Radiant Synthseed')
        .withPartId('a67xyz')
        .withSystemId('alchemists-supplies-v11')
        .withEssences(['positive-energy'])
        .build();

    describe('Alchemical Result Combination |', () => {

        const baseItemData: ItemData5e = require('./resources/alchemical-bomb-compendum-entry-itemData5e.json');

        const underTest: EssenceCombiner<ItemData5e> = EssenceCombiner.builder<ItemData5e>()
            .withAlchemicalEffect(new Condition5e(['earth', 'earth'],
                'Release a burst of stinging dust. Affected targets are blinded for the next round. '))
            .withAlchemicalEffect(new Condition5e(['water', 'water'],
                'Release a puddle of slippery oil. Affected targets immediately fall prone. '))
            .withAlchemicalEffect(new Damage5e(['air', 'air'],
                'Deal 1d4 lightning damage on contact. Double damage to targets touching a metal surface or using metal weapons or armor. ',
                {expression: '1d4', type: 'lightning'}))
            .withAlchemicalEffect(new Damage5e(['fire', 'fire'],
                'Deal 1d4 fire damage on contact. Double damage to targets with cloth or leather armor. ',
                {expression: '1d4', type: 'fire'}))
            .withAlchemicalEffect(new Condition5e(['earth', 'water'],
                'Release gel that sticks to targets. Each round, any damage-dealing effects continue to ' +
                    'deal 1 damage each until an action is used to remove the gel with a DC 10 Dexterity check .'))
            .withAlchemicalEffect(new Damage5e(['water', 'air'],
                'Deal 1d4 cold damage on contact. Reduce target speed by 10 feet for the next round. ',
                {expression: '1d4', type: 'cold'}))
            .withAlchemicalEffect(new AoeExtension5e(['air', 'fire'],
                'Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. ',
                {units: 'ft', value: 5}))
            .withAlchemicalEffect(new Damage5e(['fire', 'earth'],
                'Deal 1d8 acid damage on contact. ',
                {expression: '1d8', type: 'acid'}))
            .withAlchemicalEffect(new DiceMultiplier5e(['positive-energy'],
                'Roll double the number of all damage dice. ',
                2))
            .withAlchemicalEffect(new SavingThrowModifier5e(['negative-energy'],
                'Increase the DC to avoid bomb effects by 2. ',
                2))
            .build();

        it('Should produce a valid result for a combination', () => {

            const result: ItemData5e = underTest.combine([luminousCapDust, wrackwortBulbs, radiantSynthSeed], baseItemData);
            expect(result).to.exist;
            expect(result.description.value).to.include('<p>As a ranged attack, you can throw this device up to 20 feet, breaking it on impact and releasing the contents across a 5 foot area. The effects of alchemical bombs vary depending upon the ingredients used.</p>');
            expect(result.description.value).to.include('<p>Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. </p>');
            expect(result.description.value).to.include('<p>Deal 1d8 acid damage on contact. </p>');
            expect(result.description.value).to.include('<p>Roll double the number of all damage dice. </p>');
            expect(result.damage.parts).to.deep.include(['2d8', 'acid']);
            expect(result.target.value).to.equal(10);
            expect(result.target.units).to.equal('ft');
            expect(result.target.type).to.equal('radius');
        });

    });

});