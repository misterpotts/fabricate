import {Identifiable} from "../../common/Identifiable";
import {Serializable} from "../../common/Serializable";
import {Combination} from "../../common/Combination";
import {ComponentReference} from "./ComponentReference";
import {Unit} from "../../common/Unit";

interface SalvageOptionConfig {
    name: string;
    results: Record<string, number>;
    catalysts: Record<string, number>;
}

export { SalvageOptionConfig };

interface SalvageOptionJson {
    id: string;
    name: string;
    results: Record<string, number>;
    catalysts: Record<string, number>;
}

export { SalvageOptionJson };

class SalvageOption implements Identifiable, Serializable<SalvageOptionJson> {

    private readonly _id: string;
    private _name: string;
    private _results: Combination<ComponentReference>;
    private _catalysts: Combination<ComponentReference>;

    constructor({
        id,
        name,
        results,
        catalysts = Combination.EMPTY()
    }: {
        id: string;
        name: string;
        results: Combination<ComponentReference>;
        catalysts?: Combination<ComponentReference>;
    }) {
        this._id = id;
        this._name = name;
        this._results = results;
        this._catalysts = catalysts;
    }

    get results(): Combination<ComponentReference> {
        return this._results;
    }

    get hasResults(): boolean {
        return !this._results.isEmpty();
    }

    set results(value: Combination<ComponentReference>) {
        this._results = value;
    }

    get catalysts(): Combination<ComponentReference> {
        return this._catalysts;
    }

    get requiresCatalysts(): boolean {
        return !this._catalysts.isEmpty();
    }

    set catalysts(value: Combination<ComponentReference>) {
        this._catalysts = value;
    }

    set name(value: string) {
        this._name = value;
    }

    get isEmpty(): boolean {
        return this._results.isEmpty() && this._catalysts.isEmpty();
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._id;
    }

    toJson(): SalvageOptionJson {
        return {
            id: this._id,
            name: this._name,
            results: this._results.toJson(),
            catalysts: this._catalysts.toJson()
        };
    }

    static fromJson(salvageOptionJson: SalvageOptionJson): SalvageOption {
        try {
            return new SalvageOption({
                id: salvageOptionJson.id,
                name: salvageOptionJson.name,
                results: Combination.fromRecord(salvageOptionJson.results, ComponentReference.fromComponentId),
                catalysts: Combination.fromRecord(salvageOptionJson.catalysts, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build result option ${salvageOptionJson.name}`, {cause});
        }
    }

    without(componentId: string): SalvageOption {
        return new SalvageOption({
            id: this._id,
            name: this._name,
            results: this._results.without(componentId),
            catalysts: this._catalysts.without(componentId)
        });
    }

    addResult(componentId: string, quantity: number = 1) {
        this._results = this._results.addUnit(new Unit(new ComponentReference(componentId), quantity));
    }

    subtractResult(componentId: string, quantity: number = 1) {
        this._results = this._results.subtractUnit(new Unit(new ComponentReference(componentId), quantity));
    }

    addCatalyst(componentId: string, number: number = 1) {
        this._catalysts = this._catalysts.addUnit(new Unit(new ComponentReference(componentId), number));
    }

    subtractCatalyst(componentId: string, number: number = 1) {
        this._catalysts = this._catalysts.subtractUnit(new Unit(new ComponentReference(componentId), number));
    }

}

export { SalvageOption };