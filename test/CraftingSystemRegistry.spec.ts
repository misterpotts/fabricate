import {expect} from 'chai';
import * as Sinon from 'sinon';
import {Fabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import {FabricationAction} from "../src/scripts/core/FabricationAction";
import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingSystemRegistry} from "../src/scripts/registries/CraftingSystemRegistry";
import {SinonSandbox} from "sinon";

const Sandbox: SinonSandbox = Sinon.createSandbox();

describe('Crafting System Registry |', () => {

    describe('Register and Retrieve |', () => {

        const mockFabricator = <Fabricator><unknown>{
            fabricateFromComponents: Sandbox.stub(),
            fabricateFromRecipe: Sandbox.stub()
        };
        // @ts-ignore
        mockFabricator.fabricateFromRecipe.returns({});

        const testSystemCompendiumKey = 'fabricate.fabricate-test';
        const mudPieRecipeId = '4iHqWSLTMFjPbpuI';
        const testSystemName = 'Test System';
        const testSystem = CraftingSystem.builder()
                .withName(testSystemName)
                .withCompendiumPackKey(testSystemCompendiumKey)
                .withSupportedGameSystem('dnd5e')
                .withFabricator(mockFabricator)
                .withRecipe(Recipe.builder()
                    .withName('Recipe: Mud Pie')
                    .withPartId(mudPieRecipeId)
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withComponent(CraftingComponent.builder()
                            .withName('Mud')
                            .withPartId('tCmAnq9zcESt0ULf')
                            .withSystemId(testSystemCompendiumKey)
                            .build())
                        .build())
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withComponent(CraftingComponent.builder()
                            .withName('Sticks')
                            .withPartId('arWeEYkLkubimBz3')
                            .withSystemId(testSystemCompendiumKey)
                            .build())
                        .build())
                    .withResult(FabricationAction.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withComponent(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withPartId('nWhTa8gD1QL1f9O3')
                            .withSystemId(testSystemCompendiumKey)
                            .build())
                        .build())
                    .build())
                .build();

        it('Should register a Crafting System and retrieve by Recipe ID', () => {

            const craftingSystemRegistry = new CraftingSystemRegistry();
            craftingSystemRegistry.register(testSystem);
            const testSystemRef = craftingSystemRegistry.getSystemByPartId(mudPieRecipeId);
            expect(testSystemRef.compendiumPackKey).to.equal(testSystemCompendiumKey);
            expect(testSystem.recipes.length).to.equal(1);

        });


        it('Should register a Crafting System and retrieve by Compendium Key', () => {

            Sandbox.reset();
            Sandbox.restore();

            const craftingSystemRegistry = new CraftingSystemRegistry();
            craftingSystemRegistry.register(testSystem);
            const testSystemRef = craftingSystemRegistry.getSystemByCompendiumPackKey(testSystemCompendiumKey);
            expect(testSystemRef.name).to.equal(testSystemName);
            expect(testSystem.recipes.length).to.equal(1);

        });

    });
});