[<!-- RecipeCraftingApp.svelte-->
<script lang="ts">
    import {onMount, setContext} from 'svelte';
    import eventBus from "../common/EventBus";
    import {localizationKey} from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import CraftingHeader from "./CraftingHeader.svelte";
    import CraftingAttemptCarousel from "./CraftingAttemptCarousel.svelte";
    import CraftingAttemptGrid from "./CraftingAttemptGrid.svelte";
    import CraftingResultCarousel from "./CraftingResultCarousel.svelte";
    import CraftingComponentGrid from "../common/CraftingComponentGrid.svelte";
    import {SuccessfulCraftingResult} from "../../scripts/crafting/result/CraftingResult";

    const localizationPath = `${Properties.module.id}.RecipeCraftingApp`;

    export let recipe;
    export let inventory;
    export let localization;
    export let closeHook;

    let craftingPrep;
    let craftingAttempt;
    let selectedRequirementOptionName;

    function resetSelections() {
        recipe.makeDefaultSelections();
    }
    resetSelections();

    setContext(localizationKey, {
        localization,
    });

    onMount(async () => {
        return reIndex();
    });

    async function doCraftRecipe(event) {
        const skipDialog = event.detail.skipDialog;
        if (skipDialog) {
            return craftRecipe(recipe);
        }
        let confirm = false;
        await Dialog.confirm({
            title: localization.localize(`${localizationPath}.dialog.doCraftRecipe.title`),
            content: `<p>${localization.format(`${localizationPath}.dialog.doCraftRecipe.content`, { recipeName: recipe.name})}</p>`,
            yes: async () => {
                confirm = true;
            }
        });
        if (confirm) {
            return craftRecipe(recipe);
        }
    }

    async function craftRecipe(recipe) {
        if (!craftingAttempt) {
            const message = localization.localize(`${localizationPath}.errors.noCraftingAttempt`);
            ui.notifications.error(message);
            return;
        }
        if (!craftingAttempt.isPossible) {
            const message = localization.format(`${localizationPath}.errors.notPossible`, { recipeName: recipe.name });
            ui.notifications.warn(message);
            return;
        }
        const craftingResult = new SuccessfulCraftingResult({
            recipe,
            produced: recipe.getSelectedResults().results,
            consumed: craftingAttempt.consumedComponents
        });
        await inventory.acceptCraftingResult(craftingResult);
    }

    async function handleRecipeUpdated(event) {
        const { updatedRecipe } = event.detail;
        if (updatedRecipe.id === recipe.id) {
            recipe = updatedRecipe;
            resetSelections();
        }
    }

    async function handleItemUpdated(event) {
        const { actor } = event.detail;
        // If the modified item is not owned by the actor who owns this recipe
        if (!actor?.id === inventory.actor.id) {
            return; // do nothing
        }
        // if it is, we need to re-index the inventory to refresh the rendered application in the UI
        return reIndex();
    }

    async function handleItemCreated(event) {
        const {actor} = event.detail;
        // If the modified item is not owned by the actor who owns this recipe
        if (!actor?.id === inventory.actor.id) {
            return; // do nothing
        }
        // if it is, we need to re-index the inventory to refresh the rendered application in the UI
        return reIndex();
    }

    async function handleItemDeleted(event) {
        const {sourceId, actor} = event.detail;
        // If the modified item is not owned by the actor who owns this recipe
        if (!actor?.id === inventory.actor.id) {
            return; // do nothing
        }
        // If this recipe was the item that was deleted, close the application
        if (sourceId === recipe.itemUuid) {
            return closeHook();
        }
        // Otherwise, we need to re-index the inventory to refresh the rendered application in the UI
        await reIndex();
    }

    let loaded = false;
    async function reIndex() {
        await inventory.index();
        craftingPrep = craftingPrepFactory.make(recipe, inventory.ownedComponents);
        craftingAttempt = craftingPrep.isSingleton ? craftingPrep.getSingletonCraftingAttempt() : craftingPrep.getCraftingAttemptByRequirementOptionName(recipe.selectedRequirementOptionName);
        selectedRequirementOptionName = recipe.selectedRequirementOptionName;
        loaded = true;
    }

    function selectNextIngredientOption() {
        selectedRequirementOptionName = recipe.selectNextIngredientOption();
        craftingAttempt = craftingPrep.getCraftingAttemptByIngredientOptionName(selectedRequirementOptionName);
    }

    function selectPreviousIngredientOption() {
        selectedRequirementOptionName = recipe.selectPreviousIngredientOption();
        craftingAttempt = craftingPrep.getCraftingAttemptByIngredientOptionName(selectedRequirementOptionName);
    }

</script>

<div class="fab-recipe-crafting-app fab-columns"
     use:eventBus={["recipeUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
     on:recipeUpdated={(e) => handleRecipeUpdated(e)}
     on:itemUpdated={(e) => handleItemUpdated(e)}
     on:itemCreated={(e) => handleItemCreated(e)}
     on:itemDeleted={(e) => handleItemDeleted(e)}>
    <div class="fab-column" style="height: 100%">
        <CraftingHeader recipe={recipe} on:craftRecipe={(e) => doCraftRecipe(e)} />
        {#if loaded}
            <div class="fab-recipe-crafting-app-body fab-scrollable">
                <p class="fab-recipe-crafting-hint">{localization.localize(`${localizationPath}.hints.doCrafting`)}</p>
                <div class="fab-recipe-crafting-ingredients">
                    {#if !craftingPrep.isSingleton}
                        <CraftingAttemptCarousel columns={3}
                                                 craftingAttempt={craftingAttempt}
                                                 selectedRequirementOptionName={selectedRequirementOptionName}
                                                 on:nextIngredientOptionSelected={selectNextIngredientOption}
                                                 on:previousIngredientOptionSelected={selectPreviousIngredientOption} />
                    {:else}
                        <div class="fab-component-grid-wrapper">
                            <CraftingAttemptGrid
                                    columns={3}
                                    ingredients={craftingAttempt.ingredientAmounts}
                                    catalysts={craftingAttempt.catalystAmounts}
                                    essences={craftingAttempt.essenceAmounts} />
                        </div>
                    {/if}
                </div>
                <div class="fab-recipe-crafting-results">
                    {#if recipe.hasResultOptions}
                        <CraftingResultCarousel columns={3} recipe={recipe} selectedOptionName={recipe.selectedResultOptionName}>
                            <h3 slot="description">{localization.localize(`${Properties.module.id}.typeNames.result.plural`)}</h3>
                        </CraftingResultCarousel>
                    {:else}
                        <div class="fab-component-grid-wrapper">
                            <h3>Results</h3>
                            <CraftingComponentGrid columns={3} componentCombination={recipe.getSelectedResults().results} />
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
