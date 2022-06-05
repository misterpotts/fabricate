import {ComponentSearch} from "./ComponentSearch";
import {Combination} from "../common/Combination";
import {EssenceDefinition} from "../common/EssenceDefinition";
import {CraftingComponent} from "../common/CraftingComponent";

export class EssenceSearch implements ComponentSearch {
    private readonly _essences: Combination<EssenceDefinition>;

    constructor(essences: Combination<EssenceDefinition>) {
        this._essences = essences;
    }

    public perform(contents: Combination<CraftingComponent>): boolean {
        let remaining: Combination<EssenceDefinition> = this._essences.clone();
        if (remaining.isEmpty()) {
            return true;
        }
        for (const component of contents.members) {
            if (!component.essences.isEmpty()) {
                const essenceAmount: Combination<EssenceDefinition> = component.essences.multiply(contents.amountFor(component));
                remaining = remaining.subtract(essenceAmount);
            }
            if (remaining.isEmpty()) {
                return true;
            }
        }
        return false;
    }

}