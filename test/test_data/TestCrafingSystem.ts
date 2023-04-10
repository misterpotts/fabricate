import {UserDefinedCraftingSystem} from "../../src/scripts/system/CraftingSystem";
import {CraftingSystemDetails} from "../../src/scripts/system/CraftingSystemDetails";

const testCraftingSystem = new UserDefinedCraftingSystem({
    id: "c3d50462684c5d960f3fba9f953a93a1",
    enabled: true,
    craftingSystemDetails: new CraftingSystemDetails({
        name: "Test system",
        summary: "Test system",
        description: "Test system",
        author: "None"
    })
});

export { testCraftingSystem }