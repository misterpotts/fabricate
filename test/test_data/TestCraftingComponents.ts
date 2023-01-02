import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssences";
import Properties from "../../src/scripts/Properties";

const testComponentOne: CraftingComponent = new CraftingComponent({
    id:"iyeUGBbSts0ij92X",
    essences: Combination.ofUnits([new Unit(elementalEarth, 2)]),
    name: "Test Component One",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentTwo: CraftingComponent = new CraftingComponent({
    id:"Ie7NoXMja9wI6xya",
    essences: Combination.ofUnits([new Unit(elementalFire, 2)]),
    name: "Test Component Two",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentThree: CraftingComponent = new CraftingComponent({
    id:"tdyV4AWuTMkXbepw",
    essences: Combination.ofUnits([new Unit(elementalWater, 2)]),
    name: "Test Component Three",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentFour: CraftingComponent = new CraftingComponent({
    id:"Ra2Z1ujre76weR0i",
    essences: Combination.ofUnits([new Unit(elementalAir, 2)]),
    name: "Test Component Four",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.of(testComponentThree.summarise(), 2)
});

const testComponentFive: CraftingComponent = new CraftingComponent({
    id:"74K6TAuSg2xzd209",
    essences: Combination.ofUnits([
        new Unit(elementalFire, 1),
        new Unit(elementalEarth, 3)
    ]),
    name: "Test Component Five",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.ofUnits([
        new Unit(testComponentOne.summarise(), 2),
        new Unit(testComponentTwo.summarise(), 1),
    ])
});

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}