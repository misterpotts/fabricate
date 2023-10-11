import {CraftingSystem} from "../../crafting/system/CraftingSystem";
import {Recipe} from "../../crafting/recipe/Recipe";
import {Component} from "../../crafting/component/Component";
import {Essence} from "../../crafting/essence/Essence";

interface EmbeddedCraftingSystemDefinition {

    readonly supportedGameSystem: string;
    readonly craftingSystem: CraftingSystem;
    readonly essences: Essence[];
    readonly components: Component[];
    readonly recipes: Recipe[];

}

export { EmbeddedCraftingSystemDefinition }