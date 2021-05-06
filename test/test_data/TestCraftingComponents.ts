import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {Combination, Unit} from "../../src/scripts/common/Combination";
import {EssenceDefinition} from "../../src/scripts/common/EssenceDefinition";

import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testComponentOne: CraftingComponent = CraftingComponent.builder()
    .withPartId('iyeUGBbSts0ij92X')
    .withSystemId('fabricate.test-system')
    .withImageUrl('/img/picture-1.png')
    .withName('Test Component One')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 2)]))
    .build();
const testComponentTwo: CraftingComponent = CraftingComponent.builder()
    .withPartId('Ie7NoXMja9wI6xya')
    .withSystemId('fabricate.test-system')
    .withImageUrl('/img/picture-2.png')
    .withName('Test Component Two')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1)]))
    .build();
const testComponentThree: CraftingComponent = CraftingComponent.builder()
    .withPartId('tdyV4AWuTMkXbepw')
    .withSystemId('fabricate.test-system')
    .withImageUrl('/img/picture-3.png')
    .withName('Test Component Three')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 2), new Unit<EssenceDefinition>(elementalAir, 2)]))
    .build();
const testComponentFour: CraftingComponent = CraftingComponent.builder()
    .withPartId('Ra2Z1ujre76weR0i')
    .withSystemId('fabricate.test-system')
    .withImageUrl('/img/picture-4.png')
    .withName('Test Component Four')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 2)]))
    .build();
const testComponentFive: CraftingComponent = CraftingComponent.builder()
    .withPartId('74K6TAuSg2xzd209')
    .withSystemId('fabricate.test-system')
    .withImageUrl('/img/picture-5.png')
    .withName('Test Component Five')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1), new Unit<EssenceDefinition>(elementalEarth, 3)]))
    .build();

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}