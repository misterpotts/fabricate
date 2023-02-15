<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import Properties from "../../scripts/Properties";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let selectedSystem;
    let components = [];

    let searchMustHaveEssences = false;
    let searchMustHaveSalvage = false;
    let searchName = "";

    let filteredComponents = [];

    craftingSystemManager.selectedCraftingSystemStore.selectedSystem.subscribe(async (system) => {
        selectedSystem = system;
        if (system) {
            components = await selectedSystem.getComponents();
            filteredComponents = components;
        }
    });

    function searchComponents() {
        if (!components || components.length === 0) {
            return [];
        }
        return components.filter((component) => {
            if (searchMustHaveEssences && !component.hasEssences) {
                return false;
            }
            if (searchMustHaveSalvage && !component.isSalvageable) {
                return false;
            }
            if (!searchName) {
                return true;
            }
            return component.name.search(new RegExp(searchName, "i")) >= 0;
        });
    }

    let scheduledSearch;
    function updateSearch() {
        clearTimeout(scheduledSearch);
        scheduledSearch = setTimeout(() => {
            filteredComponents = searchComponents();
        }, 500);
    }
</script>

<div class="fab-system-components fab-column">
    <div class="fab-tab-header fab-row">
        <h2>{craftingSystemManager.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.title`, { systemName: selectedSystem?.name })}</h2>
    </div>
    <div class="fab-row fab-columns fab-component-search">
        <div class="fab-column fab-row fab-component-name">
            <p class="fab-label fab-inline">Name: </p>
            <input type="text" bind:value={searchName} on:input={updateSearch} />
        </div>
        <div class="fab-column fab-row fab-has-essences">
            <p class="fab-label fab-inline">Must have essences: </p>
            <input type="checkbox" bind:checked={searchMustHaveEssences} on:change={updateSearch} />
        </div>
        <div class="fab-column fab-row fab-has-salvage">
            <p class="fab-label fab-inline">Must have salvage: </p>
            <input type="checkbox" bind:checked={searchMustHaveSalvage} on:change={updateSearch} />
        </div>
    </div>
    <div class="fab-row">
        {#if components?.length > 0}
            <div class="fab-component-grid fab-grid-4">
                {#each filteredComponents as component}
                    <div class="fab-component">
                        <div class="fab-component-name">{component.name}</div>
                        <img class="fab-component-image" src={component.imageUrl} alt={component.name}>
                    </div>
                {/each}
            </div>
            {#if filteredComponents.length === 0}
                <div class="fab-no-search-results">No matching components</div>
            {/if}
        {:else}
            <div class="fab-no-components">
                <p>This Crafting System has no components.</p>
                {#if !selectedSystem.isLocked}<p>Drag and drop an item onto the area above to add your first one!</p>{/if}
            </div>
        {/if}
    </div>
</div>