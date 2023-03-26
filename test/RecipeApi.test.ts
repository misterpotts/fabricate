import {test, describe} from "@jest/globals";
import {DefaultRecipeApi} from "../src/scripts/api/RecipeApi"
import {StubCraftingSystemApi} from "./stubs/api/StubCraftingSystemApi";

describe("Create", () => {

    test("should create a new recipe", () => {

        const craftingSystemApi = new StubCraftingSystemApi();
        const essenceApi = new StubEssenceApi();
        const underTest = new DefaultRecipeApi({
            craftingSystemApi,
            essenceApi,
            componentApi,
            localizationService,
            notifications,
            settingManager
        });

    });

    test("should save a recipe when the crafting system exists", () => {

    });

    test("should not save a recipe when the crafting system doesn't exist", () => {

    });

    test("should not save a recipe when id is not unique", () => {

    });

    test("should not save a recipe when the recipe is invalid", () => {

    });

});

describe("Access", () => {



});

describe("Edit", () => {



});

describe("Delete", () => {



});