import {AbstractEssenceCombiner, AlchemicalResult} from "../core/EssenceCombiner";
import {AlchemicalResultSet} from "../core/AlchemicalResultSet";
import {CompendiumEntry} from "../game/CompendiumData";
import {ItemData5e} from "../../global";

class DefaultEssenceCombiner5E extends AbstractEssenceCombiner<ItemData5e> {

    constructor(builder: DefaultEssenceCombiner5E.Builder) {
        super(builder.maxComponents, builder.maxEssences, builder.knownAlchemicalResults, builder.resultantItem);
    }

    public static builder(): DefaultEssenceCombiner5E.Builder {
        return new DefaultEssenceCombiner5E.Builder()
    }

    combineAlchemicalResults(effects: AlchemicalResult<ItemData5e>[]): AlchemicalResult<ItemData5e> {
        return effects.reduce((left, right) => left.combineWith(right));
    }

    getCompendiumItemFor(result: AlchemicalResult<ItemData5e>): CompendiumEntry {
        return result.resultantItem;
    }

}

namespace DefaultEssenceCombiner5E {

    export class Builder {
        public maxEssences: number;
        public maxComponents: number;
        public knownAlchemicalResults: AlchemicalResultSet<ItemData5e>;
        public resultantItem: CompendiumEntry;

        public withMaxEssences(value: number): Builder {
            this.maxEssences = value;
            return this;
        }

        public withMaxComponents(value: number): Builder {
            this.maxComponents = value;
            return this;
        }

        public withKnownAlchemicalResults(value: AlchemicalResultSet<ItemData5e>): Builder {
            this.knownAlchemicalResults = value;
            return this;
        }

        public withResultantItem(compendiumKey: string, entryId: string): Builder {
            this.resultantItem = {compendiumKey: compendiumKey, entryId: entryId};
            return this;
        }

        public build(): DefaultEssenceCombiner5E {
            return new DefaultEssenceCombiner5E(this);
        }

    }

}

export {DefaultEssenceCombiner5E}