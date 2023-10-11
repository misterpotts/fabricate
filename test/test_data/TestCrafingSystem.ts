import {DefaultCraftingSystem} from "../../src/scripts/crafting/system/CraftingSystem";
import {CraftingSystemDetails} from "../../src/scripts/crafting/system/CraftingSystemDetails";

const testCraftingSystemOne = new DefaultCraftingSystem({
    id: "c3d50462684c5d960f3fba9f953a93a1",
    disabled: false,
    craftingSystemDetails: new CraftingSystemDetails({
        name: "Test system one",
        summary: "Test system one is not an embedded system",
        description: "Test system one is a user-defined system used for test purposes only",
        author: "None"
    }),
    embedded: false,
});

export { testCraftingSystemOne }

const testCraftingSystemTwo = new DefaultCraftingSystem({
    id: "c3d50462684c5d960f3fba9f953a93a2",
    disabled: false,
    craftingSystemDetails: new CraftingSystemDetails({
        name: "Test system two",
        summary: "Test system two is an embedded system",
        description: "Test system two is an embedded system used for test purposes only",
        author: "None"
    }),
    embedded: true,
});

export { testCraftingSystemTwo }