interface ModifierCalculator<A extends Actor> {

    calculate(actor: A): RollTerm;

}

interface RollModifierProviderFactory<A extends Actor> {

    make(craftingCheckSpecification?: any): GameSystemRollModifierProvider<A>; // todo: fix this any typing

}

interface GameSystemRollModifierProvider<A extends Actor> {

    getForActor(actor: A): RollTerm[];

}

export { RollModifierProviderFactory, GameSystemRollModifierProvider, ModifierCalculator }