import {CraftingCheck} from "../check/CraftingCheck";
import {AlchemyResult} from "./AlchemyResult";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";

interface AlchemyAttemptFactory {

    make(baseComponent: CraftingComponent, componentSelection: Combination<CraftingComponent>): AlchemyAttempt;
}

interface AlchemyAttempt {

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult;
}

export {AlchemyAttempt, AlchemyAttemptFactory}