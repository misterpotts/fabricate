import {CraftingSystem} from "../core/CraftingSystem.js";
import TestSystem from "./TestSystem.js";

const systems: CraftingSystem[] = [];
systems.push(TestSystem);

export {systems as default, TestSystem}