import {Serializable} from "../../common/Serializable";
import {Combination, DefaultCombination} from "../../common/Combination";
import {ComponentReference} from "./ComponentReference";
import {DefaultUnit} from "../../common/Unit";

/**
 * todo: BREAKING remove this interface and perform data migration
 *
 * @deprecated Use OptionJson<SalvageJson> post data migration
 */
interface SalvageOptionJson extends SalvageJson {

    id : string;

    name: string;

}

export { SalvageOptionJson };

interface SalvageJson {

    results: Record<string, number>;

    catalysts: Record<string, number>;

}

export { SalvageJson };

class Salvage implements Serializable<SalvageJson> {

    private _results: Combination<ComponentReference>;
    private _catalysts: Combination<ComponentReference>;

    constructor({
        results,
        catalysts = DefaultCombination.EMPTY()
    }: {
        results: Combination<ComponentReference>;
        catalysts?: Combination<ComponentReference>;
    }) {
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

    get isEmpty(): boolean {
        return this._results.isEmpty() && this._catalysts.isEmpty();
    }

    toJson(): SalvageJson {
        return {
            results: this._results.toJson(),
            catalysts: this._catalysts.toJson()
        };
    }

    static fromJson(salvageOptionJson: SalvageJson): Salvage {
        try {
            return new Salvage({
                results: DefaultCombination.fromRecord(salvageOptionJson.results, ComponentReference.fromComponentId),
                catalysts: DefaultCombination.fromRecord(salvageOptionJson.catalysts, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build result option`, {cause});
        }
    }

    without(componentId: string): Salvage {
        return new Salvage({
            results: this._results.without(componentId),
            catalysts: this._catalysts.without(componentId)
        });
    }

    addResult(componentId: string, quantity: number = 1) {
        this._results = this._results.addUnit(new DefaultUnit(new ComponentReference(componentId), quantity));
    }

    subtractResult(componentId: string, quantity: number = 1) {
        this._results = this._results.subtractUnit(new DefaultUnit(new ComponentReference(componentId), quantity));
    }

    addCatalyst(componentId: string, number: number = 1) {
        this._catalysts = this._catalysts.addUnit(new DefaultUnit(new ComponentReference(componentId), number));
    }

    subtractCatalyst(componentId: string, number: number = 1) {
        this._catalysts = this._catalysts.subtractUnit(new DefaultUnit(new ComponentReference(componentId), number));
    }

}

export { Salvage };