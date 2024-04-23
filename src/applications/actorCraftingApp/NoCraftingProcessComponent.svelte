<script lang="ts">

    import Properties from "../../scripts/Properties";
    import {NoCraftingProcess} from "./CraftingProcess.js";

    export let craftingProcess: NoCraftingProcess;

    function reportError() {
        window.open(Properties.module.repository.bugReportUrl, '_blank').focus();
    }

    function clearCraftingProcess() {
        craftingProcess = new NoCraftingProcess();
    }

</script>

<div class="flex w-full h-full items-center justify-center">
    <div class="alert h-1/5 w-5/6 variant-filled-error">
        <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
        <div class="alert-message variant-filled-error">
            <h3 class="font-bold text-lg">Oops!</h3>
            <p class="w-full leading-relaxed">
                The Crafting process was started without a craftable Recipe!
                This shouldn't be possible, and is likely to be a bug in Fabricate.
            </p>
        </div>
        <div class="alert-actions space-x-4">
            <button class="btn bg-white text-black p-3" on:click={reportError}>
                <i class="fa-solid fa-external-link"></i>
                Report it
            </button>
            <button class="btn bg-white text-black p-3" on:click={clearCraftingProcess}>
                <i class="fa-solid fa-times"></i>
                Ignore it
            </button>
        </div>
    </div>
</div>