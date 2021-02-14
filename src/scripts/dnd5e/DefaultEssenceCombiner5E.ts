import {AbstractEssenceCombiner, AlchemicalResult} from "../core/EssenceCombiner";
import {AlchemicalResultSet} from "../AlchemicalResultSet";
import {CompendiumEntry} from "../core/CompendiumData";

class DefaultEssenceCombiner5E extends AbstractEssenceCombiner {

    constructor(builder: DefaultEssenceCombiner5E.Builder) {
        super(builder.maxComponents, builder.maxEssences, builder.knownAlchemicalResults);
    }

    public static builder(): DefaultEssenceCombiner5E.Builder {
        return new DefaultEssenceCombiner5E.Builder()
    }

    combineAlchemicalResults(effects: AlchemicalResult[]): AlchemicalResult {
        return effects[0];
    }

    getCompendiumItemFor(result: AlchemicalResult): CompendiumEntry {
        return result.resultantItem;
    }

}

namespace DefaultEssenceCombiner5E {

    export class Builder {
        public maxEssences: number;
        public maxComponents: number;
        public knownAlchemicalResults: AlchemicalResultSet;

        public withMaxEssences(value: number): Builder {
            this.maxEssences = value;
            return this;
        }

        public withMaxComponents(value: number): Builder {
            this.maxComponents = value;
            return this;
        }

        public withKnownAlchemicalResults(value: AlchemicalResultSet): Builder {
            this.knownAlchemicalResults = value;
            return this;
        }

        public build(): DefaultEssenceCombiner5E {
            return new DefaultEssenceCombiner5E(this);
        }

    }

}

export {DefaultEssenceCombiner5E}