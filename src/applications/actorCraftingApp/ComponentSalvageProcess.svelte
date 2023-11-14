<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {AppBar, Avatar} from "@skeletonlabs/skeleton";
    import {NoSalvageProcess, type SalvageOption, type SalvageProcess} from "./SalvageProcess";
    import type {LocalizationService} from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import {createEventDispatcher} from "svelte";
    import ItemCard from "./ItemCard.svelte";
    import AwaitedItemCard from "./AwaitedItemCard.svelte";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let localization: LocalizationService;
    export let salvageProcess: SalvageProcess = new NoSalvageProcess();
    export let batchSize: number = 1;

    /*
     * ===========================================================================
     * Private component properties
     * ===========================================================================
     */

    const dispatch = createEventDispatcher();
    $: displayAmount = calculateDisplayAmount(batchSize, salvageProcess.ownedQuantity);
    let selectedSalvageOption: SalvageOption = salvageProcess.selectedOption;
    $: {
        selectedSalvageOption = salvageProcess.selectedOption;
    }
    $: salvageProcessProducts = selectedSalvageOption.products;
    $: salvageProcessCatalysts = selectedSalvageOption.catalysts;
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

    function runSalvageProcess(salvageProcess: SalvageProcess) {
        dispatch("salvageComponent", salvageProcess);
    }

    function calculateDisplayAmount(batchSize, ownedQuantity) {
        if (batchSize <= 1 || ownedQuantity <= 1) {
            return ""
        }
        if (ownedQuantity >= batchSize) {
            return `(${batchSize})`
        }
        return `(${ownedQuantity})`
    }

</script>

<AppBar background="bg-surface-700 text-white">
    <svelte:fragment slot="lead">
        <i class="fa-solid fa-circle-arrow-left text-xl text-primary-500 cursor-pointer" on:click={clearSalvageProcess}></i>
    </svelte:fragment>
    <div class="flex flex-row items-center">
        <Avatar class="mr-2 ml-2 flex"
                src="{salvageProcess.componentImageUrl}"
                alt="{salvageProcess.componentName}"
                fallback="{Properties.ui.defaults.componentImageUrl}"
                width="w-10"
                rounded="rounded-lg"/>
        <span class="text-lg flex">Salvaging {salvageProcess.componentName} ({salvageProcess.ownedQuantity})</span>
    </div>
    <svelte:fragment slot="trail">
        {#if salvageProcess.canStart}
            <a class="btn variant-filled bg-primary-500 text-black" on:click={() => runSalvageProcess(salvageProcess)}>
                <i class="fa-solid fa-screwdriver-wrench mr-2"></i> Salvage {displayAmount}
            </a>
        {:else}
            <a class="btn variant-ghost-error text-error-600 cursor-not-allowed"><i class="fa-solid fa-ban mr-2"></i> Salvage</a>
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
                <div class="flex text-lg flex-row items-center border-b border-surface-400 pb-4 mb-4 text-white">
                    <div class="flex flex-1 justify-start">
                        <a class="btn variant-filled bg-surface-600 border border-surface-400" on:click={selectPreviousOption}>
                            <i class="fa-solid fa-arrow-left mr-2"></i> Previous option
                        </a>
                    </div>
                    <div class="flex flex-1 justify-center">
                        {selectedOptionName}
                    </div>
                    <div class="flex flex-1 justify-end">
                        <a class="btn variant-filled bg-surface-600 border border-surface-400" on:click={selectNextOption}>
                            Next option <i class="fa-solid fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            {/if}
            {#if selectedSalvageOption.requiresCatalysts}
                <div class="flex flex-row w-full h-full">
                    <div class="flex flex-col w-2/3 h-full">
                        <div class="pb-8 text-white">
                            <h3 class="text-lg mb-2">Products</h3>
                            <p>The following products are obtained by salvaging this component.</p>
                        </div>
                        <div class="grid grid-cols-2 grid-rows-4 h-full gap-4">
                            {#each salvageProcessProducts.units as productUnit}
                                {#await productUnit.element.load()}
                                    <AwaitedItemCard/>
                                {:then loadedComponent}
                                    <ItemCard quantity={productUnit.quantity} name={loadedComponent.name} imageUrl={loadedComponent.imageUrl}/>
                                {/await}
                            {/each}
                        </div>
                    </div>
                    <div class="flex flex-col w-1/3 h-full pl-8">
                        <div class="pb-4 text-white">
                            <h3 class="text-lg mb-2">Catalysts</h3>
                            <p>The following catalysts are required to salvage this component.</p>
                        </div>
                        <div class="grid grid-cols-1 grid-rows-4 h-full gap-4">
                            {#each salvageProcessCatalysts.units as catalystUnit}
                                {#await catalystUnit.target.element.load()}
                                    <AwaitedItemCard/>
                                {:then loadedComponent}
                                    <ItemCard quantity={catalystUnit.actual.quantity}
                                              requiredQuantity={catalystUnit.target.quantity}
                                              name={loadedComponent.name}
                                              imageUrl={loadedComponent.imageUrl}/>
                                {/await}
                            {/each}
                        </div>
                    </div>
                </div>
            {:else}
                <div class="pb-8 text-white">
                    <h3 class="text-lg mb-2">Products</h3>
                    <p>Salvaging this component produces the following components.</p>
                </div>
                <div class="overflow-y-auto overflow-x-hidden h-full snap-y snap-mandatory scroll-smooth scroll-secondary scroll-px-4">
                    <div class="grid grid-cols-3 grid-rows-4 h-full gap-4">
                        {#each salvageProcessProducts.units as productUnit}
                            {#await productUnit.element.load()}
                                <AwaitedItemCard/>
                            {:then loadedComponent}
                                <ItemCard quantity={productUnit.quantity} name={loadedComponent.name} imageUrl={loadedComponent.imageUrl}/>
                            {/await}
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>