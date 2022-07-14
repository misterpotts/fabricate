export interface RollTermProvider<A extends Actor> {

    getFor(actor: A): DiceTerm.TermData;

}