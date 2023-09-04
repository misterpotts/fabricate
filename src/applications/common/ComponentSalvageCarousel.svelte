<!-- ComponentSalvageCarousel.svelte -->
<script lang="ts">
    import CraftingComponentGrid from "./CraftingComponentGrid.svelte"
    import { getContext, createEventDispatcher } from "svelte";
    import {localizationKey} from "./LocalizationService";
    import Properties from "../../scripts/Properties";
    import TrackedCraftingComponentGrid from "./TrackedCraftingComponentGrid.svelte";

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.ComponentSalvageCarousel`;
    const dispatch = createEventDispatcher();

    export let columns;
    export let selectedSalvageAttempt;

    function selectNextOption() {
        dispatch("nextSalvageOptionSelected", {});
    }

    function selectPreviousOption() {
        dispatch("previousSalvageOptionSelected", {});
    }

</script>

{#if selectedSalvageAttempt}
    <div class="fab-component-grid-carousel">
        <div class="fab-component-grid-carousel-item" >
            <div class="fab-carousel-nav">
                <button class="fab-carousel-button fab-carousel-previous" on:click={selectPreviousOption}><i class="fa-solid fa-caret-left"></i> {localization.localize(`${localizationPath}.buttons.previous`)}</button>
                <h3 class="fab-carousel-option-name">{selectedSalvageAttempt.optionName}</h3>
                <button class="fab-carousel-button fab-carousel-next" on:click={selectNextOption}>{localization.localize(`${localizationPath}.buttons.next`)} <i class="fa-solid fa-caret-right"></i></button>
            </div>
            <slot name="description"></slot>
            <div class="fab-component-grid-wrapper">
                <CraftingComponentGrid columns={columns} componentCombination={selectedSalvageAttempt.producedComponents} />
            </div>
            {#if selectedSalvageAttempt.requiresCatalysts}
                <p class="fab-catalyst-hint">{localization.localize(`${localizationPath}.hints.requiresCatalysts`)}</p>
                <div class="fab-component-grid-wrapper">
                    <TrackedCraftingComponentGrid columns={4} trackedCombination={selectedSalvageAttempt.requiredCatalysts} />
                </div>
            {/if}
        </div>
    </div>
{/if}