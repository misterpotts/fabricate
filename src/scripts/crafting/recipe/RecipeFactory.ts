import {DefaultRecipe, Recipe, RecipeJson} from "./Recipe";
import {DefaultDocumentManager, DocumentManager} from "../../foundry/DocumentManager";
import {EntityFactory} from "../../repository/EntityFactory";
import {Requirement, RequirementJson, RequirementOptionJson} from "./Requirement";
import {Result, ResultJson, ResultOptionJson} from "./Result";
import {DefaultSerializableOption, DefaultSerializableOptions, SerializableOptions} from "../../common/Options";

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

    private buildRequirementOptions(requirementOptionsJson: Record<string, RequirementOptionJson>): SerializableOptions<RequirementJson, Requirement> {
        const options = Object.values(requirementOptionsJson)
            .map(json => new DefaultSerializableOption({
                id: json.id,
                name: json.name,
                value: Requirement.fromJson({
                    catalysts: json.catalysts,
                    ingredients: json.ingredients,
                    essences: json.essences
                })
            }));
        return new DefaultSerializableOptions<RequirementJson, Requirement>(options);
    }

    private buildResultOptions(resultOptionsJson: Record<string, ResultOptionJson>): SerializableOptions<ResultJson, Result> {
        const options = Object.values(resultOptionsJson)
            .map(json => new DefaultSerializableOption({
                id: json.id,
                name: json.name,
                value: Result.fromJson({ products: json.results })
            }));
        return new DefaultSerializableOptions<ResultJson, Result>(options);
    }

}

export { RecipeFactory }