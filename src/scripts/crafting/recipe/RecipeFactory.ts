import {EntityFactory} from "../../api/EntityFactory";
import {Recipe, RecipeJson, RequirementOption, RequirementOptionJson, ResultOption, ResultOptionJson} from "./Recipe";
import {DefaultDocumentManager, DocumentManager} from "../../foundry/DocumentManager";
import {Essence} from "../essence/Essence";
import {Component} from "../component/Component";
import {Combination} from "../../common/Combination";
import {SelectableOptions} from "./SelectableOptions";

class RecipeFactory implements EntityFactory<RecipeJson, Recipe> {

    private readonly documentManager: DocumentManager;
    private readonly essences: Map<string, Essence>;
    private readonly components: Map<string, Component>;

    constructor({
        documentManager = new DefaultDocumentManager(),
        essences = new Map(),
        components = new Map(),
    }: {
        documentManager?: DocumentManager;
        essences?: Map<string, Essence>;
        components?: Map<string, Component>;
    } = {}) {
        this.documentManager = documentManager;
        this.essences = essences;
        this.components = components;
    }

    addEssence(essence: Essence): void {
        this.essences.set(essence.id, essence);
    }

    addComponent(component: Component): void {
        this.components.set(component.id, component);
    }

    make(recipeJson: RecipeJson): Recipe {
        const { id, craftingSystemId, disabled, itemUuid } = recipeJson;
        const itemData = this.documentManager.prepareItemDataByDocumentUuid(itemUuid);
        try {
            return new Recipe({
                id,
                craftingSystemId,
                itemData,
                disabled,
                requirementOptions: this.buildIngredientOptions(recipeJson.requirementOptions, this.components),
                resultOptions: this.buildResultOptions(recipeJson.resultOptions, this.components),
                essences: Combination.fromRecord(recipeJson.essences, this.essences)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`Unable to build recipe ${id}`, { cause });
        }
    }

    private buildIngredientOptions(ingredientOptionsJson: RequirementOptionJson[], components: Map<string, Component>): SelectableOptions<RequirementOptionJson, RequirementOption> {
        const options = ingredientOptionsJson
            .map(json => RequirementOption.fromJson(json, components));
        return new SelectableOptions<RequirementOptionJson, RequirementOption>({ options });
    }

    private buildResultOptions(resultOptionsJson: ResultOptionJson[], components: Map<string, Component>): SelectableOptions<ResultOptionJson, ResultOption> {
        const options = resultOptionsJson
            .map(json => ResultOption.fromJson(json, components));
        return new SelectableOptions<ResultOptionJson, ResultOption>({ options });
    }

}

export { RecipeFactory }