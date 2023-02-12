<script lang="ts">
    import CraftingSystemNavbarItem from "./CraftingSystemNavbarItem.svelte";
    import NavbarState from "./CraftingSystemNavbarState.ts";

    export let systems = [];
    NavbarState.setSystems(systems)
</script>

<!-- CraftingSystemNavbar.svelte -->
<aside class="fab-vertical-nav">
    <div class="fab-header">
        <h1>Crafting Systems</h1>
    </div>
    <div class="fab-items">
        {#each systems as system}
            <CraftingSystemNavbarItem system="{system}" />
        {/each}
    </div>
    <div class="fab-footer">
        <button><i class="fa-solid fa-file-pen"></i> Create</button>
        <button><i class="fa-solid fa-file-import"></i> Import</button>
    </div>
</aside>