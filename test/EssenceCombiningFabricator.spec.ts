import {expect} from 'chai';
import * as Sinon from "sinon";

import {Recipe} from "../src/scripts/core/Recipe";
import {FabricationAction} from "../src/scripts/core/FabricationAction";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {EssenceCombiningFabricator} from "../src/scripts/core/Fabricator";
import {AlchemicalResult, EssenceCombiner} from "../src/scripts/core/EssenceCombiner";
import {DefaultEssenceCombiner5E} from "../src/scripts/dnd5e/DefaultEssenceCombiner5E";
import {AlchemicalResult5E} from "../src/scripts/dnd5e/AlchemicalResult5E";
import {AlchemicalResultSet} from "../src/scripts/core/AlchemicalResultSet";
import {Inventory, InventoryModification} from "../src/scripts/game/Inventory";
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {FabricationOutcome, OutcomeType} from "../src/scripts/core/FabricationOutcome";
import {FabricateApplication} from "../src/scripts/application/FabricateApplication";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockActorId = 'lxQTQkhiymhGyjzx';
const mockActor = <Actor><unknown>{
    id: mockActorId
};

const mockInventory: Inventory = <Inventory5E><unknown>{
    containsIngredient: Sandbox.stub(),
    addComponent: Sandbox.stub(),
    removeComponent: Sandbox.stub(),
    denormalizedContainedComponents: Sandbox.stub()
}

beforeEach(() => {
    Sandbox.restore();
    // @ts-ignore
    global.fabricate = <FabricateApplication>{
        inventories: {
            getFor: Sandbox.stub()
        },
        systems: Sandbox.stub()
    };

    // @ts-ignore
    fabricate.inventories.getFor.withArgs(mockActorId).returns(mockInventory);
});

describe('Essence Combining Fabricator |', () => {

    /* =======================================================================
     * Consumed Components
     * ======================================================================= */

    const ironwoodHeart: CraftingComponent = CraftingComponent.builder()
        .withName('Ironwood Heart')
        .withPartId('345xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'EARTH'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(ironwoodHeart).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const hydrathistle: CraftingComponent = CraftingComponent.builder()
        .withName('Hydrathistle')
        .withPartId('789xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['WATER', 'WATER'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(hydrathistle).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const voidroot: CraftingComponent = CraftingComponent.builder()
        .withName('Voidroot')
        .withPartId('891xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['NEGATIVE_ENERGY'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(voidroot).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const luminousCapDust: CraftingComponent = CraftingComponent.builder()
        .withName('Luminous Cap Dust')
        .withPartId('a23xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['FIRE', 'AIR'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(luminousCapDust).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const wispStalks: CraftingComponent = CraftingComponent.builder()
        .withName('Wisp Stalks')
        .withPartId('a34xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['AIR', 'AIR'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(wispStalks).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const fennelSilk: CraftingComponent = CraftingComponent.builder()
        .withName('Fennel Silk')
        .withPartId('a45xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['FIRE'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(fennelSilk).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const wrackwortBulbs: CraftingComponent = CraftingComponent.builder()
        .withName('Wrackwort Bulbs')
        .withPartId('a56xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'FIRE'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(wrackwortBulbs).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    const radiantSynthSeed: CraftingComponent = CraftingComponent.builder()
        .withName('Radiant Synthseed')
        .withPartId('a67xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['POSITIVE_ENERGY'])
        .build();
    // @ts-ignore
    mockInventory.removeComponent.withArgs(radiantSynthSeed).returns(<InventoryModification<CraftingComponent>>{action: ActionType.REMOVE});

    /* =======================================================================
     * Recipe Results
     * ======================================================================= */

    const instantRope: CraftingComponent = CraftingComponent.builder()
        .withName('Instant Rope')
        .withPartId('234xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .build();
    // @ts-ignore
    mockInventory.addComponent.withArgs(instantRope).returns(<InventoryModification<CraftingComponent>>{action: ActionType.ADD});

    const acid: CraftingComponent = CraftingComponent.builder()
        .withName('Acid')
        .withPartId('678xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .build();
    // @ts-ignore
    mockInventory.addComponent.withArgs(acid).returns(<InventoryModification<CraftingComponent>>{action: ActionType.ADD});

    const flashbang: CraftingComponent = CraftingComponent.builder()
        .withName('Flashbang')
        .withPartId('a12xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .build();
    // @ts-ignore
    mockInventory.addComponent.withArgs(flashbang).returns(<InventoryModification<CraftingComponent>>{action: ActionType.ADD});

    /* =======================================================================
     * Recipes
     * ======================================================================= */

    const instantRopeRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Instant Rope')
        .withPartId('123xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'EARTH', 'WATER', 'WATER', 'NEGATIVE_ENERGY'])
        .withResult(FabricationAction.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withComponent(instantRope)
            .build())
        .build();
    const acidRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Acid')
        .withPartId('456xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'FIRE', 'POSITIVE_ENERGY'])
        .withResult(FabricationAction.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withComponent(acid)
            .build())
        .build();
    const flashbangRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Flashbang')
        .withPartId('912xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['FIRE', 'AIR', 'AIR'])
        .withResult(FabricationAction.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withComponent(flashbang)
            .build())
        .build();

    describe('Crafting |', () => {

        it('Should list craftable Recipes from Components', () => {

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>();
            const result: Recipe[] = underTest.filterCraftableRecipesFor([ironwoodHeart, hydrathistle, voidroot], [instantRopeRecipe, acidRecipe, flashbangRecipe]);

            expect(result, 'List of recipes was null!').to.exist;
            expect(result.length, 'Expected one craftable recipe').to.equal(1);
            const resultRecipe: Recipe = result[0];
            expect(resultRecipe.partId, 'Expected Instant Rope to be the only craftable recipe').to.equal(instantRopeRecipe.partId);

        });

        it('Should Fabricate from a Recipe that requires essences', async () => {

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>();

            // @ts-ignore
            mockInventory.denormalizedContainedComponents.returns([ironwoodHeart, hydrathistle, voidroot]);
            const outcome: FabricationOutcome = await underTest.fabricateFromRecipe(mockActor, instantRopeRecipe);

            expect(outcome, 'Expected a Fabrication Outcome').to.exist;
            expect(outcome.type, 'Expected Fabrication to be successful').to.equal(OutcomeType.SUCCESS);
            expect(outcome.actions).to.deep.include.members([
                FabricationAction.builder().withComponent(voidroot).withAction(ActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withComponent(hydrathistle).withAction(ActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withComponent(ironwoodHeart).withAction(ActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withComponent(instantRope).withAction(ActionType.ADD).withQuantity(1).build()
            ]);

        });

        it('Should Fabricate from Components with no Recipe', async () => {

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
                    .withPartId('90z9nOwmGnP4aUUk')
                    .withSystemId('fabricate.alchemists-supplies-v11')
                    .withEssences([])
                    .build())
                .build();

            // @ts-ignore
            mockInventory.addComponent.returns(<InventoryModification<CraftingComponent>>{action: ActionType.ADD});

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>(essenceCombiner);
            const outcome: FabricationOutcome = await underTest.fabricateFromComponents(mockActor, [luminousCapDust, wrackwortBulbs, radiantSynthSeed]);

            const addResults = outcome.actions.filter((action: FabricationAction) => action.type === ActionType.ADD);
            expect(addResults.length).to.equal(1);
            const addResult: FabricationAction = addResults[0];
            expect(addResult.component.systemId).to.equal('fabricate.alchemists-supplies-v11');
            expect(addResult.component.partId).to.equal('90z9nOwmGnP4aUUk');
            expect(addResult.quantity).to.equal(1);
            expect(addResult.type).to.equal(ActionType.ADD);

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

        it('Should efficiently consume recipe components to reduce essence wastage', async () => {

            const underTest: EssenceCombiningFabricator<ItemData5e> = new EssenceCombiningFabricator<ItemData5e>();

            // @ts-ignore
            mockInventory.denormalizedContainedComponents.returns([luminousCapDust, luminousCapDust, wispStalks, fennelSilk]);
            const outcome: FabricationOutcome = await underTest.fabricateFromRecipe(mockActor, flashbangRecipe);

            expect(outcome, 'Expected a Fabrication Outcome').to.exist;
            expect(outcome.type, 'Expected a successful Fabrication Outcome').to.equal(OutcomeType.SUCCESS);
            expect(outcome.actions.length, 'Expected three Crafting Results').to.equal(3);
            expect(outcome.actions).to.deep.include.members([
                FabricationAction.builder().withComponent(wispStalks).withAction(ActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withComponent(fennelSilk).withAction(ActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withComponent(flashbang).withAction(ActionType.ADD).withQuantity(1).build()
            ]);
        });

    });

});