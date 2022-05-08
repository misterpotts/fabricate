import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {CraftingCheckResult} from "./CraftingCheckResult";
import {OutcomeType} from "../core/OutcomeType";

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

class NoCraftingCheck implements CraftingCheck<Actor> {

    // @ts-ignore This no-op implementation does not need to use variables passed to the implementation of perform
    perform(actor: Actor, components: Combination<CraftingComponent>): CraftingCheckResult {
        return new CraftingCheckResult(OutcomeType.NOT_ATTEMPTED, "", 0, 0);
    }

}

export {CraftingCheck, CraftingCheckSpecification, NoCraftingCheck}