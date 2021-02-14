import {AlchemicalResult} from "./AlchemicalResult";
import {FabricationHelper} from "./FabricationHelper";

class AlchemicalResultSet {
    private readonly _resultsByCombinationIdentity: Map<number, AlchemicalResult> = new Map();
    private readonly _essenceIdentities: Map<string, number> = new Map();

    constructor(builder: AlchemicalResultSet.Builder) {
        const alchemicalResults = builder.results;
        const uniqueEssences: string[] = alchemicalResults.map((result: AlchemicalResult) => result.essenceCombination)
            .reduce((left: string[], right: string[]) => left.concat(right), [])
            .filter((essence: string, index: number, collection: string[]) => collection.indexOf(essence) === index);
        this._essenceIdentities = FabricationHelper.assignEssenceIdentities(uniqueEssences);
        alchemicalResults.forEach((result: AlchemicalResult) => {
            const essenceCombinationIdentity = FabricationHelper.essenceCombinationIdentity(result.essenceCombination, this._essenceIdentities);
            if (this._resultsByCombinationIdentity.has(essenceCombinationIdentity)) {
                throw new Error(`The combination ${(result.essenceCombination)} was duplicated. Each essence combination must map to a unique effect.`);
            }
            this._resultsByCombinationIdentity.set(essenceCombinationIdentity, result);
        });
    }

    public static builder():AlchemicalResultSet.Builder {
        return new AlchemicalResultSet.Builder();
    }

    public getByEssenceCombination(essenceCombination: string[]): AlchemicalResult {
        const identity = FabricationHelper.essenceCombinationIdentity(essenceCombination, this._essenceIdentities);
        return this._resultsByCombinationIdentity.get(identity);
    }
}

namespace AlchemicalResultSet {

    export class Builder {

        public results: AlchemicalResult[] = [];

        public withResult(value: AlchemicalResult): Builder {
            this.results.push(value);
            return this;
        }

        public withResults(value: AlchemicalResult[]): Builder {
            this.results.push(...value);
            return this;
        }

        public build(): AlchemicalResultSet {
            return new AlchemicalResultSet(this);
        }

    }

}

export {AlchemicalResultSet}