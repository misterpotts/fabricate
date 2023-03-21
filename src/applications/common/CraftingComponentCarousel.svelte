<!-- CraftingComponentCarousel.svelte -->
<script lang="ts">
    import CraftingComponentGrid from "./CraftingComponentGrid.svelte"
    import {getContext} from "svelte";
    import {localizationKey} from "./LocalizationService";
    import Properties from "../../scripts/Properties";

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.CraftingComponentCarousel`;

    export let columns;
    export let craftingComponent;
    export let selectedOptionName;

    function selectNextOption() {
        craftingComponent.selectNextSalvageOption();
        selectedOptionName = craftingComponent.selectedSalvageOptionName;
    }

    function selectPreviousOption() {
        craftingComponent.selectPreviousSalvageOption();
        selectedOptionName = craftingComponent.selectedSalvageOptionName;
    }

</script>

<div class="fab-component-grid-carousel">
    {#each craftingComponent.salvageOptions as option}
        {#if option.name === selectedOptionName}
            <div class="fab-component-grid-carousel-item" >
                <div class="fab-carousel-nav">
                    <button class="fab-carousel-button fab-carousel-previous" on:click={selectPreviousOption}><i class="fa-solid fa-caret-left"></i> {localization.localize(`${localizationPath}.buttons.previous`)}</button>
                    <h3 class="fab-carousel-option-name">{option.name}</h3>
                    <button class="fab-carousel-button fab-carousel-next" on:click={selectNextOption}>{localization.localize(`${localizationPath}.buttons.next`)} <i class="fa-solid fa-caret-right"></i></button>
                </div>
                <slot name="description"></slot>
                <div class="fab-component-grid-wrapper">
                    <CraftingComponentGrid columns={columns} componentCombination={option.salvage} />
                </div>
            </div>
        {/if}
    {/each}
</div>