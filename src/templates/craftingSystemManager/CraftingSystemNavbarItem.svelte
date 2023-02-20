<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp"
    import Properties from "../../scripts/Properties";

    export let system;

    const craftingSystemManager = CraftingSystemManagerApp.getInstance();
    let selectedCraftingSystem;
    craftingSystemManager.craftingSystemsStore.value.subscribe(value => {
        selectedCraftingSystem = value.selectedSystem;
    });

    async function selectSystem() {
        await craftingSystemManager.craftingSystemsStore.select(system);
    }

    async function deleteSystem() {
        await craftingSystemManager.craftingSystemsStore.deleteCraftingSystem(system);
    }

    async function importCraftingSystem() {
        await craftingSystemManager.craftingSystemsStore.importCraftingSystem(system);
    }

    function exportSystem() {
        craftingSystemManager.craftingSystemsStore.exportCraftingSystem(system);
    }

    function duplicateSystem() {
        craftingSystemManager.craftingSystemsStore.duplicateCraftingSystem(system);
    }
</script>

<!-- CraftingSystemNavbarItem.svelte -->
<div class="fab-nav-item" class:fab-selected={selectedCraftingSystem === system} on:click={selectSystem}>
    <div class="fab-button">
        <i class="fa-solid fa-circle"></i><p>{system.name} {#if system.isLocked}<i class="fa-solid fa-lock"></i>{/if}</p>{#if system.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
    </div>
    {#if selectedCraftingSystem !== system}<hr />{/if}
    {#if selectedCraftingSystem === system}
        <div class="fab-context-menu">
            <p class="fab-description">{system.summary}</p>
            <hr />
            <div class="fab-ctx-menu-buttons">
                {#if !system.isLocked}
                    <button on:click={importCraftingSystem(system)}>
                        <i class="fa-solid fa-file-import fa-fw"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.navbar.buttons.import`)}
                    </button>
                {/if}
                <button on:click={exportSystem}>
                    <i class="fa-solid fa-file-export fa-fw"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.navbar.buttons.export`)}
                </button>
                <button on:click={duplicateSystem}>
                    <i class="fa-solid fa-paste fa-fw"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.navbar.buttons.duplicate`)}
                </button>
                {#if !system.isLocked}
                    <button on:click={deleteSystem}>
                        <i class="fa-solid fa-trash fa-fw"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.navbar.buttons.delete`)}
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</div>
