<script lang="ts">
    import {onMount} from 'svelte';
    import CraftingSystemNavbarItem from "./CraftingSystemNavbarItem.svelte";
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";

    export let systems = [];

    onMount(async () => {
        const craftingSystemManager = CraftingSystemManagerApp.getInstance();
        await craftingSystemManager.craftingSystemsStore.loadAll();
        craftingSystemManager.craftingSystemsStore.value
            .subscribe((value) => systems = value);
        if (systems.length > 0) {
            craftingSystemManager.selectedCraftingSystemStore.selectSystemById(systems[0].id);
        }
    });

    async function createCraftingSystem() {
        const craftingSystemManager = CraftingSystemManagerApp.getInstance();
        const created = await craftingSystemManager.craftingSystemsStore.create();
        craftingSystemManager.selectedCraftingSystemStore.selectSystemById(created.id);
    }
</script>

<!-- CraftingSystemNavbar.svelte -->
<aside class="fab-vertical-nav">
    <div class="fab-header">
        <h1>Crafting Systems</h1>
    </div>
    {#if systems && systems.length > 0}
        <div class="fab-items">
            {#each systems as system}
                <CraftingSystemNavbarItem system="{system}" />
            {/each}
        </div>
    {:else }
        <div class="fab-no-items">
            <p>No crafting systems have been created yet.</p>
        </div>
    {/if}
    <div class="fab-footer">
        <button on:click={createCraftingSystem}><i class="fa-solid fa-file-pen"></i> Create</button>
        <button><i class="fa-solid fa-file-import"></i> Import</button>
    </div>
</aside>