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

    const localizationPath = `${Properties.module.id}.RecipeCraftingApp`;

    export let recipeCraftingManager;

    export let localization;
    export let closeHook;

    let craftingAttempt;

    async function loadAppData() {
        craftingAttempt = await recipeCraftingManager.getCraftingAttempt();
    }

    onMount(loadAppData);

    setContext(localizationKey, {
        localization,
    });

    async function doCraftRecipe(event) {
        const skipDialog = event.detail.skipDialog;
        if (skipDialog) {
            return craftRecipe();
        }
        let confirm = false;
        await Dialog.confirm({
            title: localization.localize(`${localizationPath}.dialog.doCraftRecipe.title`),
            content: `<p>${localization.format(`${localizationPath}.dialog.doCraftRecipe.content`, { recipeName: craftingAttempt.recipeToCraft.name })}</p>`,
            yes: async () => {
                confirm = true;
            }
        });
        if (confirm) {
            return craftRecipe();
        }
    }

    async function craftRecipe() {
        await recipeCraftingManager.doCrafting(craftingAttempt);
    }

    async function handleRecipeUpdated(event) {
        console.log("not implemented: Recipes will not auto-update in the crafting app");
    }

    async function reloadApplicableInventoryEvents(event) {
        const {sourceId, actor} = event.detail;
        // If the modified item is not owned by the actor who owns this recipe
        if (!actor?.id === recipeCraftingManager.sourceActor.id) {
            return; // do nothing
        }
        if (!sourceId) {
            return; // do nothing
        }
        // If this recipe was the item that was deleted, close the application
        if (sourceId === recipeCraftingManager.recipeToCraft.itemUuid) {
            return closeHook();
        }
        // Otherwise, we need to re-index the inventory to refresh the rendered application in the UI
        await loadAppData();
    }

    async function handleItemUpdated(event) {
        await reloadApplicableInventoryEvents(event);
    }

    async function handleItemCreated(event) {
        await reloadApplicableInventoryEvents(event);
    }

    async function handleItemDeleted(event) {
        await reloadApplicableInventoryEvents(event);
    }

    async function selectNextRequirementOption() {
        craftingAttempt = await recipeCraftingManager.selectNextRequirementOption();
    }

    async function selectPreviousRequirementOption() {
        craftingAttempt = await recipeCraftingManager.selectPreviousRequirementOption();
    }

    async function selectNextResultOption() {
        craftingAttempt = await recipeCraftingManager.selectNextResultOption();
    }

    async function selectPreviousResultOption() {
        craftingAttempt = await recipeCraftingManager.selectPreviousResultOption();
    }

</script>

{#if craftingAttempt}
    <div class="fab-recipe-crafting-app fab-columns"
         use:eventBus={["recipeUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
         on:recipeUpdated={(e) => handleRecipeUpdated(e)}
         on:itemUpdated={(e) => handleItemUpdated(e)}
         on:itemCreated={(e) => handleItemCreated(e)}
         on:itemDeleted={(e) => handleItemDeleted(e)}>
        <div class="fab-column" style="height: 100%">
            <CraftingHeader recipe={recipeCraftingManager.recipeToCraft} on:craftRecipe={(e) => doCraftRecipe(e)} />
            <div class="fab-recipe-crafting-app-body fab-scrollable">
                <p class="fab-recipe-crafting-hint">{localization.localize(`${localizationPath}.hints.doCrafting`)}</p>
                <div class="fab-recipe-crafting-ingredients">
                    {#if recipeCraftingManager.hasRequirementChoices}
                        <CraftingAttemptCarousel columns={3}
                                                 craftingAttempt={craftingAttempt}
                                                 on:nextOptionSelected={selectNextRequirementOption}
                                                 on:previousOptionSelected={selectPreviousRequirementOption} />
                    {:else}
                        <div class="fab-component-grid-wrapper">
                            <CraftingAttemptGrid
                                    columns={3}
                                    ingredients={craftingAttempt.selectedComponents.ingredients}
                                    catalysts={craftingAttempt.selectedComponents.catalysts}
                                    essences={craftingAttempt.selectedComponents.essences} />
                        </div>
                    {/if}
                </div>
                <div class="fab-recipe-crafting-results">
                    {#if recipeCraftingManager.hasResultChoices}
                        <CraftingResultCarousel columns={3}
                                                craftingAttempt={craftingAttempt}
                                                on:nextOptionSelected={selectNextResultOption}
                                                on:previousOptionSelected={selectPreviousResultOption}>
                            <h3 slot="description">{localization.localize(`${Properties.module.id}.typeNames.result.plural`)}</h3>
                        </CraftingResultCarousel>
                    {:else}
                        <div class="fab-component-grid-wrapper">
                            <h3>Results</h3>
                            <CraftingComponentGrid columns={3} componentCombination={craftingAttempt.producedComponents} />
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}