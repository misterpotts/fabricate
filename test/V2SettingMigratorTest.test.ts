import {describe, expect, test} from "@jest/globals";
import {V1ComponentJson, V1EssenceJson, V1RecipeJson} from "../src/scripts/system/versions/V1Json";
import {EssenceJson} from "../src/scripts/common/Essence";
import V1_CHILDS_PLAY_SYSTEM_DEFINITION from "./resources/V1ChildsPlaySystemSpec";
import {V2CraftingSystemSettingMigrator} from "../src/scripts/settings/migrators/V2CraftingSystemSettingMigrator";
import {CraftingComponentJson} from "../src/scripts/common/CraftingComponent";
import {RecipeJson} from "../src/scripts/common/Recipe";
import { V1_ALCHEMISTS_SUPPLIES_SYSTEM_DEFINITION } from "./resources/V1AlchemistsSuppliesSystemSpec";
import {ALCHEMISTS_SUPPLIES_SYSTEM_DATA} from "../src/scripts/system/definitions/AlchemistsSuppliesV16";

function expectEssenceMigrationSuccess(before: V1EssenceJson, allAfter: Record<string, EssenceJson>) {
    expect(allAfter[before.id]).not.toBeNull();
    const after = allAfter[before.id];
    expect(after.name).toEqual(before.name);
    expect(after.description).toEqual(before.description);
    expect(after.iconCode).toEqual(before.iconCode);
    expect(after.tooltip).toEqual(before.tooltip);
    expect(after.activeEffectSourceItemUuid).toBeNull();
}

function expectComponentMigrationSuccess(before: V1ComponentJson, allAfter: Record<string, CraftingComponentJson>) {
    expect(allAfter[before.itemUuid]).not.toBeNull();
    const after = allAfter[before.itemUuid];
    expect(after.itemUuid).toEqual(before.itemUuid);
    expect(after.disabled).toEqual(false);

    const essenceIdsAfter = Object.keys(after.essences);
    expect(essenceIdsAfter.length).toEqual(Object.keys(before.essences).length);
    essenceIdsAfter.forEach(essenceId => {
        expect(after.essences[essenceId]).toEqual(before.essences[essenceId]);
    });

    const salvageOptionIdsAfter = Object.keys(after.salvageOptions);
    const salvageComponentIdsBefore = Object.keys(before.salvage);
    if (salvageOptionIdsAfter.length === 0) {
        expect(salvageComponentIdsBefore.length).toEqual(0);
    } else {
        expect(salvageOptionIdsAfter.length).toEqual(1);
        const salvageAfter = after.salvageOptions[salvageOptionIdsAfter[0]];
        const salvageComponentIdsAfter = Object.keys(salvageAfter);
        expect(salvageComponentIdsAfter.length).toEqual(salvageComponentIdsBefore.length);
        salvageComponentIdsAfter.forEach(componentId => expect(salvageAfter[componentId]).toEqual(before.salvage[componentId]));
    }
}

function expectRecipeMigrationSuccess(before: V1RecipeJson, allAfter: Record<string, RecipeJson>) {
    expect(allAfter[before.itemUuid]).not.toBeNull();
    const after = allAfter[before.itemUuid];
    expect(after.itemUuid).toEqual(before.itemUuid);
    expect(after.disabled).toEqual(false);

    const essenceIdsAfter = Object.keys(after.essences);
    expect(essenceIdsAfter.length).toEqual(Object.keys(before.essences).length);
    essenceIdsAfter.forEach(essenceId => {
        expect(after.essences[essenceId]).toEqual(before.essences[essenceId]);
    });

    const ingredientOptionIdsAfter = Object.keys(after.ingredientOptions);
    const ingredientOptionsAfter = ingredientOptionIdsAfter.map(ingredientOptionId => after.ingredientOptions[ingredientOptionId]);
    expect(ingredientOptionsAfter.length).toEqual(before.ingredientGroups.length);
    before.ingredientGroups.forEach(ingredientGroupBefore => {
        const ingredientsFound = ingredientOptionsAfter.find(ingredientOptionAfter => {
            const catalystIdsAfter = Object.keys(ingredientOptionAfter.catalysts);
            if (catalystIdsAfter.length !== Object.keys(before.catalysts).length) {
                return false;
            }
            const catalystsCopied = catalystIdsAfter.map(catalystId => before.catalysts[catalystId] === ingredientOptionAfter.catalysts[catalystId])
                .reduce((previousValue, currentValue) => previousValue && currentValue, true);
            if (!catalystsCopied) {
                return false;
            }
            const ingredientIdsAfter = Object.keys(ingredientOptionAfter.ingredients);
            if (ingredientIdsAfter.length !== Object.keys(ingredientGroupBefore).length) {
                return false;
            }
            const ingredientsMatch = ingredientIdsAfter.map(ingredientId => ingredientGroupBefore[ingredientId] === ingredientOptionAfter.ingredients[ingredientId])
                .reduce((previousValue, currentValue) => previousValue && currentValue, true);
            return ingredientsMatch;

        });
        expect(ingredientsFound).not.toBeUndefined();
    });

    const resultOptionIdsAfter = Object.keys(after.resultOptions);
    const resultOptionsAfter = resultOptionIdsAfter.map(resultOptionId => after.resultOptions[resultOptionId]);
    expect(resultOptionsAfter.length).toEqual(before.resultGroups.length);
    before.resultGroups.forEach(resultGroupBefore => {
        const resultsFound = resultOptionsAfter.find(resultOptionAfter => {
            const resultIdsAfter = Object.keys(resultOptionAfter);
            if (resultIdsAfter.length !== Object.keys(resultGroupBefore).length) {
                return false;
            }
            const resultsMatch = resultIdsAfter.map(resultId => resultGroupBefore[resultId] === resultOptionAfter[resultId])
                .reduce((previousValue, currentValue) => previousValue && currentValue, true);
            return resultsMatch;

        });
        expect(resultsFound).not.toBeUndefined();
    });

}

describe("Migrating from V1 to V2", () => {

    test("should migrate Child's Play", () => {

        const childsPlay = V1_CHILDS_PLAY_SYSTEM_DEFINITION;
        const underTest = new V2CraftingSystemSettingMigrator();

        const result = underTest.perform(childsPlay);

        expect(result).not.toBeNull();

        expect(result.id).toEqual(childsPlay.id);
        expect(result.enabled).toEqual(childsPlay.enabled);
        expect(result.locked).toEqual(childsPlay.locked);

        expect(result.details.name).toEqual(childsPlay.details.name);
        expect(result.details.author).toEqual(childsPlay.details.author);
        expect(result.details.summary).toEqual(childsPlay.details.summary);
        expect(result.details.description).toEqual(childsPlay.details.description);

        expect(Object.keys(result.parts.essences).length).toEqual(Object.keys(childsPlay.parts.essences).length);
        expect(Object.keys(result.parts.components).length).toEqual(Object.keys(childsPlay.parts.components).length);
        expect(Object.keys(result.parts.recipes).length).toEqual(Object.keys(childsPlay.parts.recipes).length);

        Object.keys(childsPlay.parts.essences)
            .map(essenceId => {
                const before = childsPlay.parts.essences[essenceId];
                expectEssenceMigrationSuccess(before, result.parts.essences);
            });

        Object.keys(childsPlay.parts.components)
            .map(componentId => {
                const before = childsPlay.parts.components[componentId];
                expectComponentMigrationSuccess(before, result.parts.components);
            });

        Object.keys(childsPlay.parts.recipes)
            .map(recipeId => {
                const before = childsPlay.parts.recipes[recipeId];
                expectRecipeMigrationSuccess(before, result.parts.recipes);
            });
    });

    test("Should migrate Alchemist's Supplies v1.6", () => {

        const alchemistsSupplies = V1_ALCHEMISTS_SUPPLIES_SYSTEM_DEFINITION;
        const underTest = new V2CraftingSystemSettingMigrator();

        const result = underTest.perform(alchemistsSupplies);

        expect(result).toEqual(ALCHEMISTS_SUPPLIES_SYSTEM_DATA.definition);

    });

});