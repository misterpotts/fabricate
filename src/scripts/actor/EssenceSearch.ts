import {ComponentSearch} from "./ComponentSearch";
import {Combination} from "../common/Combination";
import {Essence} from "../common/Essence";
import {CraftingComponent} from "../common/CraftingComponent";

export class EssenceSearch implements ComponentSearch {
    private readonly _essences: Combination<Essence>;

    constructor(essences: Combination<Essence>) {
        this._essences = essences;
    }

    public perform(contents: Combination<CraftingComponent>): boolean {
        let remaining: Combination<Essence> = this._essences.clone();
        if (remaining.isEmpty()) {
            return true;
        }
        for (const component of contents.members) {
            if (!component.essences.isEmpty()) {
                const essenceAmount: Combination<Essence> = component.essences.multiply(contents.amountFor(component));
                remaining = remaining.subtract(essenceAmount);
            }
            if (remaining.isEmpty()) {
                return true;
            }
        }
        return false;
    }

}