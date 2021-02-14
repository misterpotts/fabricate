import {CompendiumEntry} from "./core/CompendiumData";

interface AlchemicalResult<T> {
    essenceCombination: string[];
    description: string;
    resultantItem: CompendiumEntry;
    asItemData(): T;
}

export {AlchemicalResult}