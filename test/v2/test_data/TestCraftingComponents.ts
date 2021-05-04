import {CraftingComponent} from "../../../src/scripts/v2/common/CraftingComponent";
import {Combination, Unit} from "../../../src/scripts/v2/common/Combination";
import {EssenceDefinition} from "../../../src/scripts/v2/common/EssenceDefinition";
// @ts-ignore
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./TestEssenceDefinitions";

const testComponentOne: CraftingComponent = CraftingComponent.builder()
    .withPartId('iyeUGBbSts0ij92X')
    .withCompendiumId('fabricate.test-system')
    .withImageUrl('/img/picture-1.png')
    .withName('Test Component One')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalEarth, 2)]))
    .build();
const testComponentTwo: CraftingComponent = CraftingComponent.builder()
    .withPartId('Ie7NoXMja9wI6xya')
    .withCompendiumId('fabricate.test-system')
    .withImageUrl('/img/picture-2.png')
    .withName('Test Component Two')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1)]))
    .build();
const testComponentThree: CraftingComponent = CraftingComponent.builder()
    .withPartId('tdyV4AWuTMkXbepw')
    .withCompendiumId('fabricate.test-system')
    .withImageUrl('/img/picture-3.png')
    .withName('Test Component Three')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalWater, 2), new Unit<EssenceDefinition>(elementalAir, 2)]))
    .build();
const testComponentFour: CraftingComponent = CraftingComponent.builder()
    .withPartId('Ra2Z1ujre76weR0i')
    .withCompendiumId('fabricate.test-system')
    .withImageUrl('/img/picture-4.png')
    .withName('Test Component Four')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalAir, 2)]))
    .build();
const testComponentFive: CraftingComponent = CraftingComponent.builder()
    .withPartId('74K6TAuSg2xzd209')
    .withCompendiumId('fabricate.test-system')
    .withImageUrl('/img/picture-5.png')
    .withName('Test Component Five')
    .withEssences(Combination.ofUnits([new Unit<EssenceDefinition>(elementalFire, 1), new Unit<EssenceDefinition>(elementalEarth, 3)]))
    .build();

export {testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive}