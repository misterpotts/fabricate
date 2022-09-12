import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {Essence} from "../../src/scripts/common/Essence";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testComponentOne: CraftingComponent = new CraftingComponent({
    id: "iyeUGBbSts0ij92X",
    essences: Combination.ofUnits([new Unit<Essence>(elementalEarth, 2)])
});

const testComponentTwo: CraftingComponent = new CraftingComponent({
    id: "Ie7NoXMja9wI6xya",
    essences: Combination.ofUnits([new Unit<Essence>(elementalFire, 1)])
});

const testComponentThree: CraftingComponent = new CraftingComponent({
    id: "tdyV4AWuTMkXbepw",
    essences: Combination.ofUnits([new Unit<Essence>(elementalWater, 2), new Unit<Essence>(elementalAir, 2)])
});

const testComponentFour: CraftingComponent = new CraftingComponent({
    id: "Ra2Z1ujre76weR0i",
    essences: Combination.ofUnits([new Unit<Essence>(elementalAir, 2)])
});

const testComponentFive: CraftingComponent = new CraftingComponent({
    id: "74K6TAuSg2xzd209",
    essences: Combination.ofUnits([new Unit<Essence>(elementalFire, 1), new Unit<Essence>(elementalEarth, 3)])
});

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}