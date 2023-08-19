<!-- ComponentSalvageCarousel.svelte -->
<script lang="ts">
    import CraftingComponentGrid from "./CraftingComponentGrid.svelte"
    import {getContext} from "svelte";
    import {localizationKey} from "./LocalizationService";
    import Properties from "../../scripts/Properties";

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.CraftingComponentCarousel`;

    export let columns;
    export let salvageAttempt;

    let selectedOption = salvageAttempt.salvageOption;

    function selectNextOption() {
        salvageAttempt.selectNextOption();
        selectedOption = salvageAttempt.salvageOption;
    }

    function selectPreviousOption() {
        salvageAttempt.selectPreviousOption();
        selectedOption = salvageAttempt.salvageOption;
    }

</script>

<div class="fab-component-grid-carousel">
    <div class="fab-component-grid-carousel-item" >
        <div class="fab-carousel-nav">
            <button class="fab-carousel-button fab-carousel-previous" on:click={selectPreviousOption}><i class="fa-solid fa-caret-left"></i> {localization.localize(`${localizationPath}.buttons.previous`)}</button>
            <h3 class="fab-carousel-option-name">{selectedOption.name}</h3>
            <button class="fab-carousel-button fab-carousel-next" on:click={selectNextOption}>{localization.localize(`${localizationPath}.buttons.next`)} <i class="fa-solid fa-caret-right"></i></button>
        </div>
        <slot name="description"></slot>
        <div class="fab-component-grid-wrapper">
            <CraftingComponentGrid columns={columns} componentCombination={selectedOption.salvage} />
        </div>
        <div class="fab-component-grid-wrapper">
            <CraftingComponentGrid columns={columns} componentCombination={selectedOption.catalysts} />
        </div>
    </div>
</div>
