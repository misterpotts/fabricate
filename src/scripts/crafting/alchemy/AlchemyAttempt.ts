import {CraftingCheck} from "../check/CraftingCheck";
import {AlchemyResult} from "./AlchemyResult";
import {AlchemicalCombiner} from "./AlchemicalCombiner";
 
interface AlchemyAttempt<D> {

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult<D>;

}

class WastefulAlchemyAttempt<D> implements AlchemyAttempt<D> {

    private readonly _alchemicalCombiner: AlchemicalCombiner<D>;

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult<D> {
        return undefined;
    }

}

class GenerousAlchemyAttempt<D> implements AlchemyAttempt<D> {

    private readonly _alchemicalCombiner: AlchemicalCombiner<D>;

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult<D> {
        return undefined;
    }

}

export {AlchemyAttempt, WastefulAlchemyAttempt, GenerousAlchemyAttempt}