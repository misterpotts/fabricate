<!-- CraftingAttemptCarousel.svelte -->
<script lang="ts">
    import {getContext} from "svelte";
    import Properties from "../../scripts/Properties";
    import {localizationKey} from "../common/LocalizationService";
    import CraftingAttemptGrid from "./CraftingAttemptGrid.svelte";

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.CraftingAttemptCarousel`;

    export let columns;
    export let recipe;
    export let selectedOptionName;
    export let craftingAttempts;

    function selectNextOption() {
        recipe.selectNextIngredientOption();
        selectedOptionName = recipe.selectedIngredientOptionName;
    }

    function selectPreviousOption() {
        recipe.selectPreviousIngredientOption();
        selectedOptionName = recipe.selectedIngredientOptionName;
    }

</script>

<div class="fab-component-grid-carousel">
    {#each craftingAttempts as craftingAttempt}
        {#if craftingAttempt.ingredientOptionName === selectedOptionName}
            <div class="fab-component-grid-carousel-item" >
                <div class="fab-carousel-nav">
                    <button class="fab-carousel-button fab-carousel-previous" on:click={selectPreviousOption}><i class="fa-solid fa-caret-left"></i> {localization.localize(`${localizationPath}.buttons.previous`)}</button>
                    <h3 class="fab-carousel-option-name">{craftingAttempt.ingredientOptionName}</h3>
                    <button class="fab-carousel-button fab-carousel-next" on:click={selectNextOption}>{localization.localize(`${localizationPath}.buttons.next`)} <i class="fa-solid fa-caret-right"></i></button>
                </div>
                <div class="fab-component-grid-wrapper">
                    <CraftingAttemptGrid columns={columns}
                                         ingredients={craftingAttempt.ingredientAmounts}
                                         catalysts={craftingAttempt.catalystAmounts}
                                         essences={craftingAttempt.essenceAmounts} />
                </div>
            </div>
        {/if}
    {/each}
</div>