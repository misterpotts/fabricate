import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {EssenceDefinition} from "../../src/scripts/common/EssenceDefinition";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testCompendiumId: string = "fabricate.test-compendium";
const testSystemId = "fabricate.test-system";

const testComponentOne: CraftingComponent = new CraftingComponent({
    gameItem: {
        partId: "iyeUGBbSts0ij92X",
        imageUrl: "/img/picture-1.png",
        name: "Test Component One",
        systemId: testSystemId,
        compendiumId: testCompendiumId,
    },
    essences: Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 2)])
});

const testComponentTwo: CraftingComponent = new CraftingComponent({
    gameItem: {
        partId: "Ie7NoXMja9wI6xya",
        imageUrl: "/img/picture-2.png",
        name: "Test Component Two",
        systemId: testSystemId,
        compendiumId: testCompendiumId,
    },
    essences: Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1)])
});

const testComponentThree: CraftingComponent = new CraftingComponent({
    gameItem: {
        partId: "tdyV4AWuTMkXbepw",
        imageUrl: "/img/picture-3.png",
        name: "Test Component Three",
        systemId: testSystemId,
        compendiumId: testCompendiumId,
    },
    essences: Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 2), new Unit<EssenceDefinition>(elementalAir, 2)])
});

const testComponentFour: CraftingComponent = new CraftingComponent({
    gameItem: {
        partId: "Ra2Z1ujre76weR0i",
        imageUrl: "/img/picture-4.png",
        name: "Test Component Four",
        systemId: testSystemId,
        compendiumId: testCompendiumId,
    },
    essences: Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 2)])
});

const testComponentFive: CraftingComponent = new CraftingComponent({
    gameItem: {
        partId: "74K6TAuSg2xzd209",
        imageUrl: "/img/picture-5.png",
        name: "Test Component Five",
        systemId: testSystemId,
        compendiumId: testCompendiumId,
    },
    essences: Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1), new Unit<EssenceDefinition>(elementalEarth, 3)])
});

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}