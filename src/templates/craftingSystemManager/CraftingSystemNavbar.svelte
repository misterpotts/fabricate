<script lang="ts">
    import {onMount} from 'svelte';
    import Properties from "../../scripts/Properties";
    import CraftingSystemNavbarItem from "./CraftingSystemNavbarItem.svelte";
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";

    export let systems = [];
    let craftingSystemManager = CraftingSystemManagerApp.getInstance();

    onMount(async () => {
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

    async function importCraftingSystem() {
        await craftingSystemManager.craftingSystemsStore.importCraftingSystem();
    }
</script>

<!-- CraftingSystemNavbar.svelte -->
<aside class="fab-vertical-nav">
    <div class="fab-header">
        <h1>Crafting Systems</h1>
    </div>
    {#if systems && systems.length > 0}
        <div class="fab-items fab-scrollable">
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
        <button on:click={createCraftingSystem}><i class="fa-solid fa-file-pen"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.navbar.buttons.create`)}</button>
        <button on:click={importCraftingSystem}><i class="fa-solid fa-file-import"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.navbar.buttons.importNew`)}</button>
    </div>
</aside>