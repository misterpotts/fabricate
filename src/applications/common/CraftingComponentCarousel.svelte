<!-- CraftingComponentCarousel.svelte -->
<script lang="ts">
    import CraftingComponentGrid from "./CratingComponentGrid.svelte"

    export let columns;
    export let craftingComponent;
    craftingComponent.selectFirstOption();

    $: selectedOptionName = craftingComponent.selectedSalvageOptionName;

    function selectNextOption() {
        craftingComponent.selectNextSalvageOption();
        craftingComponent = craftingComponent;
    }

    function selectPreviousOption() {
        craftingComponent.selectPreviousSalvageOption();
        craftingComponent = craftingComponent;
    }
</script>

<div class="fab-component-grid-carousel">
    {#each craftingComponent.salvageOptions as option}
        {#if option.name === selectedOptionName}
            <div class="fab-component-grid-carousel-item" >
                <h4>{option.name}</h4>
                <button on:click={selectPreviousOption}>Previous</button>
                <button on:click={selectNextOption}>Next</button>
                <CraftingComponentGrid columns={columns} componentCombination={option.salvage} />
            </div>
        {/if}
    {/each}
</div>

<style>

</style>