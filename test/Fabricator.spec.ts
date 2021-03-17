import {expect} from 'chai';
import * as Sinon from "sinon";

import {Recipe} from "../src/scripts/core/Recipe";
import {FabricationAction, FabricationActionType} from "../src/scripts/core/FabricationAction";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {Inventory} from "../src/scripts/game/Inventory";
import {Inventory5E} from "../src/scripts/dnd5e/Inventory5E";
import {FabricationOutcome, OutcomeType} from "../src/scripts/core/FabricationOutcome";
import {InventoryRecord} from "../src/scripts/game/InventoryRecord";
import {FabricateItemType} from "../src/scripts/game/CompendiumData";
import {EssenceCombiner} from "../src/scripts/core/EssenceCombiner";
import {AlchemySpecification, Fabricator} from "../src/scripts/core/Fabricator";
import {Ingredient} from "../src/scripts/core/Ingredient";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockInventory: Inventory<ItemData5e> = <Inventory5E><unknown>{
    containsIngredient: Sandbox.stub(),
    add: Sandbox.stub(),
    remove: Sandbox.stub(),
    components: Sandbox.stub()
}

before(() => {
    global.duplicate = (object: any) => object;
});

beforeEach(() => {
    Sandbox.restore();
});

describe('Fabricator |', () => {

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
    mockInventory.remove.withArgs(ironwoodHeart).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const hydrathistle: CraftingComponent = CraftingComponent.builder()
        .withName('Hydrathistle')
        .withPartId('789xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['WATER', 'WATER'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(hydrathistle).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const voidroot: CraftingComponent = CraftingComponent.builder()
        .withName('Voidroot')
        .withPartId('891xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['NEGATIVE_ENERGY'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(voidroot).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const luminousCapDust: CraftingComponent = CraftingComponent.builder()
        .withName('Luminous Cap Dust')
        .withPartId('a23xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['FIRE', 'AIR'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(luminousCapDust).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const wispStalks: CraftingComponent = CraftingComponent.builder()
        .withName('Wisp Stalks')
        .withPartId('a34xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['AIR', 'AIR'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(wispStalks).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const fennelSilk: CraftingComponent = CraftingComponent.builder()
        .withName('Fennel Silk')
        .withPartId('a45xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['FIRE'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(fennelSilk).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const wrackwortBulbs: CraftingComponent = CraftingComponent.builder()
        .withName('Wrackwort Bulbs')
        .withPartId('a56xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'FIRE'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(wrackwortBulbs).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    const radiantSynthSeed: CraftingComponent = CraftingComponent.builder()
        .withName('Radiant Synthseed')
        .withPartId('a67xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['POSITIVE_ENERGY'])
        .build();
    // @ts-ignore
    mockInventory.remove.withArgs(radiantSynthSeed).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

    /* =======================================================================
     * Recipe Results
     * ======================================================================= */

    const instantRope: CraftingComponent = CraftingComponent.builder()
        .withName('Instant Rope')
        .withPartId('234xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .build();
    // @ts-ignore
    mockInventory.add.withArgs(instantRope).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.ADD});

    const acid: CraftingComponent = CraftingComponent.builder()
        .withName('Acid')
        .withPartId('678xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .build();
    // @ts-ignore
    mockInventory.add.withArgs(acid).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.ADD});

    const flashbang: CraftingComponent = CraftingComponent.builder()
        .withName('Flashbang')
        .withPartId('a12xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .build();
    // @ts-ignore
    mockInventory.add.withArgs(flashbang).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.ADD});

    /* =======================================================================
     * Recipes
     * ======================================================================= */

    const instantRopeRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Instant Rope')
        .withPartId('123xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'EARTH', 'WATER', 'WATER', 'NEGATIVE_ENERGY'])
        .withResult(FabricationAction.builder()
            .withActionType(FabricationActionType.ADD)
            .withQuantity(1)
            .withItemType(instantRope)
            .build())
        .build();
    const acidRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Acid')
        .withPartId('456xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['EARTH', 'FIRE', 'POSITIVE_ENERGY'])
        .withResult(FabricationAction.builder()
            .withActionType(FabricationActionType.ADD)
            .withQuantity(1)
            .withItemType(acid)
            .build())
        .build();
    const flashbangRecipe: Recipe = Recipe.builder()
        .withName('Recipe: Flashbang')
        .withPartId('912xyz')
        .withSystemId('fabricate.alchemists-supplies-v11')
        .withEssences(['FIRE', 'AIR', 'AIR'])
        .withResult(FabricationAction.builder()
            .withActionType(FabricationActionType.ADD)
            .withQuantity(1)
            .withItemType(flashbang)
            .build())
        .build();

    describe('Simple Recipes |', () => {

        const compendiumPackKey = 'fabricate.fabricate-test';
        const mud: CraftingComponent = CraftingComponent.builder()
            .withName('Mud')
            .withPartId('tCmAnq9zcESt0ULf')
            .withSystemId(compendiumPackKey)
            .build()
        // @ts-ignore
        mockInventory.remove.withArgs(mud).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

        const sticks: CraftingComponent = CraftingComponent.builder()
            .withName('Sticks')
            .withPartId('arWeEYkLkubimBz3')
            .withSystemId(compendiumPackKey)
            .build();
        // @ts-ignore
        mockInventory.remove.withArgs(sticks).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.REMOVE});

        const mudPie = CraftingComponent.builder()
            .withName('Mud Pie')
            .withPartId('nWhTa8gD1QL1f9O3')
            .withSystemId(compendiumPackKey)
            .build();
        // @ts-ignore
        mockInventory.add.withArgs(mudPie).returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.ADD});

        const mudPieRecipe: Recipe = Recipe.builder()
            .withName('Recipe: Mud Pie')
            .withPartId('4iHqWSLTMFjPbpuI')
            .withIngredient(Ingredient.builder()
                .isConsumed(true)
                .withQuantity(2)
                .withComponent(mud)
                .build())
            .withIngredient(Ingredient.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withComponent(sticks)
                .build())
            .withResult(FabricationAction.builder()
                .withActionType(FabricationActionType.ADD)
                .withQuantity(1)
                .withItemType(mudPie)
                .build())
            .build();

        it('Should create a Mud Pie from Recipe and components', async () => {

            const underTest: Fabricator<ItemData5e> = new Fabricator<ItemData5e>();

            const mockActor: Actor = <Actor><unknown>{};

            const contents: InventoryRecord<CraftingComponent>[] = [];
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(mud)
                .withTotalQuantity(2)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(sticks)
                .withTotalQuantity(1)
                .withActor(mockActor)
                .withItems([])
                .build());
            mockInventory.components = contents;

            const fabricationOutcome: FabricationOutcome = await underTest.fabricateFromRecipe(mockInventory, mudPieRecipe);
            expect(fabricationOutcome.actions.length).to.equal(3);
            expect(fabricationOutcome.actions).to.deep.include.members([
                FabricationAction.builder()
                    .withActionType(FabricationActionType.ADD)
                    .withQuantity(1)
                    .withItemType(mudPie)
                    .build(),
                FabricationAction.builder()
                    .withActionType(FabricationActionType.REMOVE)
                    .withQuantity(2)
                    .withItemType(mud)
                    .build(),
                FabricationAction.builder()
                    .withActionType(FabricationActionType.REMOVE)
                    .withQuantity(1)
                    .withItemType(sticks)
                    .build()
            ]);
        });
    });

    describe('Essence Combination |', () => {

        it('Should list craftable Recipes from Components', () => {

            const underTest: Fabricator<ItemData5e> = new Fabricator<ItemData5e>();
            const result: Recipe[] = underTest.filterCraftableRecipesFor([ironwoodHeart, hydrathistle, voidroot], [instantRopeRecipe, acidRecipe, flashbangRecipe]);

            expect(result, 'List of recipes was null!').to.exist;
            expect(result.length, 'Expected one craftable recipe').to.equal(1);
            const resultRecipe: Recipe = result[0];
            expect(resultRecipe.partId, 'Expected Instant Rope to be the only craftable recipe').to.equal(instantRopeRecipe.partId);

        });

        it('Should Fabricate from a Recipe that requires essences', async () => {

            const underTest: Fabricator<ItemData5e> = new Fabricator<ItemData5e>();

            const mockActor: Actor = <Actor><unknown>{};

            const contents: InventoryRecord<CraftingComponent>[] = [];
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(ironwoodHeart)
                .withTotalQuantity(1)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(hydrathistle)
                .withTotalQuantity(1)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(voidroot)
                .withTotalQuantity(1)
                .withActor(mockActor)
                .withItems([])
                .build());
            mockInventory.components = contents;

            const outcome: FabricationOutcome = await underTest.fabricateFromRecipe(mockInventory, instantRopeRecipe);

            expect(outcome, 'Expected a Fabrication Outcome').to.exist;
            expect(outcome.type, 'Expected Fabrication to be successful').to.equal(OutcomeType.SUCCESS);
            expect(outcome.actions).to.deep.include.members([
                FabricationAction.builder().withItemType(voidroot).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(hydrathistle).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(ironwoodHeart).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(instantRope).withActionType(FabricationActionType.ADD).withQuantity(1).build()
            ]);

        });

        it('Should Fabricate from a Recipe that requires essences with a large number of candidate components', async () => {

            const underTest: Fabricator<ItemData5e> = new Fabricator<ItemData5e>();

            const mockActor: Actor = <Actor><unknown>{};

            const contents: InventoryRecord<CraftingComponent>[] = [];
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(ironwoodHeart)
                .withTotalQuantity(500)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(hydrathistle)
                .withTotalQuantity(500)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(voidroot)
                .withTotalQuantity(500)
                .withActor(mockActor)
                .withItems([])
                .build());
            mockInventory.components = contents;

            const outcome: FabricationOutcome = await underTest.fabricateFromRecipe(mockInventory, instantRopeRecipe);

            expect(outcome, 'Expected a Fabrication Outcome').to.exist;
            expect(outcome.type, 'Expected Fabrication to be successful').to.equal(OutcomeType.SUCCESS);
            expect(outcome.actions).to.deep.include.members([
                FabricationAction.builder().withItemType(voidroot).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(hydrathistle).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(ironwoodHeart).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(instantRope).withActionType(FabricationActionType.ADD).withQuantity(1).build()
            ]);

        });

        it('Should Fabricate from Components with no Recipe', async () => {
            const baseComponent = CraftingComponent.builder()
                .withName('Alchemical Bomb')
                .withImageUrl('/img/bomb.jpg')
                .withPartId('90z9nOwmGnP4aUUk')
                .withSystemId('fabricate.alchemists-supplies-v11')
                .build();

            // @ts-ignore
            const mockEssenceCombiner: EssenceCombiner<ItemData5e> = <EssenceCombiner<ItemData5e>><unknown>{
                combine: Sandbox.stub()
            };
            // @ts-ignore
            mockEssenceCombiner.combine.returns({
                description: {
                    value: '<p>Release concentrated mist in all directions. Increase the radius of all effects by 5 feet.</p> <p>Deal 1d8 acid damage on contact.</p> <p>Roll double the number of all damage dice.</p>'
                },
                target: {
                    value: 5,
                    units: 'ft',
                    type: 'radius'
                },
                damage: {
                    parts: [['2d8', 'acid']]
                }
            });
            // @ts-ignore
            const mockAlchemySpecification: AlchemySpecification<ItemData5e> = <AlchemySpecification<ItemData5e>>{
                essenceCombiner: mockEssenceCombiner,
                baseComponent: baseComponent,
                getBaseItemData: Sandbox.stub()
            };
            const mockBaseItemData = require('./resources/alchemical-bomb-compendum-entry-itemData5e.json');
            // @ts-ignore
            mockAlchemySpecification.getBaseItemData.returns(mockBaseItemData);

            // @ts-ignore
            mockInventory.add.returns(<InventoryModification<CraftingComponent>>{action: FabricationActionType.ADD});

            const underTest: Fabricator<ItemData5e> = new Fabricator<ItemData5e>(mockAlchemySpecification);
            const outcome: FabricationOutcome = await underTest.fabricateFromComponents(mockInventory, [luminousCapDust, wrackwortBulbs, radiantSynthSeed]);

            const addResults = outcome.actions.filter((action: FabricationAction<Item.Data>) => action.actionType === FabricationActionType.ADD);
            expect(addResults.length).to.equal(1);
            const addResult: FabricationAction<Item.Data> = addResults[0];
            expect(addResult.itemType.systemId).to.equal('fabricate.alchemists-supplies-v11');
            expect(addResult.itemType.partId).to.equal('90z9nOwmGnP4aUUk');
            expect(addResult.quantity).to.equal(1);
            expect(addResult.actionType).to.equal(FabricationActionType.ADD);

            const customItemData: ItemData5e = addResult.customItemData;

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

            const underTest: Fabricator<ItemData5e> = new Fabricator<ItemData5e>();

            const mockActor: Actor = <Actor><unknown>{};

            const contents: InventoryRecord<CraftingComponent>[] = [];
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(luminousCapDust)
                .withTotalQuantity(2)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(wispStalks)
                .withTotalQuantity(1)
                .withActor(mockActor)
                .withItems([])
                .build());
            contents.push(InventoryRecord.builder<CraftingComponent>()
                .withFabricateItemType(FabricateItemType.COMPONENT)
                .withFabricateItem(fennelSilk)
                .withTotalQuantity(1)
                .withActor(mockActor)
                .withItems([])
                .build());
            mockInventory.components = contents;

            const outcome: FabricationOutcome = await underTest.fabricateFromRecipe(mockInventory, flashbangRecipe);

            expect(outcome, 'Expected a Fabrication Outcome').to.exist;
            expect(outcome.type, 'Expected a successful Fabrication Outcome').to.equal(OutcomeType.SUCCESS);
            expect(outcome.actions.length, 'Expected three Crafting Results').to.equal(3);
            expect(outcome.actions).to.deep.include.members([
                FabricationAction.builder().withItemType(wispStalks).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(fennelSilk).withActionType(FabricationActionType.REMOVE).withQuantity(1).build(),
                FabricationAction.builder().withItemType(flashbang).withActionType(FabricationActionType.ADD).withQuantity(1).build()
            ]);
        });

    })
});

