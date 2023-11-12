<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {AppBar} from "@skeletonlabs/skeleton";
    import {NoSalvageProcess, type SalvageProcess} from "./SalvageProcess";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let salvageProcess: SalvageProcess = new NoSalvageProcess();

    /*
     * ===========================================================================
     * Private component functions
     * ===========================================================================
     */

    function clearSalvageProcess() {
        salvageProcess = new NoSalvageProcess();
    }

</script>

<AppBar background="bg-surface-700 text-white">
    <svelte:fragment slot="lead"><i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearSalvageProcess}></i></svelte:fragment>
    <h2 class="text-lg">Salvaging {salvageProcess.componentName}</h2>
</AppBar>