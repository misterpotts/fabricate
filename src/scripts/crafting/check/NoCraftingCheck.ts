import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingCheck} from "./CraftingCheck";
import {CraftingCheckResult} from "./CraftingCheckResult";
import {NoCraftingCheckResult} from "./NoCraftingCheckResult";

class NoCraftingCheck implements CraftingCheck<Actor> {

    // @ts-ignore This no-op implementation does not need to use variables passed to the implementation of perform
    perform(actor: Actor, components: Combination<CraftingComponent>): CraftingCheckResult {
        return new NoCraftingCheckResult();
    }

}

export {NoCraftingCheck};