import {StringIdentity, CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";
import Properties from "../../src/scripts/Properties";

const testComponentOne: CraftingComponent = new CraftingComponent({
    id:"iyeUGBbSts0ij92X",
    essences: Combination.ofUnits([new Unit(new StringIdentity(elementalEarth.id), 2)]),
    name: "Test Component One",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentTwo: CraftingComponent = new CraftingComponent({
    id:"Ie7NoXMja9wI6xya",
    essences: Combination.ofUnits([new Unit(new StringIdentity(elementalFire.id), 2)]),
    name: "Test Component Two",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentThree: CraftingComponent = new CraftingComponent({
    id:"tdyV4AWuTMkXbepw",
    essences: Combination.ofUnits([new Unit(new StringIdentity(elementalWater.id), 2)]),
    name: "Test Component Three",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.EMPTY()
});

const testComponentFour: CraftingComponent = new CraftingComponent({
    id:"Ra2Z1ujre76weR0i",
    essences: Combination.ofUnits([new Unit(new StringIdentity(elementalAir.id), 2)]),
    name: "Test Component Four",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.of(new StringIdentity(testComponentThree.id), 2)
});

const testComponentFive: CraftingComponent = new CraftingComponent({
    id:"74K6TAuSg2xzd209",
    essences: Combination.ofUnits([
        new Unit(new StringIdentity(elementalFire.id), 1),
        new Unit(new StringIdentity(elementalEarth.id), 3)
    ]),
    name: "Test Component Five",
    imageUrl: Properties.ui.defaults.itemImageUrl,
    salvage: Combination.ofUnits([
        new Unit(new StringIdentity(testComponentOne.id), 2),
        new Unit(new StringIdentity(testComponentTwo.id), 1),
    ])
});

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}