export interface RollProvider<A extends Actor> {

    getForActor(actor: A): Roll;

    fromExpression(expression: string): Roll;

}