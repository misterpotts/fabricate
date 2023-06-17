import {CraftingSystem} from "../../src/scripts/system/CraftingSystem";
import {CraftingSystemDetails} from "../../src/scripts/system/CraftingSystemDetails";

const testCraftingSystemOne = new CraftingSystem({
    id: "c3d50462684c5d960f3fba9f953a93a1",
    enabled: true,
    craftingSystemDetails: new CraftingSystemDetails({
        name: "Test system one",
        summary: "Test system one is not an embedded system",
        description: "Test system one is a user-defined system used for test purposes only",
        author: "None"
    }),
    embedded: false,
    gameSystem: "dnd5e"
});

export { testCraftingSystemOne }

const testCraftingSystemTwo = new CraftingSystem({
    id: "c3d50462684c5d960f3fba9f953a93a2",
    enabled: true,
    craftingSystemDetails: new CraftingSystemDetails({
        name: "Test system two",
        summary: "Test system two is an embedded system",
        description: "Test system two is an embedded system used for test purposes only",
        author: "None"
    }),
    embedded: true,
    gameSystem: "dnd5e"
});

export { testCraftingSystemTwo }