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
import {Inventory} from "../src/scripts/game/Inventory";
import {InventoryRecord} from "../src/scripts/game/InventoryRecord";
import {FabricationOutcome, OutcomeType} from "../src/scripts/core/FabricationOutcome";
import {AlchemicalEffect5E} from "../src/scripts/core/AlchemicalEffect";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

before(() => {
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

            const mockFabricator = <Fabricator><unknown>{
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
                        .withAction(FabricationActionType.ADD)
                        .withQuantity(1)
                        .withComponent(CraftingComponent.builder()
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
                        .withAction(FabricationActionType.ADD)
                        .withQuantity(1)
                        .withComponent(CraftingComponent.builder()
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
            expect(testSystem.alchemicalEffects).to.deep.include.members([
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['earth', 'earth'])
                    .withCondition('blinded')
                    .withDescription('Release a burst of stinging dust. Affected targets are blinded for the next round. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['water', 'water'])
                    .withCondition('prone')
                    .withDescription('Release a puddle of slippery oil. Affected targets immediately fall prone. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['air', 'air'])
                    .withDamage('1d4', 'lightning')
                    .withDescription('Deal 1d4 lightning damage on contact. Double damage to targets touching a metal surface or ' +
                        'using metal weapons or armor. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['fire', 'fire'])
                    .withDamage('1d4', 'fire')
                    .withDescription('Deal 1d4 fire damage on contact. Double damage to targets with cloth or leather armor. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['earth', 'water'])
                    .withDescription('Release gel that sticks to targets. Each round, any damage-dealing effects continue to ' +
                        'deal 1 damage each until an action is used to remove the gel with a DC 10 Dexterity check .')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['water', 'air'])
                    .withDamage('1d4', 'cold')
                    .withDescription('Deal 1d4 cold damage on contact. Reduce target speed by 10 feet for the next round. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['air', 'fire'])
                    .withAoeExtension(5, 'ft')
                    .withDescription('Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['fire', 'earth'])
                    .withDamage('1d8', 'acid')
                    .withDescription('Deal 1d8 acid damage on contact. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['positive-energy'])
                    .withDiceMultiplier(2)
                    .withDescription('Roll double the number of all damage dice. ')
                    .build(),
                AlchemicalEffect5E.builder()
                    .withEssenceCombination(['negative-energy'])
                    .withSavingThrowModifier(2)
                    .withDescription('Increase the DC to avoid bomb effects by 2. ')
                    .build()
            ]);
        });

        it('Should craft a recipe using the System\'s Fabricator', async () => {

            let mockFabricator = <Fabricator>{
                fabricateFromComponents: Sandbox.stub(),
                fabricateFromRecipe: Sandbox.stub()
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
            const mudPie = FabricationAction.builder()
                .withAction(FabricationActionType.ADD)
                .withQuantity(1)
                .withComponent(CraftingComponent.builder()
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
                removeComponent: Sandbox.stub(),
                denormalizedContainedComponents: Sandbox.stub()
            }

            // @ts-ignore
            mockInventory.containsIngredient.withArgs(twoMud).returns(true);
            // @ts-ignore
            mockInventory.containsIngredient.withArgs(oneStick).returns(true);
            const mockActor: Actor = <Actor><unknown>{};
            // @ts-ignore
            mockInventory.addComponent.withArgs(mudPie).returns(InventoryRecord.builder()
                .withFabricateItem(mudPie.component)
                .withTotalQuantity(mudPie.quantity)
                .withActor(mockActor)
                .build());
            // @ts-ignore
            mockInventory.removeComponent.returns(true);
            // @ts-ignore
            mockInventory.denormalizedContainedComponents.returns([]);

            const removeOneStick = FabricationAction.builder()
                .withComponent(oneStick.component)
                .withQuantity(oneStick.quantity)
                .withAction(FabricationActionType.REMOVE)
                .build();
            const removeTwoMud = FabricationAction.builder()
                .withComponent(twoMud.component)
                .withQuantity(twoMud.quantity)
                .withAction(FabricationActionType.REMOVE)
                .build();

            const outcome = FabricationOutcome.builder()
                .withOutcomeType(OutcomeType.SUCCESS)
                .withRecipe(mudPieRecipe)
                .withActions([removeOneStick, removeTwoMud, mudPie])
                .withDisplayItems([])
                .build();
            // @ts-ignore
            mockFabricator.fabricateFromRecipe.returns(outcome);

            const fabricationOutcome: FabricationOutcome = await testSystem.craft(mockActor, mockInventory, mudPieRecipe);
            expect(fabricationOutcome.actions.length).to.equal(3);
            expect(fabricationOutcome.actions).to.contain.members([removeOneStick, removeTwoMud, mudPie]);

        })

    });

});