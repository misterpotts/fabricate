<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp"

    export let system;

    const craftingSystemManager = CraftingSystemManagerApp.getInstance();
    const selectedCraftingSystem = craftingSystemManager.selectedCraftingSystemStore.selectedSystem;

    function selectSystem() {
        craftingSystemManager.selectedCraftingSystemStore.selectSystemById(system.id);
    }

    async function deleteSystem() {
        await craftingSystemManager.craftingSystemsStore.deleteCraftingSystem(system);
        craftingSystemManager.selectedCraftingSystemStore.deselectById(system.id);
    }
</script>

<!-- CraftingSystemNavbarItem.svelte -->
<div class="fab-nav-item" class:fab-selected={$selectedCraftingSystem === system} on:click={selectSystem}>
    <div class="fab-button">
        <i class="fa-solid fa-circle"></i><p>{system.name}</p>{#if system.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
    </div>
    {#if $selectedCraftingSystem !== system}<hr />{/if}
    {#if $selectedCraftingSystem === system}
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
                    <button on:click={deleteSystem}><i class="fa-solid fa-trash fa-fw"></i> Delete</button>
                {/if}
            </div>
        </div>
    {/if}
</div>