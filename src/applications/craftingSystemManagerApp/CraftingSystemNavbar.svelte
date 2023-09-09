<script lang="ts">
    import Properties from "../../scripts/Properties";
    import CraftingSystemNavbarItem from "./CraftingSystemNavbarItem.svelte";
    import {key} from "./CraftingSystemManagerApp";
    import {getContext} from "svelte";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.navbar`;

    const {
        craftingSystems,
        craftingSystemEditor,
        selectedCraftingSystem,
        localization,
        loading
    } = getContext(key);

    async function createCraftingSystem() {
        $loading = true;
        $selectedCraftingSystem = await craftingSystemEditor.createNewCraftingSystem();
        $loading = false;
    }

    async function importCraftingSystem(targetCraftingSystemId) {
        await craftingSystemEditor.importCraftingSystem(targetCraftingSystemId);
    }

</script>

<!-- CraftingSystemNavbar.svelte -->
<aside class="fab-vertical-nav">
    <div class="fab-header">
        <h1>Crafting Systems</h1>
    </div>
    {#if $craftingSystems.length > 0}
        <div class="fab-items fab-scrollable">
            {#each $craftingSystems as craftingSystem}
                <CraftingSystemNavbarItem craftingSystem="{craftingSystem}" />
            {/each}
        </div>
    {:else }
        <div class="fab-no-items">
            <p>No crafting systems have been created yet.</p>
        </div>
    {/if}
    <div class="fab-footer">
        <button on:click={createCraftingSystem}><i class="fa-solid fa-file-pen"></i>{localization.localize(`${localizationPath}.buttons.create`)}</button>
        <button on:click={importCraftingSystem}><i class="fa-solid fa-file-import"></i>{localization.localize(`${localizationPath}.buttons.importNew`)}</button>
    </div>
</aside>