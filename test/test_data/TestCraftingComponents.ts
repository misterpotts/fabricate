import {CraftingComponent, SalvageOption} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import Properties from "../../src/scripts/Properties";
import {SelectableOptions} from "../../src/scripts/common/SelectableOptions";

const testComponentOne: CraftingComponent = new CraftingComponent({
    id: "iyeUGBbSts0ij92X",
    itemUuid: "Compendium.module.compendium-name.iyeUGBbSts0ij92X",
    essences: Combination.ofUnits([new Unit(elementalEarth, 2)]),
    name: "Test Component One",
    imageUrl: Properties.ui.defaults.itemImageUrl
});

const testComponentTwo: CraftingComponent = new CraftingComponent({
    id: "Ie7NoXMja9wI6xya",
    itemUuid: "Compendium.module.compendium-name.Ie7NoXMja9wI6xya",
    essences: Combination.ofUnits([new Unit(elementalFire, 2)]),
    name: "Test Component Two",
    imageUrl: Properties.ui.defaults.itemImageUrl
});

const testComponentThree: CraftingComponent = new CraftingComponent({
    id: "tdyV4AWuTMkXbepw",
    itemUuid: "Compendium.module.compendium-name.tdyV4AWuTMkXbepw",
    essences: Combination.ofUnits([new Unit(elementalWater, 2)]),
    name: "Test Component Three",
    imageUrl: Properties.ui.defaults.itemImageUrl
});

const testComponentFour: CraftingComponent = new CraftingComponent({
    id: "Ra2Z1ujre76weR0i",
    itemUuid: "Compendium.module.compendium-name.Ra2Z1ujre76weR0i",
    essences: Combination.ofUnits([new Unit(elementalAir, 2)]),
    name: "Test Component Four",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvageOptions: new SelectableOptions({
        options: [
            new SalvageOption({
                name: "Option 1",
                salvage: Combination.of(testComponentThree, 2)
            })
        ]
    })
});

const testComponentFive: CraftingComponent = new CraftingComponent({
    id:"74K6TAuSg2xzd209",
    itemUuid: "Compendium.module.compendium-name.74K6TAuSg2xzd209",
    essences: Combination.ofUnits([
        new Unit(elementalFire, 1),
        new Unit(elementalEarth, 3)
    ]),
    name: "Test Component Five",
    imageUrl: Properties.ui.defaults.itemImageUrl,
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

const testComponentSix: CraftingComponent = new CraftingComponent({
    id: "rgTv21iOSwjK1882",
    itemUuid: "Compendium.module.compendium-name.rgTv21iOSwjK1882",
    essences: Combination.ofUnits([new Unit(elementalWater, 1)]),
    name: "Test Component Six",
    imageUrl: Properties.ui.defaults.itemImageUrl
});

const testComponentSeven: CraftingComponent = new CraftingComponent({
    id: "u9jwSlvIUhlQiEe1",
    itemUuid: "Compendium.module.compendium-name.u9jwSlvIUhlQiEe1",
    essences: Combination.ofUnits([new Unit(elementalAir, 1)]),
    name: "Test Component Seven",
    imageUrl: Properties.ui.defaults.itemImageUrl
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