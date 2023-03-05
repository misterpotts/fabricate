<script lang="ts">
    import Properties from "../../scripts/Properties";
    import {getContext} from "svelte";
    import {key} from "./CraftingSystemManagerApp";

    export let craftingSystem;
    const { craftingSystemEditor, selectedCraftingSystem, localization } = getContext(key);
    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.navbar`;

    async function selectSystem() {
        $selectedCraftingSystem = craftingSystem;
    }

    async function deleteSystem() {
        await craftingSystemEditor.deleteCraftingSystem(craftingSystem);
    }

    async function importCraftingSystem() {
        await craftingSystemEditor.importCraftingSystem((craftingSystem) => {
            $selectedCraftingSystem = craftingSystem;
        }, craftingSystem);
    }

    function exportSystem() {
        craftingSystemEditor.exportCraftingSystem(craftingSystem);
    }

    async function duplicateSystem() {
        $selectedCraftingSystem = await craftingSystemEditor.duplicateCraftingSystem(craftingSystem);
    }

</script>

<!-- CraftingSystemNavbarItem.svelte -->
<div class="fab-nav-item" class:fab-selected={$selectedCraftingSystem === craftingSystem} on:click={selectSystem}>
    <div class="fab-button" data-tooltip="{craftingSystem.hasErrors ? localization.localize(`${localizationPath}.items.systemHasError`) : null}">
        <i class="fa-solid fa-circle"></i><p>{craftingSystem.name} {#if craftingSystem.isLocked}<i class="fa-solid fa-lock"></i>{/if}</p>{#if craftingSystem.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
    </div>
    {#if $selectedCraftingSystem !== craftingSystem}<hr />{/if}
    {#if $selectedCraftingSystem === craftingSystem}
        <div class="fab-context-menu">
            <p class="fab-description">{craftingSystem.summary}</p>
            <hr />
            <div class="fab-ctx-menu-buttons">
                {#if !craftingSystem.isLocked}
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
                {#if !craftingSystem.isLocked}
                    <button on:click={deleteSystem}>
                        <i class="fa-solid fa-trash fa-fw"></i>{localization.localize(`${localizationPath}.buttons.delete`)}
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</div>
