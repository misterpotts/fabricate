import {expect} from 'chai';

import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {EssenceCombiner, EssenceCombiningFabricator} from "../src/scripts/core/Fabricator";
import {AlchemicalBombEssenceCombiner} from "../src/scripts/systems/AlchemicalBombEssenceCombiner";

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

            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator();
            const result: Recipe[] = underTest.filterCraftableRecipesFor([ironwoodHeart, hydrathistle, voidroot], [instantRopeRecipe, acidRecipe, flashbangRecipe]);

            expect(result, 'List of recipes was null!').to.exist;
            expect(result.length, 'Expected one craftable recipe').to.equal(1);
            const resultRecipe: Recipe = result[0];
            expect(resultRecipe.entryId, 'Expected Instant Rope to be the only craftable recipe').to.equal(instantRopeRecipe.entryId);

        });

        it('Should Fabricate from a Recipe that requires essences', () => {

            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator();
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

            const essenceCombiner: EssenceCombiner = new AlchemicalBombEssenceCombiner();
            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator(essenceCombiner);

            const result: CraftingResult[] = underTest.fabricateFromComponents([luminousCapDust, wrackwortBulbs, radiantSynthSeed]);

            expect(result, 'Expected Crafting Results to be returned by "fabricateFromComponents"').to.exist;
            expect(result.length, 'Expected 1 Crafting Result from "fabricateFromComponents"').to.equal(1);

        });

        it('Should efficiently consume recipe components to reduce essence wastage', () => {

            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator();

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