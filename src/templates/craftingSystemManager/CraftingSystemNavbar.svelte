<script lang="ts">
    import { getContext } from 'svelte';
    import CraftingSystemNavbarItem from "./CraftingSystemNavbarItem.svelte";
    import { key } from "./CraftingSystemManagerApp"

    export let systems = [];

    const { navbar } = getContext(key);
    systems = $navbar.systems;
</script>

<!-- CraftingSystemNavbar.svelte -->
<aside class="fab-vertical-nav">
    <div class="fab-header">
        <h1>Crafting Systems</h1>
    </div>
    {#if systems.length > 0}
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
        <button><i class="fa-solid fa-file-pen"></i> Create</button>
        <button><i class="fa-solid fa-file-import"></i> Import</button>
    </div>
</aside>