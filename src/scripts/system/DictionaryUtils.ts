import {Identifiable} from "../common/Identity";
import {Combination} from "../common/Combination";

export const combinationFromRecord: <T extends Identifiable>(amounts: Record<string, number>, candidatesById: Map<string, T>) => Combination<T> = (amounts, candidatesById) => {
    if (!amounts) {
        return Combination.EMPTY();
    }
    return Object.keys(amounts)
        .map(id => {
            if (!candidatesById.has(id)) {
                throw new Error(`Unable to resolve ID ${id}. `);
            }
            return Combination.of(candidatesById.get(id), amounts[id]);
        })
        .reduce((left, right) => left.combineWith(right), Combination.EMPTY());
}