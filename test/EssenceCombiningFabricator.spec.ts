import {expect} from 'chai';

import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {EssenceCombiningFabricator} from "../src/scripts/core/Fabricator";
import {AlchemicalResult, EssenceCombiner} from "../src/scripts/core/EssenceCombiner";
import {ItemData5e} from "../src/global";
import {DefaultEssenceCombiner5E} from "../src/scripts/dnd5e/DefaultEssenceCombiner5E";
import {AlchemicalResult5E} from "../src/scripts/dnd5e/AlchemicalResult5E";
import {AlchemicalResultSet} from "../src/scripts/core/AlchemicalResultSet";

describe('Essence Combining Fabricator |', () => {

    const ironwoodHeart: CraftingComponent = CraftingComponent.builder()
        .withName('Ironwood Heart')
        .withCompendiumEntry('alchemists-supplies-v11', '345xyz')
        .withEssences(['EARTH', 'EARTH'])
        .build();
    const hydrathistle: CraftingComponent = CraftingComponent.builder()
        .withName('Hydrathistle')
        .withCompendiumEntry('alchemists-supplies-v11', '789xyz')
        .withEssences(['WATER', 'WATER'])
        .build();
    const voidroot: CraftingComponent = CraftingComponent.builder()
        .withName('Voidroot')
        .withCompendiumEntry('alchemists-supplies-v11', '891xyz')
        .withEssences(['NEGATIVE_ENERGY'])
        .build();

    const luminousCapDust: CraftingComponent = CraftingComponent.builder()
        .withName('Luminous Cap Dust')
        .withCompendiumEntry('alchemists-supplies-v11', 'a23xyz')
        .withEssences(['FIRE', 'AIR'])
        .build();
    const wispStalks: CraftingComponent = CraftingComponent.builder()
        .withName('Wisp Stalks')
        .withCompendiumEntry('alchemists-supplies-v11', 'a34xyz')
        .withEssences(['AIR', 'AIR'])
        .build();
    const fennelSilk: CraftingComponent = CraftingComponent.builder()
        .withName('Fennel Silk')
        .withCompendiumEntry('alchemists-supplies-v11', 'a45xyz')
        .withEssences(['FIRE'])
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


    const instantRope: CraftingComponent = CraftingComponent.builder()
        .withName('Instant Rope')
        .withCompendiumEntry('alchemists-supplies-v11', '234xyz')
        .build();
    const acid: CraftingComponent = CraftingComponent.builder()
        .withName('Acid')
        .withCompendiumEntry('alchemists-supplies-v11', '678xyz')
        .build();
    const flashbang: CraftingComponent = CraftingComponent.builder()
        .withName('Flashbang')
        .withCompendiumEntry('alchemists-supplies-v11', 'a12xyz')
        .build();

    const instantRopeRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Instant Rope')
        .withEntryId('123xyz')
        .withEssences(['EARTH', 'EARTH', 'WATER', 'WATER', 'NEGATIVE_ENERGY'])
        .withResult(CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withItem(instantRope)
            .build())
        .build();
    const acidRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Acid')
        .withEntryId('456xyz')
        .withEssences(['EARTH', 'FIRE', 'POSITIVE_ENERGY'])
        .withResult(CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withItem(acid)
            .build())
        .build();
    const flashbangRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Flashbang')
        .withEntryId('912xyz')
        .withEssences(['FIRE', 'AIR', 'AIR'])
        .withResult(CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withItem(flashbang)
            .build())
        .build();

    describe('Crafting |', () => {

        it('Should list craftable Recipes from Components', () => {

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>();
            const result: Recipe[] = underTest.filterCraftableRecipesFor([ironwoodHeart, hydrathistle, voidroot], [instantRopeRecipe, acidRecipe, flashbangRecipe]);

            expect(result, 'List of recipes was null!').to.exist;
            expect(result.length, 'Expected one craftable recipe').to.equal(1);
            const resultRecipe: Recipe = result[0];
            expect(resultRecipe.entryId, 'Expected Instant Rope to be the only craftable recipe').to.equal(instantRopeRecipe.entryId);

        });

        it('Should Fabricate from a Recipe that requires essences', () => {

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>();
            const result: CraftingResult[] = underTest.fabricateFromRecipe(instantRopeRecipe, [ironwoodHeart, hydrathistle, voidroot]);

            expect(result, 'Crafting Result of recipes was null!').to.exist;
            expect(result.length, 'Expected four Crafting Results').to.equal(4);
            expect(result).to.deep.include.members([
                CraftingResult.builder().withItem(voidroot).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(hydrathistle).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(ironwoodHeart).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(instantRope).withAction(ActionType.ADD).withQuantity(1).build()
            ]);

        });

        it('Should Fabricate from Components with no Recipe', () => {

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
                .withResultantItem(CraftingComponent.builder()
                    .withName('Alchemical Bomb')
                    .withImageUrl('systems/dnd5e/icons/items/inventory/bomb.jpg')
                    .withCompendiumEntry('fabricate.alchemists-supplies-v11', '90z9nOwmGnP4aUUk')
                    .withEssences([])
                    .build())
                .build();

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>(essenceCombiner);
            const results: CraftingResult[] = underTest.fabricateFromComponents([luminousCapDust, wrackwortBulbs, radiantSynthSeed]);

            const addResults = results.filter((craftingResult: CraftingResult) => craftingResult.action === ActionType.ADD);
            expect(addResults.length).to.equal(1);
            const addResult: CraftingResult = addResults[0];
            expect(addResult.item.compendiumEntry.compendiumKey).to.equal('fabricate.alchemists-supplies-v11');
            expect(addResult.item.compendiumEntry.entryId).to.equal('90z9nOwmGnP4aUUk');
            expect(addResult.quantity).to.equal(1);
            expect(addResult.action).to.equal(ActionType.ADD);

            const customItemData: ItemData5e = addResult.customData;

            expect(customItemData.description.value).to.include('<p>Release concentrated mist in all directions. Increase the radius of all effects by 5 feet.</p>');
            expect(customItemData.description.value).to.include('<p>Deal 1d8 acid damage on contact.</p>');
            expect(customItemData.description.value).to.include('<p>Roll double the number of all damage dice.</p>');
            expect(customItemData.target.value).to.equal(5);
            expect(customItemData.target.units).to.equal('ft');
            expect(customItemData.target.type).to.equal('radius');
            expect(customItemData.damage.parts.length).to.equal(1);
            expect(customItemData.damage.parts[0].length).to.equal(2);
            expect(customItemData.damage.parts[0][0]).to.equal('2d8');
            expect(customItemData.damage.parts[0][1]).to.equal('acid');
        });

        it('Should efficiently consume recipe components to reduce essence wastage', () => {

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>();

            const result: CraftingResult[] = underTest.fabricateFromRecipe(flashbangRecipe, [luminousCapDust, luminousCapDust, wispStalks, fennelSilk]);

            expect(result, 'Crafting Result of recipes was null!').to.exist;
            expect(result.length, 'Expected three Crafting Results').to.equal(3);
            expect(result).to.deep.include.members([
                CraftingResult.builder().withItem(wispStalks).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(fennelSilk).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(flashbang).withAction(ActionType.ADD).withQuantity(1).build()
            ]);
        });

    });

});