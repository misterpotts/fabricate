import {Essence} from "../../src/scripts/crafting/essence/Essence";
import {testCraftingSystem} from "./TestCrafingSystem";

const elementalEarth = new Essence({
    description: "One of the four fundamental forces, Elemental Earth.",
    iconCode: "mountain",
    name: "Earth",
    tooltip: "Elemental Earth",
    id: "earth",
    craftingSystemId: testCraftingSystem.id
});

const elementalWater = new Essence({
    description: "One of the four fundamental forces, Elemental Water.",
    iconCode: "water",
    name: "Water",
    tooltip: "Elemental Water",
    id: "water",
    craftingSystemId: testCraftingSystem.id
});

const elementalAir = new Essence({
    description: "One of the four fundamental forces, Elemental Air.",
    iconCode: "air",
    name: "Air",
    tooltip: "Elemental Air",
    id: "air",
    craftingSystemId: testCraftingSystem.id
});

const elementalFire = new Essence({
    description: "One of the four fundamental forces, Elemental Fire.",
    iconCode: "fire",
    name: "Fire",
    tooltip: "Elemental Fire",
    id: "fire",
    craftingSystemId: testCraftingSystem.id
});

const allTestEssences = new Map([
    [elementalEarth.id, elementalEarth],
    [elementalAir.id, elementalAir],
    [elementalWater.id, elementalWater],
    [elementalFire.id, elementalFire]
]);

export {
    allTestEssences,
    elementalEarth,
    elementalWater,
    elementalAir,
    elementalFire
}
