import {Component} from "../../src/scripts/crafting/component/Component";
import {Combination} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import Properties from "../../src/scripts/Properties";
import {SelectableOptions} from "../../src/scripts/crafting/selection/SelectableOptions";
import {LoadedFabricateItemData} from "../../src/scripts/foundry/DocumentManager";
import {testCraftingSystemOne} from "./TestCrafingSystem";
import {Unit} from "../../src/scripts/common/Unit";
import {SalvageOption} from "../../src/scripts/crafting/component/SalvageOption";

const testComponentOne: Component = new Component({
    id: "iyeUGBbSts0ij92X",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component One",
        imageUrl: Properties.ui.defaults.itemImageUrl,
        itemUuid: "Compendium.module.compendium-name.iyeUGBbSts0ij92X",
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalEarth.toReference(), 2)]),
});

const testComponentTwo: Component = new Component({
    id: "Ie7NoXMja9wI6xya",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Two",
        itemUuid: "Compendium.module.compendium-name.Ie7NoXMja9wI6xya",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalFire.toReference(), 2)]),
});

const testComponentThree: Component = new Component({
    id: "tdyV4AWuTMkXbepw",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.tdyV4AWuTMkXbepw",
        name: "Test Component Three",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalWater.toReference(), 2)]),
});

const testComponentFourId = "Ra2Z1ujre76weR0i";
const testComponentFour: Component = new Component({
    id: testComponentFourId,
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Four",
        itemUuid: "Compendium.module.compendium-name.Ra2Z1ujre76weR0i",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalAir.toReference(), 2)]),
    salvageOptions: new SelectableOptions({
        options: [
            new SalvageOption({
                id: `${testComponentFourId}-salvage-1`,
                name: "Option 1",
                results: Combination.of(testComponentThree.toReference(), 2)
            })
        ]
    })
});

const testComponentFiveId = "74K6TAuSg2xzd209";
const testComponentFive: Component = new Component({
    id: testComponentFiveId,
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.74K6TAuSg2xzd209",
        name: "Test Component Five",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([
        new Unit(elementalFire.toReference(), 1),
        new Unit(elementalEarth.toReference(), 3)
    ]),
    salvageOptions: new SelectableOptions({
        options: [
            new SalvageOption({
                id: `${testComponentFiveId}-salvage-1`,
                name: "Option 1",
                results: Combination.ofUnits([
                    new Unit(testComponentOne.toReference(), 2),
                    new Unit(testComponentTwo.toReference(), 1)
                ])
            })
        ]
    })
});

const testComponentSix: Component = new Component({
    id: "rgTv21iOSwjK1882",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Six",
        itemUuid: "Compendium.module.compendium-name.rgTv21iOSwjK1882",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalWater.toReference(), 1)])
});

const testComponentSeven: Component = new Component({
    id: "u9jwSlvIUhlQiEe1",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Seven",
        itemUuid: "Compendium.module.compendium-name.u9jwSlvIUhlQiEe1",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalAir.toReference(), 1)])
});

const allTestComponents = new Map([
    [testComponentOne.id, testComponentOne],
    [testComponentTwo.id, testComponentTwo],
    [testComponentThree.id, testComponentThree],
    [testComponentFour.id, testComponentFour],
    [testComponentFive.id,testComponentFive],
    [testComponentSix.id, testComponentSix],
    [testComponentSeven.id, testComponentSeven]
]);

export {
    allTestComponents,
    testComponentOne,
    testComponentTwo,
    testComponentThree,
    testComponentFour,
    testComponentFive,
    testComponentSix,
    testComponentSeven
}