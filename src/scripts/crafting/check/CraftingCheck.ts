import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingCheckResult} from "./CraftingCheckResult";

interface CraftingCheckSpecification {
    essenceContribution?: number;
    ingredientContribution?: number;
    exceedThreshold: boolean,
    baseThreshold: number,
    consumeComponentsOnFailure: boolean
}

interface CraftingCheck<A extends Actor> {
    perform(actor: A, components: Combination<CraftingComponent>): CraftingCheckResult;
}

export {CraftingCheck, CraftingCheckSpecification}