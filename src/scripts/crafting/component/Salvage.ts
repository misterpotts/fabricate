import {Serializable} from "../../common/Serializable";
import {Combination, DefaultCombination} from "../../common/Combination";
import {ComponentReference} from "./ComponentReference";
import {DefaultUnit} from "../../common/Unit";

/**
 * todo: BREAKING remove this interface and perform data migration
 */
interface SalvageOptionJson extends SalvageJson {

    id : string;

    name: string;

}

export { SalvageOptionJson };

/**
 * todo: BREAKING rename results to products and perform data migration
 */
interface SalvageJson {

    results: Record<string, number>;

    catalysts: Record<string, number>;

}

export { SalvageJson };

class Salvage implements Serializable<SalvageJson> {

    private _products: Combination<ComponentReference>;
    private _catalysts: Combination<ComponentReference>;

    constructor({
        products = DefaultCombination.EMPTY(),
        catalysts = DefaultCombination.EMPTY()
    }: {
        products?: Combination<ComponentReference>;
        catalysts?: Combination<ComponentReference>;
    } = {}) {
        this._products = products;
        this._catalysts = catalysts;
    }

    get products(): Combination<ComponentReference> {
        return this._products;
    }

    get hasProducts(): boolean {
        return !this._products.isEmpty();
    }

    set products(value: Combination<ComponentReference>) {
        this._products = value;
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
        return this._products.isEmpty() && this._catalysts.isEmpty();
    }

    toJson(): SalvageJson {
        return {
            results: this._products.toJson(),
            catalysts: this._catalysts.toJson()
        };
    }

    static fromJson(salvageOptionJson: SalvageJson): Salvage {
        try {
            return new Salvage({
                products: DefaultCombination.fromRecord(salvageOptionJson.results, ComponentReference.fromComponentId),
                catalysts: DefaultCombination.fromRecord(salvageOptionJson.catalysts, ComponentReference.fromComponentId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build result option`, {cause});
        }
    }

    without(componentId: string): Salvage {
        return new Salvage({
            products: this._products.without(componentId),
            catalysts: this._catalysts.without(componentId)
        });
    }

    addProduct(componentId: string, quantity: number = 1) {
        this._products = this._products.addUnit(new DefaultUnit(new ComponentReference(componentId), quantity));
    }

    subtractProduct(componentId: string, quantity: number = 1) {
        this._products = this._products.subtractUnit(new DefaultUnit(new ComponentReference(componentId), quantity));
    }

    addCatalyst(componentId: string, number: number = 1) {
        this._catalysts = this._catalysts.addUnit(new DefaultUnit(new ComponentReference(componentId), number));
    }

    subtractCatalyst(componentId: string, number: number = 1) {
        this._catalysts = this._catalysts.subtractUnit(new DefaultUnit(new ComponentReference(componentId), number));
    }

}

export { Salvage };