<!-- RecipeCraftingApp.svelte-->
<script lang="ts">
    import {onMount, setContext} from 'svelte';
    import eventBus from "../common/EventBus";
    import {localizationKey} from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import CraftingHeader from "./CraftingHeader.svelte";
    import CraftingAttemptCarousel from "./CraftingAttemptCarousel.svelte";
    import CraftingAttemptGrid from "./CraftingAttemptGrid.svelte";
    import CraftingResultCarousel from "./CraftingResultCarousel.svelte";
    import {CraftingAttemptFactory} from "../../scripts/crafting/attempt/CraftingAttemptFactory";
    import {DefaultComponentSelectionStrategy} from "../../scripts/crafting/selection/ComponentSelectionStrategy";
    import CraftingComponentGrid from "../common/CraftingComponentGrid.svelte";
    import {DefaultCraftingResult} from "../../scripts/crafting/result/CraftingResult";
    import {IngredientOption} from "../../scripts/common/Recipe";

    const localizationPath = `${Properties.module.id}.RecipeCraftingApp`;

    export let recipe;
    export let inventory;
    export let localization;
    export let closeHook;

    const craftingAttemptFactory = new CraftingAttemptFactory({selectionStrategy: new DefaultComponentSelectionStrategy()});
    let craftingAttempts = [];

    let selectedIngredientOptionName;
    let selectedResultOptionName;
    function resetSelections() {
        if (recipe.hasIngredients) {
            selectedIngredientOptionName = recipe.firstIngredientOptionName;
            recipe.selectIngredientCombination(selectedIngredientOptionName);
        }
        if (recipe.hasResults) {
            selectedResultOptionName = recipe.firstResultOptionName;
            recipe.selectResultCombination(selectedResultOptionName);
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
        let craftingAttempt = craftingAttempts.find(craftingAttempt => craftingAttempt.ingredientOptionName === selectedIngredientOptionName);
        if (!craftingAttempt && craftingAttempts.length === 1) {
            craftingAttempt = craftingAttempts[0];
        }
        // todo: fix the tacit expectation that there must be an ingredient option and move this to another class
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
        const craftingResult = new DefaultCraftingResult({
            recipe,
            created: recipe.getResultSelection().results,
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
        if (recipe.hasIngredients) {
            craftingAttempts = recipe.ingredientOptions.map(option => craftingAttemptFactory.make(option, recipe.essences, inventory.ownedComponents));
        } else {
            craftingAttempts = [craftingAttemptFactory.make(new IngredientOption({name: "Not an option"}), recipe.essences, inventory.ownedComponents)];
        }
        loaded = true;
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
                    {#if recipe.hasIngredientOptions}
                        <CraftingAttemptCarousel columns={3} craftingAttempts={craftingAttempts} recipe={recipe} bind:selectedOptionName={selectedIngredientOptionName} />
                    {:else}
                        <div class="fab-component-grid-wrapper">
                            <CraftingAttemptGrid
                                    columns={3}
                                    ingredients={craftingAttempts[0].ingredientAmounts}
                                    catalysts={craftingAttempts[0].catalystAmounts}
                                    essences={craftingAttempts[0].essenceAmounts} />
                        </div>
                    {/if}
                </div>
                <div class="fab-recipe-crafting-results">
                    {#if recipe.hasResultOptions}
                        <CraftingResultCarousel columns={3} recipe={recipe} bind:selectedOptionName={selectedResultOptionName}>
                            <h3 slot="description">{localization.localize(`${Properties.module.id}.typeNames.result.plural`)}</h3>
                        </CraftingResultCarousel>
                    {:else}
                        <div class="fab-component-grid-wrapper">
                            <h3>Results</h3>
                            <CraftingComponentGrid columns={3} componentCombination={recipe.getResultSelection().results} />
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
