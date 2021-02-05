import {expect} from 'chai';
import * as Sinon from 'sinon';

import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {EssenceCombiningFabricator} from "../src/scripts/core/Fabricator";
import {Inventory} from "../src/scripts/core/Inventory";

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

    const instantRope: CraftingComponent = CraftingComponent.builder()
        .withName('Instant Rope')
        .withCompendiumEntry('alchemists-supplies-v11', '234xyz')
        .build();
    const acid: CraftingComponent = CraftingComponent.builder()
        .withName('Acid')
        .withCompendiumEntry('alchemists-supplies-v11', '678xyz')
        .build();

    const instantRopeRecipe:Recipe = Recipe.builder()
        .withName('Recipe: Instant Rope')
        .withEntryId('123xyz')
        .withEssences(['EARTH', 'EARTH', 'WATER', 'WATER', 'NEGATIVE_ENERGY'])
        .withResult(CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withItem(instantRope)
            .build())
        .build();
    const acidRecipe:Recipe = Recipe.builder()
        .withName('Recipe:Acid')
        .withEntryId('456xyz')
        .withEssences(['EARTH', 'FIRE', 'POSITIVE_ENERGY'])
        .withResult(CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withItem(acid)
            .build())
        .build();

    describe('Crafting |', () => {

        it('Should list craftable Recipes from Components', () => {

            const mockInventory: Inventory = <Inventory><unknown>{};

            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator([instantRopeRecipe, acidRecipe], mockInventory);
            const result: Recipe[] = underTest.listCraftableRecipes([ironwoodHeart, hydrathistle, voidroot]);

            expect(result, 'List of recipes was null!').to.exist;
            expect(result.length, 'Expected one craftable recipe').to.equal(1);
            const resultRecipe: Recipe = result[0];
            expect(resultRecipe.entryId, 'Expected Instant Rope to be the only craftable recipe').to.equal(instantRopeRecipe.entryId);

        });

        it('Should list craftable Recipes from Components from Inventory contents', () => {

            const mockInventory: Inventory = <Inventory><unknown>{
                denormalizedContents: Sinon.stub()
            };
            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator([instantRopeRecipe, acidRecipe], mockInventory);
            // @ts-ignore
            mockInventory.denormalizedContents.returns([ironwoodHeart, hydrathistle, voidroot]);
            const result: Recipe[] = underTest.listCraftableRecipes();

            expect(result, 'List of recipes was null!').to.exist;
            expect(result.length, 'Expected one craftable recipe').to.equal(1);
            const resultRecipe: Recipe = result[0];
            expect(resultRecipe.entryId, 'Expected Instant Rope to be the only craftable recipe').to.equal(instantRopeRecipe.entryId);

        });

        it('Should not Fabricate from an unknown Recipe', () => {

            const mockInventory: Inventory = <Inventory><unknown>{};

            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator([instantRopeRecipe], mockInventory);
            expect(() => underTest.fabricateFromRecipe(acidRecipe)).to.throw(`Recipe ${acidRecipe.entryId} is not known and cannot be crafted. `);

        });

        it('Should Fabricate from a Recipe that requires essences', () => {

            const mockInventory: Inventory = <Inventory><unknown>{
                denormalizedContents: Sinon.stub()
            };
            const underTest: EssenceCombiningFabricator = new EssenceCombiningFabricator([instantRopeRecipe, acidRecipe], mockInventory);
            // @ts-ignore
            mockInventory.denormalizedContents.returns([ironwoodHeart, hydrathistle, voidroot]);

            const result: CraftingResult[] = underTest.fabricateFromRecipe(instantRopeRecipe);

            expect(result, 'Crafting Result of recipes was null!').to.exist;
            expect(result.length, 'Expected four Crafting Results').to.equal(4);
            expect(result).to.deep.include.members([
                CraftingResult.builder().withItem(voidroot).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(hydrathistle).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(ironwoodHeart).withAction(ActionType.REMOVE).withQuantity(1).build(),
                CraftingResult.builder().withItem(instantRope).withAction(ActionType.ADD).withQuantity(1).build()
            ]);

        });

        it('Should Fabricate from Components with no Recipe', () => {});

        it('Should efficiently consume recipe components to reduce essence wastage', () => {

        });

    });

});