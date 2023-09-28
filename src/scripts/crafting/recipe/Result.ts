import {Serializable} from "../../common/Serializable";
import {Combination, DefaultCombination} from "../../common/Combination";
import {ComponentReference} from "../component/ComponentReference";
import {DefaultUnit} from "../../common/Unit";

/**
 * todo: BREAKING remove this interface and perform data migration
 */
interface ResultOptionJson {

    id: string;

    name: string;

    results: Record<string, number>;

}

export { ResultOptionJson };

interface ResultJson {

    products: Record<string, number>;

}

class Result implements Serializable<ResultJson> {

    private _products: Combination<ComponentReference>;

    constructor({
        products = DefaultCombination.EMPTY<ComponentReference>(),
    }: {
        products: Combination<ComponentReference>;
    }) {
        this._products = products;
    }

    get isEmpty(): boolean {
        return this._products.isEmpty();
    }

    get products(): Combination<ComponentReference> {
        return this._products;
    }

    set products(value: Combination<ComponentReference>) {
        this._products = value;
    }

    public add(componentId: string, amount = 1) {
        this._products = this._products.addUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtract(componentId: string, amount = 1) {
        this._products = this._products.subtractUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    toJson(): ResultJson {
        return {
            products: this._products.toJson()
        }
    }

    static fromJson(resultOptionJson: ResultJson) {
        try {
            return new Result({
                products: DefaultCombination.fromRecord(resultOptionJson.products, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build result option`, {cause});
        }
    }

    clone({ substituteComponentIds = new Map() }: { substituteComponentIds?: Map<string, string> }) {
        const producedComponents= this._products
            .map((resultUnit) => {
                if (!substituteComponentIds.has(resultUnit.element.id)) {
                    return resultUnit;
                }
                const substituteId = substituteComponentIds.get(resultUnit.element.id);
                return new DefaultUnit<ComponentReference>(new ComponentReference(substituteId), resultUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), DefaultCombination.EMPTY<ComponentReference>());
        return new Result({
            products: producedComponents,
        });
    }

}

export {Result};
export {ResultJson};