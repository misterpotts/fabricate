import {ApplicationWindow} from "./core/Applications";

interface RecipeManagerView {}

interface RecipeManagerModel {}

class RecipeManagerAppFactory {

    make(): ApplicationWindow<RecipeManagerView, RecipeManagerModel> {
        return new ApplicationWindow<RecipeManagerView, RecipeManagerModel>({});
    }

}

export default new RecipeManagerAppFactory();