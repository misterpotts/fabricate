import {EntityFactory} from "../../api/EntityFactory";
import {Recipe, RecipeJson, RequirementOption, RequirementOptionJson, ResultOption, ResultOptionJson} from "./Recipe";
import {DefaultDocumentManager, DocumentManager} from "../../foundry/DocumentManager";
import {Component} from "../component/Component";
import {Combination} from "../../common/Combination";
import {SelectableOptions} from "./SelectableOptions";
import {EssenceAPI} from "../../api/EssenceAPI";
import {ComponentAPI} from "../../api/ComponentAPI";
import {IdentityFactory} from "../../foundry/IdentityFactory";

class RecipeFactory implements EntityFactory<RecipeJson, Recipe> {

    private readonly documentManager: DocumentManager;
    private readonly essenceApi: EssenceAPI;
    private readonly componentApi: ComponentAPI;

    constructor({
        documentManager = new DefaultDocumentManager(),
        essenceApi,
        componentApi
    }: {
        documentManager?: DocumentManager;
        essenceApi: EssenceAPI;
        componentApi: ComponentAPI;
        identityFactory: IdentityFactory;
    }) {
        this.documentManager = documentManager;
        this.essenceApi = essenceApi;
        this.componentApi = componentApi;
    }

    async make(recipeJson: RecipeJson): Promise<Recipe> {
        const { id, craftingSystemId, disabled, itemUuid } = recipeJson;
        const itemData = this.documentManager.prepareItemDataByDocumentUuid(itemUuid);
        const essences = await this.essenceApi.getAllByCraftingSystemId(craftingSystemId);
        const components = await this.componentApi.getAllByCraftingSystemId(craftingSystemId);
        try {
            return new Recipe({
                id,
                craftingSystemId,
                itemData,
                disabled,
                requirementOptions: this.buildRequirementOptions(recipeJson.requirementOptions, components),
                resultOptions: this.buildResultOptions(recipeJson.resultOptions, components),
                essences: Combination.fromRecord(recipeJson.essences, essences)
            });
        } catch (e: any) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`Unable to build recipe ${id}`, { cause });
        }
    }

    private buildRequirementOptions(ingredientOptionsJson: RequirementOptionJson[], components: Map<string, Component>): SelectableOptions<RequirementOptionJson, RequirementOption> {
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