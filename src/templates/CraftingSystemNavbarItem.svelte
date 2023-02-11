<script lang="ts">
    export let item = {
        hasErrors: false,
        name: "Unknown Crafting System",
        summary: "No details",
        locked: true,
        selected: false
    };
</script>

<!-- CraftingSystemNavbarItem.svelte -->
<div class="fab-nav-item" class:fabricate-selected={item.selected}>
    <div class="fab-button">
        <i class="fa-solid fa-circle"></i> {item.name} {#if item.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
    </div>
    {#if item.selected}
        <div class="fab-context-menu">
            <p class="fab-description">{item.summary}</p>
            {#if !item.locked}
                <button><i class="fa-solid fa-file-import fa-fw"></i> Import</button>
            {/if}
            <button><i class="fa-solid fa-file-export fa-fw"></i> Export</button>
            <button><i class="fa-solid fa-paste fa-fw"></i> Duplicate</button>
            {#if !item.locked}
                <button><i class="fa-solid fa-trash fa-fw"></i> Delete</button>
            {/if}
        </div>
    {/if}
</div>