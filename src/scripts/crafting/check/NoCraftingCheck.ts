import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingCheck} from "./CraftingCheck";
import {CraftingCheckResult, NoCraftingCheckResult} from "./CraftingCheckResult";

class NoCraftingCheck implements CraftingCheck<Actor> {

    constructor() {}

    // @ts-ignore This no-op implementation does not need to use variables passed to the implementation of perform
    perform(actor:Actor, components: Combination<CraftingComponent>): CraftingCheckResult {
        return new NoCraftingCheckResult();
    }

}

export {NoCraftingCheck};