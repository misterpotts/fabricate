<!-- CraftingAttemptCarousel.svelte -->
<script lang="ts">
    import {createEventDispatcher, getContext} from "svelte";
    import Properties from "../../scripts/Properties";
    import {localizationKey} from "../common/LocalizationService";
    import CraftingAttemptGrid from "./CraftingAttemptGrid.svelte";

    const dispatch = createEventDispatcher();

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.CraftingAttemptCarousel`;

    export let columns;
    export let craftingAttempt;

    function selectNextOption() {
        dispatch("nextOptionSelected", {});
    }

    function selectPreviousOption() {
        dispatch("previousOptionSelected", {});
    }

</script>

<div class="fab-component-grid-carousel">
    <div class="fab-component-grid-carousel-item" >
        <div class="fab-carousel-nav">
            <button class="fab-carousel-button fab-carousel-previous" on:click={selectPreviousOption}><i class="fa-solid fa-caret-left"></i> {localization.localize(`${localizationPath}.buttons.previous`)}</button>
            <h3 class="fab-carousel-option-name">{craftingAttempt.requirementOption.name}</h3>
            <button class="fab-carousel-button fab-carousel-next" on:click={selectNextOption}>{localization.localize(`${localizationPath}.buttons.next`)} <i class="fa-solid fa-caret-right"></i></button>
        </div>
        <div class="fab-component-grid-wrapper">
            <CraftingAttemptGrid columns={columns}
                                 ingredients={craftingAttempt.selectedComponents.ingredients}
                                 catalysts={craftingAttempt.selectedComponents.catalysts}
                                 essences={craftingAttempt.selectedComponents.essences} />
        </div>
    </div>
</div>