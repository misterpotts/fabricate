import {Serializable} from "../../common/Serializable";
import {Combination, DefaultCombination} from "../../common/Combination";
import {ComponentReference} from "../component/ComponentReference";
import {EssenceReference} from "../essence/EssenceReference";
import {DefaultUnit} from "../../common/Unit";

/**
 * todo: BREAKING remove this interface and perform data migration
 *
 * @deprecated Use OptionJson<RequirementJson> post data migration
 */
interface RequirementOptionJson extends RequirementJson {

    id: string;

    name: string;

}

export { RequirementOptionJson };

interface RequirementJson {

    catalysts: Record<string, number>;
    ingredients: Record<string, number>;
    essences: Record<string, number>;

}

class Requirement implements Serializable<RequirementJson> {

    private _catalysts: Combination<ComponentReference>;
    private _ingredients: Combination<ComponentReference>;
    private _essences: Combination<EssenceReference>;

    constructor({
        essences = DefaultCombination.EMPTY(),
        catalysts = DefaultCombination.EMPTY(),
        ingredients = DefaultCombination.EMPTY(),
    }: {
        essences?: Combination<EssenceReference>;
        catalysts?: Combination<ComponentReference>;
        ingredients?: Combination<ComponentReference>;
    } = {}) {
        this._essences = essences;
        this._catalysts = catalysts;
        this._ingredients = ingredients;
    }

    static EMPTY = new Requirement();

    get essences(): Combination<EssenceReference> {
        return this._essences;
    }

    set essences(value: Combination<EssenceReference>) {
        this._essences = value;
    }

    get requiresCatalysts(): boolean {
        return !this._catalysts.isEmpty();
    }

    get requiresIngredients(): boolean {
        return !this._ingredients.isEmpty();
    }

    get requiresEssences(): boolean {
        return !this._essences.isEmpty();
    }

    get isEmpty(): boolean {
        return this._catalysts.isEmpty() && this._ingredients.isEmpty() && this._essences.isEmpty();
    }

    set catalysts(value: Combination<ComponentReference>) {
        this._catalysts = value;
    }

    set ingredients(value: Combination<ComponentReference>) {
        this._ingredients = value;
    }

    get catalysts(): Combination<ComponentReference> {
        return this._catalysts;
    }

    get ingredients(): Combination<ComponentReference> {
        return this._ingredients;
    }

    public addCatalyst(componentId: string, amount = 1) {
        this._catalysts = this._catalysts.addUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtractCatalyst(componentId: string, amount = 1) {
        this._catalysts = this._catalysts.subtractUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public addIngredient(componentId: string, amount = 1) {
        this._ingredients = this._ingredients.addUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtractIngredient(componentId: string, amount = 1) {
        this._ingredients = this._ingredients.subtractUnit(new DefaultUnit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public addEssence(essenceId: string, amount = 1) {
        this._essences = this._essences.addUnit(new DefaultUnit<EssenceReference>(new EssenceReference(essenceId), amount));
    }

    public subtractEssence(essenceId: string, amount = 1) {
        this._essences = this._essences.subtractUnit(new DefaultUnit<EssenceReference>(new EssenceReference(essenceId), amount));
    }

    toJson(): RequirementJson {
        return {
            catalysts: this._catalysts.toJson(),
            ingredients: this._ingredients.toJson(),
            essences: this._essences.toJson()
        };
    }

    static fromJson(requirementOptionJson: RequirementJson): Requirement {
        try {
            return new Requirement({
                catalysts: DefaultCombination.fromRecord(requirementOptionJson.catalysts, ComponentReference.fromComponentId),
                ingredients: DefaultCombination.fromRecord(requirementOptionJson.ingredients, ComponentReference.fromComponentId),
                essences: DefaultCombination.fromRecord(requirementOptionJson.essences, EssenceReference.fromEssenceId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build requirement option`, {cause});
        }
    }

    clone({
        substituteEssenceIds = new Map(),
        substituteComponentIds = new Map(),
    }: {
        substituteEssenceIds: Map<string, string>;
        substituteComponentIds: Map<string, string>;
    }) {

        const catalysts = this._catalysts
            .map((catalystUnit) => {
                if (!substituteComponentIds.has(catalystUnit.element.id)) {
                    return catalystUnit;
                }
                const substituteId = substituteComponentIds.get(catalystUnit.element.id);
                return new DefaultUnit<ComponentReference>(new ComponentReference(substituteId), catalystUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), DefaultCombination.EMPTY<ComponentReference>());

        const ingredients = this._ingredients
            .map((ingredientUnit) => {
                if (!substituteComponentIds.has(ingredientUnit.element.id)) {
                    return ingredientUnit;
                }
                const substituteId = substituteComponentIds.get(ingredientUnit.element.id);
                return new DefaultUnit<ComponentReference>(new ComponentReference(substituteId), ingredientUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), DefaultCombination.EMPTY<ComponentReference>());

        const essences = this._essences
            .map((essenceUnit) => {
                if (!substituteEssenceIds.has(essenceUnit.element.id)) {
                    return essenceUnit;
                }
                const substituteId = substituteEssenceIds.get(essenceUnit.element.id);
                return new DefaultUnit<EssenceReference>(new EssenceReference(substituteId), essenceUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), DefaultCombination.EMPTY<EssenceReference>());

        return new Requirement({
            essences,
            catalysts,
            ingredients,
        });

    }

}

export {Requirement};
export {RequirementJson};