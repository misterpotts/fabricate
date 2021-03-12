import {EssenceCombiner} from "../core/EssenceCombiner";
import {AlchemicalEffect, AlchemicalEffect5E} from "../core/AlchemicalEffect";

class EssenceCombiner5e extends EssenceCombiner<AlchemicalEffect<ItemData5e>, ItemData5e>{

    constructor(builder: EssenceCombiner5e.Builder) {
        super(builder.maxComponents, builder.maxEssences, builder.effects, builder.baseItem);
    }

    public static builder() {
        return new EssenceCombiner5e.Builder();
    }

    applyEffectsToBaseItem(effects: AlchemicalEffect5E[], baseItem: Entity<ItemData5e>): Entity<ItemData5e> {
        return undefined;
    }

    protected orderAlchemicalEffects(effects: AlchemicalEffect5E[]): AlchemicalEffect5E[] {
        return undefined;
    }

}

namespace EssenceCombiner5e {

    export class Builder extends EssenceCombiner.Builder<AlchemicalEffect5E, ItemData5e> {

        build(): EssenceCombiner5e {
            return new EssenceCombiner5e(this);
        }

    }

}

export {EssenceCombiner5e}