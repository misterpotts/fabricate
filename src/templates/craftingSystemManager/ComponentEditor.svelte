<script lang="ts">
    import {fade} from 'svelte/transition';
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import Properties from "../../scripts/Properties.js";
    import {DropEventParser} from "./DropEventParser";
    import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let selectedComponent;
    craftingSystemManager.selectedComponentStore.selectedComponent.subscribe(component => {
        selectedComponent = component;
    });

    let selectedSystem;
    craftingSystemManager.craftingSystemsStore.value.subscribe(async (value) => {
        selectedSystem = value.selectedSystem;
    });

    let loading = false;

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
        <img src="{Properties.ui.banners.componentEditor}" >
        <div class="fab-buttons">
            <button class="fab-deselect-component" on:click={deselectComponent}><i class="fa-solid fa-circle-chevron-left"></i> {craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.deselect`)}</button>
        </div>
    </div>
    <div class="fab-tab-header fab-row">
        <img src="{selectedComponent.imageUrl}" width="48px" height="48px" />
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
        </div>
    </div>
    <div class="fab-row">
        <h3>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.labels.essencesHeading`)}</h3>
    </div>
</div>
