export interface RollProvider<A extends Actor> {

    getFor(actor: A): Roll;

}