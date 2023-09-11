import {describe, test, expect} from "@jest/globals";
import {CraftingAPI, DefaultCraftingAPI} from "../src/scripts/api/CraftingAPI";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import {DefaultInventoryFactory} from "../src/scripts/actor/InventoryFactory";
import {StubObjectUtility} from "./stubs/StubObjectUtility";
import {StubGameProvider} from "./stubs/foundry/StubGameProvider";
import {StubCraftingSystemAPI} from "./stubs/api/StubCraftingSystemAPI";
import {StubEssenceAPI} from "./stubs/api/StubEssenceAPI";
import {StubComponentAPI} from "./stubs/api/StubComponentAPI";
import {StubRecipeAPI} from "./stubs/api/StubRecipeAPI";
import {allTestRecipes} from "./test_data/TestRecipes";
import {allTestComponents, testComponentFour, testComponentThree} from "./test_data/TestCraftingComponents";
import {allTestEssences} from "./test_data/TestEssences";
import {testCraftingSystemOne} from "./test_data/TestCrafingSystem";
import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {StubActorFactory} from "./stubs/StubActorFactory";
import {Combination} from "../src/scripts/common/Combination";
import {
    DefaultComponentSelectionStrategyFactory
} from "../src/scripts/crafting/selection/ComponentSelectionStrategy";


describe("Crafting API", () => {

    describe("Salvaging a Component", () => {

        test("should salvage a component with one salvage option", async () => {

            const stubActor = new StubActorFactory().make(Combination.of(testComponentFour));

            const underTest = make(new Map([ [stubActor.id, stubActor] ]));
            const result = await underTest.salvageComponent({
                componentId: testComponentFour.id,
                sourceActorId: stubActor.id,
            });

            expect(result.produced.size).toEqual(2);
            expect(result.produced.amountFor(testComponentThree)).toEqual(2);
            expect(result.component.id).toEqual(testComponentFour.id);
            expect(result.consumed.id).toEqual(testComponentFour.id);
            expect(result.isSuccessful).toBe(true);
            expect(result.sourceActorId).toEqual(stubActor.id);
            expect(result.targetActorId).toEqual(stubActor.id);

            const ownedSalvageSourceAmount = await underTest.countOwnedComponentsOfType(stubActor.id, testComponentFour.id);
            expect(ownedSalvageSourceAmount).toEqual(0);
            const ownedSalvageResultAmount = await underTest.countOwnedComponentsOfType(stubActor.id, testComponentThree.id);
            expect(ownedSalvageResultAmount).toEqual(2);

        });

        test("should fail to salvage when the actor does not own the specified component", async () => {

            const stubActor = new StubActorFactory().make();

            const underTest = make(new Map([ [stubActor.id, stubActor] ]));
            const result = await underTest.salvageComponent({
                componentId: testComponentFour.id,
                sourceActorId: stubActor.id,
            });

            expect(result.isSuccessful).toEqual(false);
            expect(result.produced.isEmpty()).toBe(true);
            expect(result.component.id).toEqual(testComponentFour.id);
            expect(result.consumed).toBeUndefined();
            expect(result.sourceActorId).toEqual(stubActor.id);
            expect(result.targetActorId).toEqual(stubActor.id);

            const ownedSalvageResultAmount = await underTest.countOwnedComponentsOfType(stubActor.id, testComponentThree.id);
            expect(ownedSalvageResultAmount).toEqual(0);

        });

    });

});

function make(stubActors: Map<string, BaseActor> = new Map()): CraftingAPI {
    const stubLocalizationService = new StubLocalizationService();
    return new DefaultCraftingAPI({
        recipeAPI: new StubRecipeAPI({
            valuesById: allTestRecipes
        }),
        componentAPI: new StubComponentAPI({
            valuesById: allTestComponents
        }),
        essenceAPI: new StubEssenceAPI({
            valuesById: allTestEssences
        }),
        craftingSystemAPI: new StubCraftingSystemAPI({
            valuesById: new Map([
                [ testCraftingSystemOne.id, testCraftingSystemOne ]
            ])
        }),
        localizationService: stubLocalizationService,
        notificationService: new StubNotificationService(),
        inventoryFactory: new DefaultInventoryFactory({
            objectUtility: new StubObjectUtility(),
            localizationService: stubLocalizationService
        }),
        gameProvider: new StubGameProvider({
            stubActors,
        }),
        componentSelectionStrategyFactory: new DefaultComponentSelectionStrategyFactory()
    });
}