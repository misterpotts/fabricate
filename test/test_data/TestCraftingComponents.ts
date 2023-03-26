import {Component, SalvageOption} from "../../src/scripts/crafting/component/Component";
import {Combination, Unit} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import Properties from "../../src/scripts/Properties";
import {SelectableOptions} from "../../src/scripts/crafting/recipe/SelectableOptions";
import {LoadedFabricateItemData} from "../../src/scripts/foundry/DocumentManager";

const testComponentOne: Component = new Component({
    id: "iyeUGBbSts0ij92X",
    itemData: new LoadedFabricateItemData({
        name: "Test Component One",
        imageUrl: Properties.ui.defaults.itemImageUrl,
        itemUuid: "Compendium.module.compendium-name.iyeUGBbSts0ij92X",
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalEarth, 2)]),
});

const testComponentTwo: Component = new Component({
    id: "Ie7NoXMja9wI6xya",
    itemData: new LoadedFabricateItemData({
        name: "Test Component Two",
        itemUuid: "Compendium.module.compendium-name.Ie7NoXMja9wI6xya",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalFire, 2)]),
});

const testComponentThree: Component = new Component({
    id: "tdyV4AWuTMkXbepw",
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.tdyV4AWuTMkXbepw",
        name: "Test Component Three",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalWater, 2)]),
});

const testComponentFour: Component = new Component({
    id: "Ra2Z1ujre76weR0i",
    itemData: new LoadedFabricateItemData({
        name: "Test Component Four",
        itemUuid: "Compendium.module.compendium-name.Ra2Z1ujre76weR0i",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalAir, 2)]),
    salvageOptions: new SelectableOptions({
        options: [
            new SalvageOption({
                name: "Option 1",
                salvage: Combination.of(testComponentThree, 2)
            })
        ]
    })
});

const testComponentFive: Component = new Component({
    id:"74K6TAuSg2xzd209",
    itemData: new LoadedFabricateItemData({
        itemUuid: "Compendium.module.compendium-name.74K6TAuSg2xzd209",
        name: "Test Component Five",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([
        new Unit(elementalFire, 1),
        new Unit(elementalEarth, 3)
    ]),
    salvageOptions: new SelectableOptions({
        options: [
            new SalvageOption({
                name: "Option 1",
                salvage: Combination.ofUnits([
                    new Unit(testComponentOne, 2),
                    new Unit(testComponentTwo, 1)
                ])
            })
        ]
    })
});

const testComponentSix: Component = new Component({
    id: "rgTv21iOSwjK1882",
    itemData: new LoadedFabricateItemData({
        name: "Test Component Six",
        itemUuid: "Compendium.module.compendium-name.rgTv21iOSwjK1882",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalWater, 1)])
});

const testComponentSeven: Component = new Component({
    id: "u9jwSlvIUhlQiEe1",
    itemData: new LoadedFabricateItemData({
        name: "Test Component Seven",
        itemUuid: "Compendium.module.compendium-name.u9jwSlvIUhlQiEe1",
        imageUrl: Properties.ui.defaults.recipeImageUrl,
        sourceDocument: { effects: [], flags: {}, system: {} }
    }),
    essences: Combination.ofUnits([new Unit(elementalAir, 1)])
});

export {
    testComponentOne,
    testComponentTwo,
    testComponentThree,
    testComponentFour,
    testComponentFive,
    testComponentSix,
    testComponentSeven
}