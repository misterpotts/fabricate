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
        salvage,
        catalysts = Combination.EMPTY()
    }: {
        id: string;
        name: string;
        salvage: Combination<ComponentReference>;
        catalysts?: Combination<ComponentReference>;
    }) {
        this._id = id;
        this._name = name;
        this._results = salvage;
        this._catalysts = catalysts;
    }

    get results(): Combination<ComponentReference> {
        return this._results;
    }

    set results(value: Combination<ComponentReference>) {
        this._results = value;
    }

    get catalysts(): Combination<ComponentReference> {
        return this._catalysts;
    }

    set catalysts(value: Combination<ComponentReference>) {
        this._catalysts = value;
    }

    set name(value: string) {
        this._name = value;
    }

    get isEmpty(): boolean {
        return this._results.isEmpty();
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._id;
    }

    public add(component: ComponentReference, quantity = 1) {
        this._results = this._results.addUnit(new Unit(component, quantity));
    }

    public subtract(component: ComponentReference, quantity = 1) {
        this._results = this._results.subtractUnit(new Unit(component, quantity));
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
        const salvage = Object.keys(salvageOptionJson.results)
            .map(componentId => {
                const reference = new ComponentReference(componentId);
                return new Unit(reference, salvageOptionJson.results[componentId]);
            });
        const catalysts = Object.keys(salvageOptionJson.catalysts)
            .map(componentId => {
                const reference = new ComponentReference(componentId);
                return new Unit(reference, salvageOptionJson.catalysts[componentId]);
            });
        return new SalvageOption({
            id: salvageOptionJson.id,
            name: salvageOptionJson.name,
            salvage: Combination.ofUnits(salvage),
            catalysts: Combination.ofUnits(catalysts)
        });
    }

    without(componentId: string): SalvageOption {
        return new SalvageOption({
            id: this._id,
            name: this._name,
            salvage: this._results.without(componentId),
            catalysts: this._catalysts.without(componentId)
        });
    }

    addResult(componentId: string, quantity: number) {
        this._results = this._results.addUnit(new Unit(new ComponentReference(componentId), quantity));
    }

    addCatalyst(componentId: string, number: number) {
        this._catalysts = this._catalysts.addUnit(new Unit(new ComponentReference(componentId), number));
    }

}

export { SalvageOption };