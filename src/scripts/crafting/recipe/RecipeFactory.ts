import {Recipe, RecipeJson, RequirementOption, RequirementOptionJson, ResultOption, ResultOptionJson} from "./Recipe";
import {DefaultDocumentManager, DocumentManager} from "../../foundry/DocumentManager";
import {Combination} from "../../common/Combination";
import {SelectableOptions} from "./SelectableOptions";
import {EntityFactory} from "../../api/EntityFactory";
import {EssenceReference} from "../essence/EssenceReference";

class RecipeFactory implements EntityFactory<RecipeJson, Recipe> {

    private readonly documentManager: DocumentManager;

    constructor({
        documentManager = new DefaultDocumentManager()
    }: {
        documentManager?: DocumentManager;
    }) {
        this.documentManager = documentManager;
    }

    async make(recipeJson: RecipeJson): Promise<Recipe> {
        const { id, craftingSystemId, disabled, itemUuid } = recipeJson;
        const itemData = this.documentManager.prepareItemDataByDocumentUuid(itemUuid);
        try {
            return new Recipe({
                id,
                craftingSystemId,
                itemData,
                disabled,
                requirementOptions: this.buildRequirementOptions(recipeJson.requirementOptions),
                resultOptions: this.buildResultOptions(recipeJson.resultOptions),
                essences: Combination.fromRecord(recipeJson.essences, EssenceReference.fromEssenceId)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`Unable to build recipe ${id}`, { cause });
        }
    }

    private buildRequirementOptions(ingredientOptionsJson: RequirementOptionJson[]): SelectableOptions<RequirementOptionJson, RequirementOption> {
        const options = ingredientOptionsJson
            .map(json => RequirementOption.fromJson(json));
        return new SelectableOptions<RequirementOptionJson, RequirementOption>({ options });
    }

    private buildResultOptions(resultOptionsJson:ResultOptionJson[]): SelectableOptions<ResultOptionJson, ResultOption> {
        const options = resultOptionsJson
            .map(json => ResultOption.fromJson(json));
        return new SelectableOptions<ResultOptionJson, ResultOption>({ options });
    }

}

export { RecipeFactory }