<script lang="ts">
    import Properties from "../../scripts/Properties";
    import {getContext} from "svelte";
    import {key} from "./CraftingSystemManagerApp";

    export let craftingSystem;
    const {
        craftingSystemEditor,
        selectedCraftingSystem,
        localization
    } = getContext(key);
    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.navbar`;

    async function selectSystem() {
        $selectedCraftingSystem = craftingSystem;
    }

    async function deleteSystem() {
        await craftingSystemEditor.deleteCraftingSystem(craftingSystem);
    }

    async function importCraftingSystem(craftingSystem) {
        await craftingSystemEditor.importCraftingSystem(craftingSystem);
    }

    async function exportSystem() {
        await craftingSystemEditor.exportCraftingSystem(craftingSystem);
    }

    async function duplicateSystem() {
        $selectedCraftingSystem = await craftingSystemEditor.duplicateCraftingSystem(craftingSystem);
    }

</script>

<!-- CraftingSystemNavbarItem.svelte -->
<div class="fab-nav-item" class:fab-selected={$selectedCraftingSystem === craftingSystem} on:click={selectSystem}>
    <div class="fab-button" data-tooltip="{craftingSystem.hasErrors ? localization.localize(`${localizationPath}.items.systemHasError`) : null}">
        <i class="fa-solid fa-circle"></i><p>{craftingSystem.details.name} {#if craftingSystem.embedded}<i class="fa-solid fa-lock"></i>{/if}</p>{#if craftingSystem.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
    </div>
    {#if $selectedCraftingSystem !== craftingSystem}<hr />{/if}
    {#if $selectedCraftingSystem === craftingSystem}
        <div class="fab-context-menu">
            <p class="fab-description">{craftingSystem.details.summary}</p>
            <hr />
            <div class="fab-ctx-menu-buttons">
                {#if !craftingSystem.embedded}
                    <button on:click={importCraftingSystem(craftingSystem)}>
                        <i class="fa-solid fa-file-import fa-fw"></i>{localization.localize(`${localizationPath}.buttons.import`)}
                    </button>
                {/if}
                <button on:click={exportSystem}>
                    <i class="fa-solid fa-file-export fa-fw"></i>{localization.localize(`${localizationPath}.buttons.export`)}
                </button>
                <button on:click={duplicateSystem}>
                    <i class="fa-solid fa-paste fa-fw"></i>{localization.localize(`${localizationPath}.buttons.duplicate`)}
                </button>
                {#if !craftingSystem.embedded}
                    <button on:click={deleteSystem}>
                        <i class="fa-solid fa-trash fa-fw"></i>{localization.localize(`${localizationPath}.buttons.delete`)}
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</div>
