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
import {InventoryRegistry} from "../src/scripts/systems/InventoryRegistry";
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {Inventory} from "../src/scripts/core/Inventory";
import {InventoryRecord} from "../src/scripts/core/InventoryRecord";

describe('Crafting System |', () => {

    describe('Create |', () => {

        it('Should create a Crafting System', () => {

            let mockFabricator = <Fabricator>{
                fabricateFromComponents(): CraftingResult[] {
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
                    .withEntryId('4iHqWSLTMFjPbpuI')
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withComponentType(CraftingComponent.builder()
                            .withName('Mud')
                            .withCompendiumEntry(compendiumKey, 'tCmAnq9zcESt0ULf')
                            .build())
                        .build())
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withComponentType(CraftingComponent.builder()
                            .withName('Sticks')
                            .withCompendiumEntry(compendiumKey, 'arWeEYkLkubimBz3')
                            .build())
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withItem(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withCompendiumEntry(compendiumKey, 'nWhTa8gD1QL1f9O3')
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
                {
                    _name: 'Recipe: Mud Pie',
                    _entryId: '4iHqWSLTMFjPbpuI',
                    _essences: new Map(),
                    _ingredients: [
                        { _componentType: { _name: 'Mud', _essences: [], _compendiumEntry: { _compendiumKey: 'fabricate.fabricate-test', _entryId: 'tCmAnq9zcESt0ULf' } }, _quantity: 2, _consumed: true },
                        { _componentType: { _name: 'Sticks', _essences: [], _compendiumEntry: { _compendiumKey: 'fabricate.fabricate-test', _entryId: 'arWeEYkLkubimBz3' } }, _quantity: 1, _consumed: true }
                    ],
                    _results: [
                        { _action: 'ADD', _item: { _name: 'Mud Pie', _essences: [], "_compendiumEntry": { _compendiumKey: 'fabricate.fabricate-test', _entryId: 'nWhTa8gD1QL1f9O3' } }, _quantity : 1 }
                    ],
                }
            ]);
        });

        it('Should craft a recipe using the System\'s Fabricator', async () => {

            let mockFabricator = <Fabricator>{
                fabricateFromComponents(): CraftingResult[] {
                    return [];
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
                .withComponentType(CraftingComponent.builder()
                    .withName('Mud')
                    .withCompendiumEntry(compendiumKey, 'tCmAnq9zcESt0ULf')
                    .build())
                .build();
            const oneStick = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withComponentType(CraftingComponent.builder()
                    .withName('Sticks')
                    .withCompendiumEntry(compendiumKey, 'arWeEYkLkubimBz3')
                    .build())
                .build();
            const mudPie = CraftingResult.builder()
                .withAction(ActionType.ADD)
                .withQuantity(1)
                .withItem(CraftingComponent.builder()
                    .withName('Mud Pie')
                    .withCompendiumEntry(compendiumKey, 'nWhTa8gD1QL1f9O3')
                    .build())
                .build();

            const mudPieRecipe = Recipe.builder()
                .withName('Recipe: Mud Pie')
                .withEntryId('4iHqWSLTMFjPbpuI')
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
                remove: Sinon.stub()
            }
            // @ts-ignore
            mockInventory.contains.withArgs(twoMud).returns(true);
            // @ts-ignore
            mockInventory.contains.withArgs(oneStick).returns(true);
            // @ts-ignore
            mockInventory.add.withArgs(mudPie).returns(InventoryRecord.builder()
                .withCraftingComponent(mudPie.item)
                .withQuantity(mudPie.quantity)
                .withActor(mockActor)
                .build());
            // @ts-ignore
            mockInventory.remove.returns(true);

            const removeOneStick = CraftingResult.builder()
                .withItem(oneStick.componentType)
                .withQuantity(oneStick.quantity)
                .withAction(ActionType.REMOVE)
                .build();
            const removeTwoMud = CraftingResult.builder()
                .withItem(twoMud.componentType)
                .withQuantity(twoMud.quantity)
                .withAction(ActionType.REMOVE)
                .build();
            Sinon.stub(mockFabricator, 'fabricateFromRecipe').returns([removeOneStick, removeTwoMud, mudPie]);

            InventoryRegistry.addFor(mockActor.id, mockInventory);

            const craftingResults = await testSystem.craft(mockActor.id, mudPieRecipe.entryId);
            expect(craftingResults.length).to.equal(3);
            expect(craftingResults).to.contain.members([removeOneStick, removeTwoMud, mudPie]);

        })

    });

});