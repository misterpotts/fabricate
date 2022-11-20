import {ComponentSelectionStrategy} from "./ComponentSelectionStrategy";
import {Recipe} from "../Recipe";
import {Combination, StringIdentity, Unit} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelection} from "../../component/ComponentSelection";
import {IncompleteComponentSelection} from "../../component/IncompleteComponentSelection";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {CompleteComponentSelection} from "../../component/CompleteComponentSelection";
import {PartDictionary} from "../../system/PartDictionary";

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    private readonly _partDictionary: PartDictionary;

    constructor(partDictionary: PartDictionary) {
        this._partDictionary = partDictionary;
    }

    perform(recipe: Recipe, availableComponents: Combination<CraftingComponent>): ComponentSelection {

        // todo: refactor
        //      combination needs a subtract by id method
        //      components and recipes and essences in, id's out
        //      stop all the duplicate mapping calls

        const availableComponentIdentities = availableComponents.flatten();
        const namedComponentsSatisfied = recipe.getSelectedIngredients().isIn(availableComponentIdentities);

        if (!namedComponentsSatisfied) {
            return new IncompleteComponentSelection();
        }

        const remainingComponentIdentities: Combination<StringIdentity> = availableComponentIdentities.subtract(recipe.getSelectedIngredients());
        const availableEssenceIdentities = remainingComponentIdentities.explode(component => this._partDictionary.getComponent(component.id).essences);
        const essencesSatisfied = recipe.essences.isIn(availableEssenceIdentities);
        if (!essencesSatisfied) {
            return new IncompleteComponentSelection();
        }

        const essenceSelection = new EssenceSelection(recipe.essences);
        const remainingComponents = Combination.ofUnits(remainingComponentIdentities.units.map(unit => new Unit(this._partDictionary.getComponent(unit.part.id), unit.quantity)));
        const essenceContribution: Combination<StringIdentity> = essenceSelection.perform(remainingComponents).flatten();

        const selectedComponents = recipe.getSelectedIngredients().combineWith(essenceContribution);

        return new CompleteComponentSelection({
            components: Combination.ofUnits(selectedComponents.units.map(unit => new Unit(this._partDictionary.getComponent(unit.part.id), unit.quantity)))
        });

    }

}

export {DefaultComponentSelectionStrategy}