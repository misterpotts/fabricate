import {GameSystem} from "../../system/GameSystem";

interface ModifierCalculator<A extends Actor> {

    calculate(actor: A): RollTerm;

}

interface RollProviderFactory<A extends Actor> {

    gameSystem: GameSystem;

    make(modifierCalculators: ModifierCalculator<A>[]): RollProvider<A>;

}

interface RollProvider<A extends Actor> {

    getForActor(actor: A): Roll;

    fromExpression(expression: string): Roll;

}

export { RollProviderFactory, RollProvider, ModifierCalculator }