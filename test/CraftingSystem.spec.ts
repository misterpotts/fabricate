import {expect} from 'chai';
import * as Sinon from 'sinon';

import {CraftingSystem, EssenceDefinition} from "../src/scripts/core/CraftingSystem";
import {Recipe} from "../src/scripts/core/Recipe";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {FabricationAction, FabricationActionType} from "../src/scripts/core/FabricationAction";
import {Fabricator} from "../src/scripts/core/Fabricator";
import {GameSystemType} from "../src/scripts/core/GameSystemType";
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {Inventory, InventoryModification} from "../src/scripts/game/Inventory";
import {InventoryRecord} from "../src/scripts/game/InventoryRecord";
import {FabricationOutcome, OutcomeType} from "../src/scripts/core/FabricationOutcome";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

before(() => {
    // @ts-ignore
    global.renderTemplate = (templatePath: string, data: any) => '';
    // @ts-ignore
    global.ChatMessage = {
        create: Sandbox.stub()
    };
    // @ts-ignore
    global.game = Sandbox.stub();
});

beforeEach(() => {
    Sandbox.restore();
});

describe('Crafting System |', () => {

    describe('Create |', () => {

        it('Should create a Crafting System', () => {

            const mockFabricator = <Fabricator<{}>><unknown>{
                fabricateFromComponents: Sandbox.stub(),
                fabricateFromRecipe: Sandbox.stub()
            };
            // @ts-ignore
            mockFabricator.fabricateFromRecipe.returns({});

            let compendiumKey = 'fabricate.fabricate-test';
            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey(compendiumKey)
                .withEssence(new EssenceDefinition('Earth', 'Elemental earth, one of the fundamental forces of nature', 'mountain'))
                .withEssence(new EssenceDefinition('Water', 'Elemental water, one of the fundamental forces of nature', 'tint'))
                .withEssence(new EssenceDefinition('Air', 'Elemental air, one of the fundamental forces of nature', 'wind'))
                .withEssence(new EssenceDefinition('Fire', 'Elemental fire, one of the fundamental forces of nature', 'fire'))
                .withEssence(new EssenceDefinition('Positive Energy', 'The essence of life and creation', 'sun'))
                .withEssence(new EssenceDefinition('Negative Energy', 'The essence of death and destruction', 'moon'))
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
                    .withResult(FabricationAction.builder()
                        .withActionType(FabricationActionType.ADD)
                        .withQuantity(1)
                        .withItemType(CraftingComponent.builder()
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
                    .withResult(FabricationAction.builder()
                        .withActionType(FabricationActionType.ADD)
                        .withQuantity(1)
                        .withItemType(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withPartId('nWhTa8gD1QL1f9O3')
                            .withSystemId('fabricate.fabricate-test')
                            .build())
                        .build())
                    .build()
            ]);
            expect(testSystem.essences).to.deep.include.members([
                new EssenceDefinition('Earth', 'Elemental earth, one of the fundamental forces of nature', 'mountain'),
                new EssenceDefinition('Water', 'Elemental water, one of the fundamental forces of nature', 'tint'),
                new EssenceDefinition('Air', 'Elemental air, one of the fundamental forces of nature', 'wind'),
                new EssenceDefinition('Fire', 'Elemental fire, one of the fundamental forces of nature', 'fire'),
                new EssenceDefinition('Positive Energy', 'The essence of life and creation', 'sun'),
                new EssenceDefinition('Negative Energy', 'The essence of death and destruction', 'moon')
            ]);
        });

        it('Should craft a recipe using the System\'s Fabricator', async () => {

            let mockFabricator = <Fabricator<{}>><unknown>{
                fabricateFromComponents: Sandbox.stub(),
                fabricateFromRecipe: Sandbox.stub()
            };
            const mockSuccessOutcome = <FabricationOutcome><undefined>{
                description: '',
                actions: [],
                recipe: {},
                displayItems: [],
                type: OutcomeType.SUCCESS
            };
            // @ts-ignore
            mockFabricator.fabricateFromComponents.returns(mockSuccessOutcome);
            // @ts-ignore
            mockFabricator.fabricateFromRecipe.returns(mockSuccessOutcome);

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
            const mudPie = FabricationAction.builder()
                .withActionType(FabricationActionType.ADD)
                .withQuantity(1)
                .withItemType(CraftingComponent.builder()
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
                containsIngredient: Sandbox.stub(),
                addComponent: Sandbox.stub(),
                removeComponent: Sandbox.stub()
            }

            // @ts-ignore
            mockInventory.containsIngredient.withArgs(twoMud).returns(true);
            // @ts-ignore
            mockInventory.containsIngredient.withArgs(oneStick).returns(true);
            const mockActor: Actor = <Actor><unknown>{};
            // @ts-ignore
            mockInventory.add.withArgs(mudPie).returns(InventoryRecord.builder()
                .withFabricateItem(mudPie.itemType)
                .withTotalQuantity(mudPie.quantity)
                .withActor(mockActor)
                .build());
            // @ts-ignore
            mockInventory.remove.returns(true);

            const removeOneStick = InventoryModification.builder<CraftingComponent>()
                .withUpdatedRecord(InventoryRecord.builder<CraftingComponent>()
                    .withFabricateItem(oneStick.component)
                    .build())
                .withQuantityChanged(oneStick.quantity)
                .withAction(FabricationActionType.REMOVE)
                .build();
            const removeTwoMud = InventoryModification.builder<CraftingComponent>()
                .withUpdatedRecord(InventoryRecord.builder<CraftingComponent>()
                    .withFabricateItem(twoMud.component)
                    .build())
                .withQuantityChanged(twoMud.quantity)
                .withAction(FabricationActionType.REMOVE)
                .build();
            const addMudPie = InventoryModification.builder<CraftingComponent>()
                .withUpdatedRecord(InventoryRecord.builder<CraftingComponent>()
                    .withFabricateItem(mudPie.itemType)
                    .build())
                .withQuantityChanged(mudPie.quantity)
                .withAction(FabricationActionType.ADD)
                .build();


            const outcome = FabricationOutcome.builder()
                .withOutcomeType(OutcomeType.SUCCESS)
                .withRecipe(mudPieRecipe)
                .withActions([removeOneStick, removeTwoMud, addMudPie])
                .build();
            // @ts-ignore
            mockFabricator.fabricateFromRecipe.returns(outcome);

            const fabricationOutcome: FabricationOutcome = await testSystem.craft(mockActor, mockInventory, mudPieRecipe);
            expect(fabricationOutcome.actions.length).to.equal(3);
            expect(fabricationOutcome.actions).to.contain.members([removeOneStick, removeTwoMud, addMudPie]);

        })

    });

});