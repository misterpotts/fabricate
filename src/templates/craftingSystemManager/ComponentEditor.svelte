<script lang="ts">
    import {fade} from 'svelte/transition';
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import Properties from "../../scripts/Properties.js";
    import {DropEventParser} from "./DropEventParser";
    import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
    import {Unit} from "../../scripts/common/Combination";
    import truncate from "../common/Truncate";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let loading = false;

    let availableComponents = [];
    let formattedEssences = [];

    let selectedSystem;
    let selectedComponent;
    let searchName = "";

    craftingSystemManager.craftingSystemsStore.value.subscribe(async (value) => {
        selectedSystem = value.selectedSystem;
        searchName = "";
        if (selectedComponent) {
            formattedEssences = formatEssences(selectedComponent, selectedSystem);
        }
    });

    craftingSystemManager.selectedComponentStore.selectedComponent.subscribe(component => {
        // this is weird and counterintuitive, but nulling it breaks this component
        // because this is evaluated *before* ComponentsTab switches to the browser
        // todo: refactor application state into a series of individual stores (some derived) that make single system loading possible
        if (component) {
            selectedComponent = component;
            searchName = "";
        }
        availableComponents = filterAvailableComponents(selectedSystem.getComponents(), searchName);
        formattedEssences = formatEssences(selectedComponent, selectedSystem);
    });

    function formatEssences(component, system) {
        if (!component || !system || !system.hasEssences) {
            return [];
        }
        return system.getEssences().map(essence => {
            return new Unit(essence, component.essences.amountFor(essence.id));
        });
    }

    function filterAvailableComponents(components, searchName) {
        if (!components || components.length === 0) {
            return [];
        }
        return components
            .filter(component => component !== selectedComponent)
            .filter(component => component.name.search(new RegExp(searchName, "i")) >= 0);
    }

    function deselectComponent() {
        craftingSystemManager.selectedComponentStore.deselect();
    }

    async function replaceItem(event) {
        loading = true;
        const dropEventParser = new DropEventParser({
            event,
            i18n: craftingSystemManager.i18n,
            documentManager: new DefaultDocumentManager(),
            partType: craftingSystemManager.i18n.localize(`${Properties.module.id}.typeNames.component.singular`)
        })
        const itemData = await dropEventParser.parse();
        if (selectedSystem.includesComponentByItemUuid(itemData.uuid)) {
            const existingComponent = selectedSystem.getComponentByItemUuid(itemData.uuid);
            const message = craftingSystemManager.i18n.format(
                `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.errors.import.itemAlreadyIncluded`,
                {
                    itemUuid: itemData.uuid,
                    componentName: existingComponent.name,
                    systemName: selectedSystem.name
                }
            );
            ui.notifications.error(message);
            loading = false;
            return;
        }
        const previousItemName = selectedComponent.name;
        selectedComponent.itemData = itemData;
        selectedSystem.editComponent(selectedComponent);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        await craftingSystemManager.craftingSystemsStore.reloadComponents();
        const message = craftingSystemManager.i18n.format(
            `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.replaced`,
            {
                previousItemName,
                itemName: selectedComponent.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
        loading = false;
        return;
    }
    
    async function incrementEssence(essence) {
        loading = true;
        selectedComponent.essences = selectedComponent.essences.add(new Unit(essence, 1));
        selectedSystem.editComponent(selectedComponent);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        loading = false;
    }

    async function decrementEssence(essence) {
        loading = true;
        selectedComponent.essences = selectedComponent.essences.minus(new Unit(essence, 1));
        selectedSystem.editComponent(selectedComponent);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        loading = false;
    }

    let scheduledSearch;
    function updateSearch() {
        clearTimeout(scheduledSearch);
        scheduledSearch = setTimeout(() => {
            availableComponents = filterAvailableComponents(selectedSystem.getComponents(), searchName);
        }, 500);
    }

</script>

{#if loading}
    <div class="fab-loading" transition:fade="{{duration: 100}}">
        <div class="fab-loading-inner">
            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
    </div>
{/if}
<div class="fab-component-editor fab-column">
    <div class="fab-hero-banner fab-row">
        <img src="{Properties.ui.banners.componentEditor}" alt="Component editor banner">
        <div class="fab-buttons">
            <button class="fab-deselect-component" on:click={deselectComponent}><i class="fa-solid fa-circle-chevron-left"></i> {craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.deselect`)}</button>
        </div>
    </div>
    <div class="fab-tab-header fab-row" class:fab-error={selectedComponent.hasErrors}>
        <img src="{selectedComponent.imageUrl}" width="48px" height="48px"  alt="{selectedComponent.name} icon"/>
        <h2 class="fab-component-name">{selectedComponent.name}</h2>
        <div class="fab-drop-zone fab-swap-item" on:drop|preventDefault={(e) => replaceItem(e)}>
            <i class="fa-solid fa-arrow-right-arrow-left"></i>
            {craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.labels.replaceItem`)}
        </div>
    </div>
    <div class="fab-row fab-columns">
        <div class="fab-column">
            <div class="fab-row">
                <h3>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.labels.salvageHeading`)}</h3>
            </div>
        </div>
        <div class="fab-column">
            <div class="fab-row">
                <h3>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.labels.availableComponentsHeading`)}</h3>
            </div>
            <div class="fab-row fab-salvage-search">
                <p class="fab-label fab-inline">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.search.name`)}: </p>
                <input type="text" bind:value={searchName} on:input={updateSearch} />
            </div>
            <div class="fab-row">
                {#if availableComponents.length > 0}
                    <div class="fab-component-grid fab-grid-4 fab-scrollable fab-salvage-source">
                        {#each availableComponents as component}
                            <div class="fab-component" draggable="true">
                                <div class="fab-component-name" draggable="false">
                                    <p draggable="false">{truncate(component.name, 9)}</p>
                                </div>
                                <div class="fab-component-preview" draggable="false">
                                    <div class="fab-component-image" data-tooltip={component.name} draggable="false">
                                        <img src={component.imageUrl} alt={component.name} draggable="false" />
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div><p>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.info.noAvailableSalvage`)}</p></div>
                {/if}
            </div>
        </div>
    </div>
    <div class="fab-row">
        <h3>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.labels.essencesHeading`)}</h3>
    </div>
    <div class="fab-row">
        <div class="fab-component-essences">
            {#if selectedSystem.hasEssences}
                {#each formattedEssences as essenceUnit}
                    <div class="fab-component-essence-adjustment">
                        <button class="fab-increment-essence" on:click={incrementEssence(essenceUnit.part)}><i class="fa-solid fa-plus"></i></button>
                        <div class="fab-essence-amount">
                            <span class="fab-essence-quantity">
                                {essenceUnit.quantity}
                            </span>
                            <span class="fab-essence-icon">
                                <i class="{essenceUnit.part.iconCode}"></i>
                            </span>
                            <span class="fab-essence-name">
                                {essenceUnit.part.name}
                            </span>
                        </div>
                        <button class="fab-decrement-essence" on:click={decrementEssence(essenceUnit.part)}><i class="fa-solid fa-minus"></i></button>
                    </div>
                {/each}
            {:else}
                <div class="fab-no-essence-opts"><p>{craftingSystemManager.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.info.noAvailableEssences`, { systemName: selectedSystem.name, componentName: selectedComponent.name })}</p></div>
            {/if}
        </div>
    </div>
</div>
