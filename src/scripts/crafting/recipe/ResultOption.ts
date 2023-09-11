import {Identifiable} from "../../common/Identifiable";
import {Serializable} from "../../common/Serializable";
import {Combination, DefaultCombination} from "../../common/Combination";
import {ComponentReference} from "../component/ComponentReference";
import {DefaultUnit} from "../../common/Unit";

export interface ResultOptionConfig {

    id?: string;
    name: string;
    results: Record<string, number>;

}

interface ResultOptionJson {

    id: string;
    name: string;
    results: Record<string, number>;

}

class ResultOption implements Identifiable, Serializable<ResultOptionJson> {

    private _results: Combination<ComponentReference>;
    private readonly _id: string;
    private _name: string;

    constructor({
        id,
        name,
        results
    }: {
        id: string;
        name: string;
        results: Combination<ComponentReference>;
    }) {
        this._id = id;
        this._name = name;
        this._results = results;
    }

    get isEmpty(): boolean {
        return this._results.isEmpty();
    }

    get results(): Combination<ComponentReference> {
        return this._results;
    }

    set results(value: Combination<ComponentReference>) {
        this._results = value;
    }

    set name(value: string) {
        this._name = value;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._id;
    }

    public add(componentId: string, amount = 1) {
        this._results = this._results.addUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtract(componentId: string, amount = 1) {
        this._results = this._results.subtractUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    toJson(): ResultOptionJson {
        return {
            id: this._id,
            name: this._name,
            results: this._results.toJson()
        }
    }

    static fromJson(resultOptionJson: ResultOptionJson) {
        try {
            return new ResultOption({
                id: resultOptionJson.id,
                name: resultOptionJson.name,
                results: DefaultCombination.fromRecord(resultOptionJson.results, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build result option ${resultOptionJson.name}`, {cause});
        }
    }

    clone({ substituteComponentIds = new Map() }: { substituteComponentIds?: Map<string, string> }) {
        const results= this._results
            .map((resultUnit) => {
                if (!substituteComponentIds.has(resultUnit.element.id)) {
                    return resultUnit;
                }
                const substituteId = substituteComponentIds.get(resultUnit.element.id);
                return new DefaultUnit<ComponentReference>(new ComponentReference(substituteId), resultUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), DefaultCombination.EMPTY<ComponentReference>());
        return new ResultOption({
            results,
            id: this._id,
            name: this._name,
        });
    }

}

export {ResultOption};
export {ResultOptionJson};