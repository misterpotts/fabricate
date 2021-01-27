import {CraftingSystem} from "../core/CraftingSystem";
import TestSystem from "./TestSystem";

const systems: CraftingSystem[] = [];
systems.push(TestSystem);

export {systems as default, TestSystem}