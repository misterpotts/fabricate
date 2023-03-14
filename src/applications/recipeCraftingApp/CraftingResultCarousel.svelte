<!-- CraftingComponentCarousel.svelte -->
<script lang="ts">
    import {getContext} from "svelte";
    import Properties from "../../scripts/Properties";
    import {localizationKey} from "../common/LocalizationService";
    import CraftingComponentGrid from "../common/CraftingComponentGrid.svelte";

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.CraftingResultCarousel`;

    export let columns;
    export let recipe;
    export let selectedOptionName;

    function selectNextOption() {
        recipe.selectNextResultOption();
        selectedOptionName = recipe.selectedResultOptionName;
    }

    function selectPreviousOption() {
        recipe.selectPreviousResultOption();
        selectedOptionName = recipe.selectedResultOptionName;
    }

</script>

<div class="fab-result-grid-carousel">
    {#each recipe.resultOptions as option}
        {#if option.name === selectedOptionName}
            <div class="fab-result-grid-carousel-item" >
                <div class="fab-carousel-nav">
                    <button class="fab-carousel-button fab-carousel-previous" on:click={selectPreviousOption}><i class="fa-solid fa-caret-left"></i> {localization.localize(`${localizationPath}.buttons.previous`)}</button>
                    <h3 class="fab-carousel-option-name">{option.name}</h3>
                    <button class="fab-carousel-button fab-carousel-next" on:click={selectNextOption}>{localization.localize(`${localizationPath}.buttons.next`)} <i class="fa-solid fa-caret-right"></i></button>
                </div>
                <slot name="description"></slot>
                <div class="fab-result-grid-wrapper">
                    <CraftingComponentGrid columns={columns} componentCombination={option.results} />
                </div>
            </div>
        {/if}
    {/each}
</div>