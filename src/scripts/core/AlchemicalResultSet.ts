import {AlchemicalResult} from "./AlchemicalResult";
import {FabricationHelper} from "./FabricationHelper";

class AlchemicalResultSet<T> {
    private readonly _resultsByCombinationIdentity: Map<number, AlchemicalResult<T>> = new Map();
    private readonly _essenceIdentities: Map<string, number> = new Map();

    constructor(builder: AlchemicalResultSet.Builder<T>) {
        const alchemicalResults = builder.results;
        const uniqueEssences: string[] = alchemicalResults.map((result: AlchemicalResult<T>) => result.essenceCombination)
            .reduce((left: string[], right: string[]) => left.concat(right), [])
            .filter((essence: string, index: number, collection: string[]) => collection.indexOf(essence) === index);
        this._essenceIdentities = FabricationHelper.assignEssenceIdentities(uniqueEssences);
        alchemicalResults.forEach((result: AlchemicalResult<T>) => {
            const essenceCombinationIdentity = FabricationHelper.essenceCombinationIdentity(result.essenceCombination, this._essenceIdentities);
            if (this._resultsByCombinationIdentity.has(essenceCombinationIdentity)) {
                throw new Error(`The combination ${(result.essenceCombination)} was duplicated. Each essence combination must map to a unique effect.`);
            }
            this._resultsByCombinationIdentity.set(essenceCombinationIdentity, result);
        });
    }

    public static builder<T>():AlchemicalResultSet.Builder<T> {
        return new AlchemicalResultSet.Builder<T>();
    }

    public getByEssenceCombination(essenceCombination: string[]): AlchemicalResult<T> {
        const identity = FabricationHelper.essenceCombinationIdentity(essenceCombination, this._essenceIdentities);
        return this._resultsByCombinationIdentity.get(identity);
    }
}

namespace AlchemicalResultSet {

    export class Builder<T> {

        public results: AlchemicalResult<T>[] = [];

        public withResult(value: AlchemicalResult<T>): Builder<T> {
            this.results.push(value);
            return this;
        }

        public withResults(value: AlchemicalResult<T>[]): Builder<T> {
            this.results.push(...value);
            return this;
        }

        public build(): AlchemicalResultSet<T> {
            return new AlchemicalResultSet(this);
        }

    }

}

export {AlchemicalResultSet}