import {Identifiable} from "../../common/Identifiable";
import {Serializable} from "../../common/Serializable";
import {Combination} from "../../common/Combination";
import {ComponentReference} from "../component/ComponentReference";
import {EssenceReference} from "../essence/EssenceReference";
import {Unit} from "../../common/Unit";

interface RequirementOptionConfig {
    name: string,
    catalysts?: Record<string, number>;
    ingredients?: Record<string, number>;
    essences?: Record<string, number>;
}

interface RequirementOptionJson {
    id: string,
    name: string,
    catalysts: Record<string, number>;
    ingredients: Record<string, number>;
    essences: Record<string, number>;
}

class RequirementOption implements Identifiable, Serializable<RequirementOptionJson> {

    private readonly _id: string;
    private _name: string;
    private _catalysts: Combination<ComponentReference>;
    private _ingredients: Combination<ComponentReference>;
    private _essences: Combination<EssenceReference>;

    constructor({
        id,
        name,
        essences = Combination.EMPTY(),
        catalysts = Combination.EMPTY(),
        ingredients = Combination.EMPTY(),
    }: {
        id: string;
        name: string;
        essences?: Combination<EssenceReference>;
        catalysts?: Combination<ComponentReference>;
        ingredients?: Combination<ComponentReference>;
    }) {
        this._id = id;
        this._name = name;
        this._essences = essences;
        this._catalysts = catalysts;
        this._ingredients = ingredients;
    }

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

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): string {
        return this._id;
    }

    public addCatalyst(componentId: string, amount = 1) {
        this._catalysts = this._catalysts.addUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtractCatalyst(componentId: string, amount = 1) {
        this._catalysts = this._catalysts.subtractUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public addIngredient(componentId: string, amount = 1) {
        this._ingredients = this._ingredients.addUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public subtractIngredient(componentId: string, amount = 1) {
        this._ingredients = this._ingredients.subtractUnit(new Unit<ComponentReference>(new ComponentReference(componentId), amount));
    }

    public addEssence(essenceId: string, amount = 1) {
        this._essences = this._essences.addUnit(new Unit<EssenceReference>(new EssenceReference(essenceId), amount));
    }

    public subtractEssence(essenceId: string, amount = 1) {
        this._essences = this._essences.subtractUnit(new Unit<EssenceReference>(new EssenceReference(essenceId), amount));
    }

    public get isEmpty(): boolean {
        return this._ingredients.isEmpty() && this._catalysts.isEmpty();
    }

    toJson(): RequirementOptionJson {
        return {
            id: this._id,
            name: this._name,
            catalysts: this._catalysts.toJson(),
            ingredients: this._ingredients.toJson(),
            essences: this._essences.toJson()
        };
    }

    static fromJson(requirementOptionJson: RequirementOptionJson): RequirementOption {
        try {
            return new RequirementOption({
                id: requirementOptionJson.id,
                name: requirementOptionJson.name,
                catalysts: Combination.fromRecord(requirementOptionJson.catalysts, ComponentReference.fromComponentId),
                ingredients: Combination.fromRecord(requirementOptionJson.ingredients, ComponentReference.fromComponentId),
                essences: Combination.fromRecord(requirementOptionJson.essences, EssenceReference.fromEssenceId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            throw new Error(`Unable to build requirement option ${requirementOptionJson.name}`, {cause});
        }
    }

}

export {RequirementOption};
export {RequirementOptionJson};
export {RequirementOptionConfig};