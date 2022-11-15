import {Essence} from "../../src/scripts/common/Essence";

const elementalEarth = new Essence({
    description: "One of the four fundamental forces, Elemental Earth.",
    iconCode: "mountain",
    name: "Earth",
    tooltip: "Elemental Earth",
    id: "earth"
});

const elementalWater = new Essence({
    description: "One of the four fundamental forces, Elemental Water.",
    iconCode: "water",
    name: "Water",
    tooltip: "Elemental Water",
    id: "water"
});

const elementalAir = new Essence({
    description: "One of the four fundamental forces, Elemental Air.",
    iconCode: "air",
    name: "Air",
    tooltip: "Elemental Air",
    id: "air"
});

const elementalFire = new Essence({
    description: "One of the four fundamental forces, Elemental Fire.",
    iconCode: "fire",
    name: "Fire",
    tooltip: "Elemental Fire",
    id: "fire"
});

export { elementalEarth, elementalWater, elementalAir, elementalFire }
