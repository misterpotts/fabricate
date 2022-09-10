import {EssenceDefinition} from "../../src/scripts/common/EssenceDefinition";

const elementalEarth = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Earth.",
    iconCode: "mountain",
    name: "Earth",
    tooltip: "Elemental Earth",
    id: "earth"
})
const elementalWater = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Water.",
    iconCode: "water",
    name: "Water",
    tooltip: "Elemental Water",
    id: "water"
});
const elementalAir = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Air.",
    iconCode: "air",
    name: "Air",
    tooltip: "Elemental Air",
    id: "air"
});
const elementalFire = new EssenceDefinition({
    description: "One of the four fundamental forces, Elemental Fire.",
    iconCode: "fire",
    name: "Fire",
    tooltip: "Elemental Fire",
    id: "fire"
});

export { elementalEarth, elementalWater, elementalAir, elementalFire }
