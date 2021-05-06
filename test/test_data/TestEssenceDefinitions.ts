import {EssenceDefinition} from "../../src/scripts/common/EssenceDefinition";

const elementalEarth = EssenceDefinition.builder()
    .withDescription('One of the four fundamental forces, Elemental Earth.')
    .withIconCode('mountain')
    .withName('Earth')
    .withTooltip('Elemental Earth')
    .build();
const elementalWater = EssenceDefinition.builder()
    .withDescription('One of the four fundamental forces, Elemental Water.')
    .withIconCode('water')
    .withName('Water')
    .withTooltip('Elemental Water')
    .build();
const elementalAir = EssenceDefinition.builder()
    .withDescription('One of the four fundamental forces, Elemental Air.')
    .withIconCode('air')
    .withName('Air')
    .withTooltip('Elemental Air')
    .build();
const elementalFire = EssenceDefinition.builder()
    .withDescription('One of the four fundamental forces, Elemental Fire.')
    .withIconCode('fire')
    .withName('Fire')
    .withTooltip('Elemental Fire')
    .build();

export {elementalEarth, elementalWater, elementalAir, elementalFire}
