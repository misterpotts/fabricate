import {Component, DefaultComponent} from "../../src/scripts/crafting/component/Component";
import {DefaultCombination} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import Properties from "../../src/scripts/Properties";
import {LoadedFabricateItemData} from "../../src/scripts/foundry/DocumentManager";
import {testCraftingSystemOne} from "./TestCrafingSystem";
import {DefaultUnit} from "../../src/scripts/common/Unit";
import {Salvage} from "../../src/scripts/crafting/component/Salvage";
import {DefaultSerializableOption, DefaultSerializableOptions} from "../../src/scripts/common/Options";

const testComponentOne: Component = new DefaultComponent({
    id: "iyeUGBbSts0ij92X",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component One",
        imageUrl: Properties.ui.defaults.itemImageUrl,
        itemUuid: "Compendium.module.compendium-name.iyeUGBbSts0ij92X",
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([new DefaultUnit(elementalEarth.toReference(), 2)]),
});

const testComponentTwo: Component = new DefaultComponent({
    id: "Ie7NoXMja9wI6xya",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Two",
        itemUuid: "Compendium.module.compendium-name.Ie7NoXMja9wI6xya",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([new DefaultUnit(elementalFire.toReference(), 2)]),
});

const testComponentThree: Component = new DefaultComponent({
    id: "tdyV4AWuTMkXbepw",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.tdyV4AWuTMkXbepw",
        name: "Test Component Three",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([new DefaultUnit(elementalWater.toReference(), 2)]),
});

const testComponentFourId = "Ra2Z1ujre76weR0i";
const testComponentFour: Component = new DefaultComponent({
    id: testComponentFourId,
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Four",
        itemUuid: "Compendium.module.compendium-name.Ra2Z1ujre76weR0i",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([new DefaultUnit(elementalAir.toReference(), 2)]),
    salvageOptions: new DefaultSerializableOptions(
        [
            new DefaultSerializableOption({
                id: `${testComponentFourId}-salvage-1`,
                name: "Option 1",
                value: new Salvage({
                    results: DefaultCombination.of(testComponentThree.toReference(), 2)
                })
            })
        ]
    )
});

const testComponentFiveId = "74K6TAuSg2xzd209";
const testComponentFive: Component = new DefaultComponent({
    id: testComponentFiveId,
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.74K6TAuSg2xzd209",
        name: "Test Component Five",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([
        new DefaultUnit(elementalFire.toReference(), 1),
        new DefaultUnit(elementalEarth.toReference(), 3)
    ]),
    salvageOptions: new DefaultSerializableOptions([
            new DefaultSerializableOption({
                id: `${testComponentFiveId}-salvage-1`,
                name: "Option 1",
                value: new Salvage({
                    results: DefaultCombination.ofUnits([
                        new DefaultUnit(testComponentOne.toReference(), 2),
                        new DefaultUnit(testComponentTwo.toReference(), 1)
                    ])
                })
            }),
        ])
});

const testComponentSix: Component = new DefaultComponent({
    id: "rgTv21iOSwjK1882",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Six",
        itemUuid: "Compendium.module.compendium-name.rgTv21iOSwjK1882",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([new DefaultUnit(elementalWater.toReference(), 1)])
});

const testComponentSeven: Component = new DefaultComponent({
    id: "u9jwSlvIUhlQiEe1",
    craftingSystemId: testCraftingSystemOne.id,
    itemData: new LoadedFabricateItemData({
        name: "Test Component Seven",
        itemUuid: "Compendium.module.compendium-name.u9jwSlvIUhlQiEe1",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: { quantity: null } }
    }),
    essences: DefaultCombination.ofUnits([new DefaultUnit(elementalAir.toReference(), 1)])
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