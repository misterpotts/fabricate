import {DefaultEssence} from "../../src/scripts/crafting/essence/Essence";
import {testCraftingSystemOne} from "./TestCrafingSystem";

const elementalEarth = new DefaultEssence({
    description: "One of the four fundamental forces, Elemental Earth.",
    iconCode: "mountain",
    name: "Earth",
    tooltip: "Elemental Earth",
    id: "earth",
    craftingSystemId: testCraftingSystemOne.id
});

const elementalWater = new DefaultEssence({
    description: "One of the four fundamental forces, Elemental Water.",
    iconCode: "water",
    name: "Water",
    tooltip: "Elemental Water",
    id: "water",
    craftingSystemId: testCraftingSystemOne.id
});

const elementalAir = new DefaultEssence({
    description: "One of the four fundamental forces, Elemental Air.",
    iconCode: "air",
    name: "Air",
    tooltip: "Elemental Air",
    id: "air",
    craftingSystemId: testCraftingSystemOne.id
});

const elementalFire = new DefaultEssence({
    description: "One of the four fundamental forces, Elemental Fire.",
    iconCode: "fire",
    name: "Fire",
    tooltip: "Elemental Fire",
    id: "fire",
    craftingSystemId: testCraftingSystemOne.id
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
