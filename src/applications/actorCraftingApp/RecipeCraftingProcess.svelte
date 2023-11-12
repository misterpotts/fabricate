<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {AppBar} from "@skeletonlabs/skeleton";
    import {NoCraftingProcess, type CraftingProcess} from "./CraftingProcess";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let craftingProcess: CraftingProcess = new NoCraftingProcess();

    /*
     * ===========================================================================
     * Private component functions
     * ===========================================================================
     */

    function clearCraftingProcess() {
        craftingProcess = new NoCraftingProcess();
    }

</script>

<AppBar background="bg-surface-700 text-white">
    <svelte:fragment slot="lead"><i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearCraftingProcess}></i></svelte:fragment>
    <h2 class="text-lg">Crafting {craftingProcess.recipeName}</h2>
</AppBar>