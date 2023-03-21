import {Identifiable, Serializable} from "../common/Identity";

export interface Dictionary<J, I extends Identifiable & Serializable<J>> {

    loadAll(): Promise<I[]>;

    loadById(id: string): Promise<I>;

    sourceData: Record<string, J>;
    isLoaded: boolean;

    getById(id: string): I;

    getAll(): Map<string, I>;

    toJson(): Record<string, J>;

    contains(id: string): boolean;

    size: number;
    isEmpty: boolean;

    insert(item: I): void;

    hasErrors: boolean;
    entriesWithErrors: I[];

    deleteById(id: string): void;

}