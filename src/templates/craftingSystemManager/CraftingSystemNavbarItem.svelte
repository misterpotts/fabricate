<script lang="ts">
    import { getContext } from 'svelte';
    import { key } from "./CraftingSystemManagerApp"

    export let system = {
        id: "",
        hasErrors: false,
        name: "Unknown Crafting System",
        summary: "No details",
        isLocked: true
    };

    const { navbar } = getContext(key);

    function selectSystem() {
        navbar.selectSystem(system);
    }
</script>

<!-- CraftingSystemNavbarItem.svelte -->
<div class="fab-nav-item" class:fab-selected={$navbar.selectedSystem === system} on:click={selectSystem}>
    <div class="fab-button">
        <i class="fa-solid fa-circle"></i><p>{system.name}</p>{#if system.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
    </div>
    {#if $navbar.selectedSystem !== system}<hr />{/if}
    {#if $navbar.selectedSystem === system}
        <div class="fab-context-menu">
            <p class="fab-description">{system.summary}</p>
            <hr />
            <div class="fab-ctx-menu-buttons">
                {#if !system.isLocked}
                    <button><i class="fa-solid fa-file-import fa-fw"></i> Import</button>
                {/if}
                <button><i class="fa-solid fa-file-export fa-fw"></i> Export</button>
                <button><i class="fa-solid fa-paste fa-fw"></i> Duplicate</button>
                {#if !system.isLocked}
                    <button><i class="fa-solid fa-trash fa-fw"></i> Delete</button>
                {/if}
            </div>
        </div>
    {/if}
</div>