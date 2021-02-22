import {expect} from 'chai';
import * as Sinon from 'sinon';

import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Recipe} from "../src/scripts/core/Recipe";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {ActionType} from "../src/scripts/core/ActionType";
import {Fabricator} from "../src/scripts/core/Fabricator";
import {GameSystemType} from "../src/scripts/core/GameSystemType";
import {InventoryRegistry} from "../src/scripts/registries/InventoryRegistry";
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {Inventory} from "../src/scripts/game/Inventory";
import {InventoryRecord} from "../src/scripts/game/InventoryRecord";

describe('Crafting System |', () => {

    describe('Create |', () => {

        it('Should create a Crafting System', () => {

            let mockFabricator = <Fabricator>{
                fabricateFromComponents(): CraftingResult[] {
                    // @ts-ignore
                    return [];
                },
                // @ts-ignore
                fabricateFromRecipe(recipe: Recipe): CraftingResult[] {
                    return [];
                }
            };
            Sinon.stub(mockFabricator, "fabricateFromRecipe").returns([]);

            let compendiumKey = 'fabricate.fabricate-test';
            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey(compendiumKey)
                .withSupportedGameSystem(GameSystemType.DND5E)
                .withFabricator(mockFabricator)
                .withRecipe(Recipe.builder()
                    .withName('Recipe: Mud Pie')
                    .withPartId('4iHqWSLTMFjPbpuI')
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withComponent(CraftingComponent.builder()
                            .withName('Mud')
                            .withPartId('tCmAnq9zcESt0ULf')
                            .withSystemId(compendiumKey)
                            .build())
                        .build())
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withComponent(CraftingComponent.builder()
                            .withName('Sticks')
                            .withPartId('arWeEYkLkubimBz3')
                            .withSystemId(compendiumKey)
                            .build())
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withItem(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withPartId('nWhTa8gD1QL1f9O3')
                            .withSystemId(compendiumKey)
                            .build())
                        .build())
                    .build())
                .build();

            expect(testSystem.name).to.equal('Test System');
            expect(testSystem.compendiumPackKey).to.equal('fabricate.fabricate-test');
            expect(testSystem.supportedGameSystems).to.contain('dnd5e');
            expect(testSystem.supports(GameSystemType.DND5E)).to.be.true;
            expect(testSystem.recipes.length).to.equal(1);
            expect(testSystem.recipes).to.deep.include.members([
                Recipe.builder()
                    .withName('Recipe: Mud Pie')
                    .withPartId('4iHqWSLTMFjPbpuI')
                    .withIngredient(Ingredient.builder()
                        .withComponent(CraftingComponent.builder()
                            .withName('Mud')
                            .withSystemId('fabricate.fabricate-test')
                            .withPartId('tCmAnq9zcESt0ULf')
                            .build())
                        .withQuantity(2)
                        .isConsumed(true)
                        .build())
                    .withIngredient(Ingredient.builder()
                        .withComponent(CraftingComponent.builder()
                            .withName('Sticks')
                            .withPartId('arWeEYkLkubimBz3')
                            .withSystemId('fabricate.fabricate-test')
                            .build())
                        .withQuantity(1)
                        .isConsumed(true)
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withItem(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withPartId('nWhTa8gD1QL1f9O3')
                            .withSystemId('fabricate.fabricate-test')
                            .build())
                        .build())
                    .build()
            ]);
        });

        it('Should craft a recipe using the System\'s Fabricator', async () => {

            let mockFabricator = <Fabricator>{
                fabricateFromComponents(): CraftingResult[] {
                    // @ts-ignore
                    return []
                },
                // @ts-ignore
                fabricateFromRecipe(recipe: Recipe): CraftingResult[] {
                    return [];
                }
            };

            const mockActor = <Actor><unknown>{
                id: 'lxQTQkhiymhGyjzx'
            };

            let compendiumKey = 'fabricate.fabricate-test';
            const twoMud = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(2)
                .withComponent(CraftingComponent.builder()
                    .withName('Mud')
                    .withPartId('tCmAnq9zcESt0ULf')
                    .withSystemId(compendiumKey)
                    .build())
                .build();
            const oneStick = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withComponent(CraftingComponent.builder()
                    .withName('Sticks')
                    .withPartId('arWeEYkLkubimBz3')
                    .withSystemId(compendiumKey)
                    .build())
                .build();
            const mudPie = CraftingResult.builder()
                .withAction(ActionType.ADD)
                .withQuantity(1)
                .withItem(CraftingComponent.builder()
                    .withName('Mud Pie')
                    .withPartId('nWhTa8gD1QL1f9O3')
                    .withSystemId(compendiumKey)
                    .build())
                .build();

            const mudPieRecipe = Recipe.builder()
                .withName('Recipe: Mud Pie')
                .withPartId('4iHqWSLTMFjPbpuI')
                .withIngredient(twoMud)
                .withIngredient(oneStick)
                .withResult(mudPie)
                .build();

            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey(compendiumKey)
                .withSupportedGameSystem(GameSystemType.DND5E)
                .withFabricator(mockFabricator)
                .withRecipe(mudPieRecipe)
                .build();

            const mockInventory: Inventory = <Inventory5E><unknown>{
                contains: Sinon.stub(),
                add: Sinon.stub(),
                remove: Sinon.stub(),
                denormalizedContainedComponents: Sinon.stub()
            }
            // @ts-ignore
            mockInventory.contains.withArgs(twoMud).returns(true);
            // @ts-ignore
            mockInventory.contains.withArgs(oneStick).returns(true);
            // @ts-ignore
            mockInventory.add.withArgs(mudPie).returns(InventoryRecord.builder()
                .withFabricateItem(mudPie.item)
                .withTotalQuantity(mudPie.quantity)
                .withActor(mockActor)
                .build());
            // @ts-ignore
            mockInventory.remove.returns(true);
            // @ts-ignore
            mockInventory.denormalizedContainedComponents.returns([]);

            const removeOneStick = CraftingResult.builder()
                .withItem(oneStick.component)
                .withQuantity(oneStick.quantity)
                .withAction(ActionType.REMOVE)
                .build();
            const removeTwoMud = CraftingResult.builder()
                .withItem(twoMud.component)
                .withQuantity(twoMud.quantity)
                .withAction(ActionType.REMOVE)
                .build();
            Sinon.stub(mockFabricator, 'fabricateFromRecipe').returns([removeOneStick, removeTwoMud, mudPie]);

            InventoryRegistry.addFor(mockActor.id, mockInventory);

            const craftingResults = await testSystem.craft(mockActor.id, mudPieRecipe.partId);
            expect(craftingResults.length).to.equal(3);
            expect(craftingResults).to.contain.members([removeOneStick, removeTwoMud, mudPie]);

        })

    });

});