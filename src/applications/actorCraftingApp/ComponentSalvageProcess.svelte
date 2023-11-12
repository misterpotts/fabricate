<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {AppBar} from "@skeletonlabs/skeleton";
    import {NoSalvageProcess, type SalvageOption, type SalvageProcess} from "./SalvageProcess";
    import type {LocalizationService} from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let localization: LocalizationService;
    export let salvageProcess: SalvageProcess = new NoSalvageProcess();

    /*
     * ===========================================================================
     * Private component properties
     * ===========================================================================
     */

    let selectedSalvageOption: SalvageOption = salvageProcess.selectedOption;
    $: salvageProcessProducts = selectedSalvageOption.products;
    $: selectedOptionName = selectedSalvageOption.name;

    /*
     * ===========================================================================
     * Private component functions
     * ===========================================================================
     */

    function selectNextOption() {
        selectedSalvageOption = salvageProcess.selectNextOption();
    }

    function selectPreviousOption() {
        selectedSalvageOption = salvageProcess.selectPreviousOption();
    }

    function clearSalvageProcess() {
        salvageProcess = new NoSalvageProcess();
    }

    function reportError() {
        window.open(Properties.module.repository.bugReportUrl, '_blank').focus();
    }

</script>

<AppBar background="bg-surface-700 text-white">
    <svelte:fragment slot="lead">
        <i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearSalvageProcess}></i>
    </svelte:fragment>
    <h2 class="text-lg">Salvaging {salvageProcess.componentName}</h2>
    <svelte:fragment slot="trail">
        {#if salvageProcess.canStart}
            <a class="btn variant-filled-success text-black"><i class="fa-solid fa-screwdriver-wrench mr-2"></i> Salvage</a>
        {:else}
            <a class="btn variant-ghost-error text-error-600 cursor-not-allowed"> <i class="fa-solid fa-ban mr-2"></i>Salvage</a>
        {/if}
    </svelte:fragment>
</AppBar>
<div class="h-full w-full flex flex-row">
    {#if salvageProcess instanceof NoSalvageProcess}
        <div class="flex w-full h-full items-center justify-center">
            <div class="alert h-1/5 w-5/6 variant-filled-error">
                <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
                <div class="alert-message variant-filled-error">
                    <h3 class="font-bold text-lg">Oops!</h3>
                    <p class="w-full leading-relaxed">
                        The Salvage process was started without a salvageable component!
                        This shouldn't be possible, and is likely to be a bug in Fabricate.
                    </p>
                </div>
                <div class="alert-actions space-x-4">
                    <button class="btn bg-white text-black p-3" on:click={reportError}>
                        <i class="fa-solid fa-external-link"></i>
                        Report it
                    </button>
                    <button class="btn bg-white text-black p-3" on:click={clearSalvageProcess}>
                        <i class="fa-solid fa-times"></i>
                        Ignore it
                    </button>
                </div>
            </div>
        </div>
    {:else}
        <div class="flex flex-col p-4 h-full w-full">
            {#if salvageProcess.hasOptions}
                <div class="flex text-lg flex-row border-b border-surface-400">
                    <div class="flex flex-1 justify-start">
                        <a class="btn" on:click={selectPreviousOption}>
                            <i class="fa-solid fa-arrow-left mr-2"></i> Previous option
                        </a>
                    </div>
                    <div class="flex flex-1 justify-center">
                        {selectedOptionName}
                    </div>
                    <div class="flex flex-1 justify-end">
                        <a class="btn" on:click={selectNextOption}>
                            Next option <i class="fa-solid fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            {/if}
            {#if selectedSalvageOption.requiresCatalysts}
                <div class="flex flex-row w-full h-full">
                    <div class="flex flex-col w-1/2 h-full">
                        <h3>Products</h3>
                        <p>The following products are obtained by salvaging this component.</p>
                    </div>
                    <div class="flex flex-col w-1/2 h-full">
                        <h3>Catalysts</h3>
                        <p>The following catalysts are required to salvage this component.</p>
                    </div>
                </div>
            {:else}
                <h3>Products</h3>
                <p>The following products are obtained by salvaging this component.</p>
                <div class="grid grid-cols-6">
                    {#each salvageProcessProducts.units as productUnit}
                        {#await productUnit.element.load()}
                            Loading...
                        {:then loadedComponent}
                            <div class="card snap-start col-span-1 row-span-1 w-full bg-surface-700 flex flex-row">
                                <i class="fa-solid fa-circle-check text-success-500 mr-2"></i>
                                <span>{loadedComponent.name}</span>
                            </div>
                        {/await}
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>