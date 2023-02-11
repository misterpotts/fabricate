<script lang="ts">
    import CraftingSystemNavbarItem from "./CraftingSystemNavbarItem.svelte";

    export let items = [];
</script>

<!-- CraftingSystemNavbar.svelte -->
<aside class="fab-vertical-nav">
    <div class="fab-header">
        <h1>Crafting Systems</h1>
    </div>
    <div class="fab-items">
        {#each items as item}
            <CraftingSystemNavbarItem bind:item />
        {/each}
    </div>
    <div class="fab-footer">
        <button><i class="fa-solid fa-file-pen"></i> Create</button>
        <button><i class="fa-solid fa-file-import"></i> Import</button>
    </div>
</aside>