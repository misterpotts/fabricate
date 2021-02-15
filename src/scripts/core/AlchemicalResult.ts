import {CompendiumEntry} from "../game/CompendiumData";

interface ItemEffect<T> {
    applyTo(itemData: T): void;
}

interface ItemEffectModifier<T> {
    transform(itemEffect: ItemEffect<T>): ItemEffect<T>;
    matches(itemEffect: ItemEffect<T>): boolean;
}

interface AlchemicalResult<T> {
    essenceCombination: string[];
    description: string;
    resultantItem: CompendiumEntry;
    asItemData(): T;
    combineWith(other: AlchemicalResult<T>): AlchemicalResult<T>;
    effects: ItemEffect<T>[];
    effectModifiers: ItemEffectModifier<T>[];
}

export {AlchemicalResult, ItemEffect, ItemEffectModifier}