import {CraftingComponent, CraftingComponentId} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";
import Properties from "../../src/scripts/Properties";

const testComponentOne: CraftingComponent = new CraftingComponent({
    id: new CraftingComponentId("iyeUGBbSts0ij92X"),
    essences: Combination.ofUnits([new Unit(elementalEarth.id, 2)]),
    name: "Test Component One",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentTwo: CraftingComponent = new CraftingComponent({
    id: new CraftingComponentId("Ie7NoXMja9wI6xya"),
    essences: Combination.ofUnits([new Unit(elementalFire.id, 2)]),
    name: "Test Component Two",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentThree: CraftingComponent = new CraftingComponent({
    id: new CraftingComponentId("tdyV4AWuTMkXbepw"),
    essences: Combination.ofUnits([new Unit(elementalWater.id, 2)]),
    name: "Test Component Three",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentFour: CraftingComponent = new CraftingComponent({
    id: new CraftingComponentId("Ra2Z1ujre76weR0i"),
    essences: Combination.ofUnits([new Unit(elementalAir.id, 2)]),
    name: "Test Component Four",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.of(testComponentThree.id, 2)
});

const testComponentFive: CraftingComponent = new CraftingComponent({
    id: new CraftingComponentId("74K6TAuSg2xzd209"),
    essences: Combination.ofUnits([
        new Unit(elementalFire.id, 1),
        new Unit(elementalEarth.id, 3)
    ]),
    name: "Test Component Five",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.ofUnits([
        new Unit(testComponentOne.id, 2),
        new Unit(testComponentTwo.id, 1),
    ])
});

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}