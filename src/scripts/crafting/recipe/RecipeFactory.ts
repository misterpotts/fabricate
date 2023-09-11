import {DefaultRecipe, Recipe, RecipeJson} from "./Recipe";
import {DefaultDocumentManager, DocumentManager} from "../../foundry/DocumentManager";
import {SelectableOptions} from "../selection/SelectableOptions";
import {EntityFactory} from "../../repository/EntityFactory";
import {RequirementOption, RequirementOptionJson} from "./RequirementOption";
import {ResultOption, ResultOptionJson} from "./ResultOption";

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
            return new DefaultRecipe({
                id,
                craftingSystemId,
                itemData,
                disabled,
                requirementOptions: this.buildRequirementOptions(recipeJson.requirementOptions),
                resultOptions: this.buildResultOptions(recipeJson.resultOptions)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`Unable to build recipe ${id}`, { cause });
        }
    }

    private buildRequirementOptions(requirementOptionsJson: Record<string, RequirementOptionJson>): SelectableOptions<RequirementOptionJson, RequirementOption> {
        const options = Object.values(requirementOptionsJson)
            .map(json => RequirementOption.fromJson(json));
        return new SelectableOptions<RequirementOptionJson, RequirementOption>({ options });
    }

    private buildResultOptions(resultOptionsJson: Record<string, ResultOptionJson>): SelectableOptions<ResultOptionJson, ResultOption> {
        const options = Object.values(resultOptionsJson)
            .map(json => ResultOption.fromJson(json));
        return new SelectableOptions<ResultOptionJson, ResultOption>({ options });
    }

}

export { RecipeFactory }