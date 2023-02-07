import {FabricateApplicationAction} from "../FabricateApplicationAction";

class OpenRecipeManagerAction implements FabricateApplicationAction<void> {

    private static _id: string = "editRecipe";

    get id(): string {
        return OpenRecipeManagerAction._id;
    }

    perform(_data: Map<string, string>): Promise<void> {
        return Promise.resolve(undefined);
    }

}

export { OpenRecipeManagerAction }