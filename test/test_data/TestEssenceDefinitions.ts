import {EssenceDefinition} from "../../src/scripts/common/EssenceDefinition";

const elementalEarth = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Earth.",
    iconCode: "mountain",
    name: "Earth",
    tooltip: "Elemental Earth",
    slug: "earth"
})
const elementalWater = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Water.",
    iconCode: "water",
    name: "Water",
    tooltip: "Elemental Water",
    slug: "water"
});
const elementalAir = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Air.",
    iconCode: "air",
    name: "Air",
    tooltip: "Elemental Air",
    slug: "air"
});
const elementalFire = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Fire.",
    iconCode: "fire",
    name: "Fire",
    tooltip: "Elemental Fire",
    slug: "fire"
});

export { elementalEarth, elementalWater, elementalAir, elementalFire }
