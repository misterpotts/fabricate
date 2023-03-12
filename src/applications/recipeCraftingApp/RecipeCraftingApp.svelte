<!-- RecipeCraftingApp.svelte-->
<script lang="ts">
    import { setContext } from 'svelte';
    import { onMount } from "svelte";
    import CraftingComponentGrid from "../common/CratingComponentGrid.svelte";
    import eventBus from "../common/EventBus";
    import { localizationKey } from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import CraftingComponentCarousel from "../common/CraftingComponentCarousel.svelte";
    import CraftingHeader from "./CraftingHeader.svelte";
    import Tabs from "../common/Tabs.svelte";
    import TabList from "../common/TabList.svelte";
    import Tab from "../common/Tab.svelte";
    import CraftingAttemptCarousel from "./CraftingAttemptCarousel.svelte";
    import CraftingAttemptGrid from "./CraftingAttemptGrid.svelte";
    import CraftingResultCarousel from "./CraftingResultCarousel.svelte";
    import {CraftingAttemptFactory} from "../../scripts/crafting/attempt/CraftingAttemptFactory";
    import {
        DefaultComponentSelectionStrategy
    } from "../../scripts/crafting/selection/DefaultComponentSelectionStrategy";

    const localizationPath = `${Properties.module.id}.RecipeCraftingApp`;

    export let recipe;
    export let craftingSystem;
    export let inventory;
    export let localization;
    export let closeHook;

    let craftingAttempt;

    let selectedIngredientOptionName;
    let selectedResultOptionName;
    function resetSelections() {
        selectedIngredientOptionName = recipe.firstIngredientOptionName;
        selectedResultOptionName = recipe.firstResultOptionName;
        if (selectedIngredientOptionName) {
            recipe.selectIngredientCombination(selectedIngredientOptionName);
        }
        if (selectedResultOptionName) {
            recipe.selectResultCombination(selectedIngredientOptionName);
        }
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
        throw new Error("Not implemented!");
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

    async function reIndex() {
        await inventory.index();
        craftingAttempt = new CraftingAttemptFactory({selectionStrategy: new DefaultComponentSelectionStrategy());
    }

</script>

<div class="fab-recipe-crafting-app fab-columns"
     use:eventBus={["recipeUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
     on:recipeUpdated={(e) => handleRecipeUpdated(e)}
     on:itemUpdated={(e) => handleItemUpdated(e)}
     on:itemCreated={(e) => handleItemCreated(e)}
     on:itemDeleted={(e) => handleItemDeleted(e)}>
    <div class="fab-column" style="height: 100%">
        <CraftingHeader recipe={recipe} on:salvageComponent={(e) => doCraftRecipe(e)} />
        <div class="fab-recipe-crafting-app-body fab-scrollable">
            <div class="fab-recipe-crafting-ingredients">
                {#if recipe.hasIngredientOptions}
                    <CraftingAttemptCarousel columns={3} caftingAttempt={craftingAttempt} bind:selectedOptionName={selectedIngredientOptionName}>
                        <p slot="description" class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                    </CraftingAttemptCarousel>
                {:else}
                    <p class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doDoRecipeCrafting`)}:</p>
                    <div class="fab-component-grid-wrapper">
                        <CraftingAttemptGrid columns={3} caftingAttempt={craftingAttempt} />
                    </div>
                {/if}
            </div>
            <div class="fab-recipe-crafting-results">
                {#if recipe.hasResultOptions}
                    <CraftingResultCarousel columns={3} recipe={recipe} bind:selectedOptionName={selectedResultOptionName}>
                        <p slot="description" class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                    </CraftingResultCarousel>
                {:else}
                    <p class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doDoRecipeCrafting`)}:</p>
                    <div class="fab-component-grid-wrapper">
                        <CraftingAttemptGrid columns={3} caftingAttempt={craftingAttempt} />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>