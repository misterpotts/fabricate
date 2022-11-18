import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

interface AlchemicalCombination {

    applyToItemData(itemData: ItemData): ItemData;

}

interface AlchemicalCombiner<T extends AlchemicalCombination> {

    mix(effects: AlchemicalEffect<T>[]): T;

}

interface AlchemicalEffect<C extends AlchemicalCombination> {

    mixInto(combination: C): C;

    describe(): string;

}

class NoAlchemicalCombination implements AlchemicalCombination {

    applyToItemData(itemData: ItemData): ItemData {
        return itemData;
    }

}

class NoAlchemicalEffect implements AlchemicalEffect<NoAlchemicalCombination> {

    mixInto(combination: NoAlchemicalCombination): NoAlchemicalCombination {
        return combination;
    }

    describe(): string {
        return "No effect. ";
    }

}

export { AlchemicalEffect, NoAlchemicalEffect, NoAlchemicalCombination, AlchemicalCombination, AlchemicalCombiner }