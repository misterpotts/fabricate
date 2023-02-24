<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import Properties from "../../scripts/Properties";
    import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
    import {CraftingComponent} from "../../scripts/common/CraftingComponent";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let selectedSystem;
    let components = [];

    let searchMustHaveEssences = false;
    let searchMustHaveSalvage = false;
    let searchName = "";

    let filteredComponents = [];

    craftingSystemManager.craftingSystemsStore.value.subscribe(async (value) => {
        selectedSystem = value.selectedSystem;
        searchMustHaveEssences = false;
        searchMustHaveSalvage = false;
        searchName = "";
        if (selectedSystem) {
            components = selectedSystem.getComponents();
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

    async function importComponent(e) {
        const elementData = e
            ?.dataTransfer
            ?.getData("text");
        if (!elementData) {
            const message = craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.errors.import.noElementData`);
            ui.notifications.warn(message);
        }
        try {
            const dropData = JSON.parse(elementData);
            const documentType = dropData.type;
            if (!Properties.module.documents.supportedTypes.includes(documentType)) {
                const message = craftingSystemManager.i18n.format(
                    `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.errors.import.invalidDocumentType`,
                    {
                        suppliedType: documentType,
                        allowedTypes: Properties.module.documents.supportedTypes.join(", ")
                    }
                );
                ui.notifications.warn(message);
            }
            const documentUUID = dropData.uuid;
            if (selectedSystem.includesComponentByItemUuid(documentUUID)) {
                const existingComponent = selectedSystem.getComponentByItemUuid(documentUUID);
                const message = craftingSystemManager.i18n.format(
                    `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.errors.import.itemAlreadyIncluded`,
                    {
                        itemUuid: documentUUID,
                        componentName: existingComponent.name,
                        systemName: selectedSystem.name
                    }
                );
                ui.notifications.warn(message);
                return;
            }
            const fabricateItemData = await new DefaultDocumentManager().getDocumentByUuid(documentUUID);
            const craftingComponent = new CraftingComponent({
                id: randomID(),
                itemData: fabricateItemData
            });
            await selectedSystem.editComponent(craftingComponent);
            await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
            await craftingSystemManager.craftingSystemsStore.reloadComponents();
            const message = craftingSystemManager.i18n.format(
                `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.imported`,
                {
                    componentName: craftingComponent.name,
                    systemName: selectedSystem.name
                }
            );
            ui.notifications.info(message);
        } catch (e) {
            const message = craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.errors.import.invalidJson`);
            ui.notifications.error(message);
        }
    }

    function editComponent(component) {
        craftingSystemManager.selectedComponentStore.selectComponent(component);
    }

    async function deleteComponent(event, component) {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: craftingSystemManager.i18n.format(
                    `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.prompts.delete.title`,
                    {
                        componentName: component.name
                    }
                ),
                content: craftingSystemManager.i18n.format(
                    `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.prompts.delete.content`,
                    {
                        componentName: component.name,
                        systemName: selectedSystem.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        selectedSystem.deleteComponentById(component.id);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        const message = craftingSystemManager.i18n.format(
            `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.deleted`,
            {
                componentName: component.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
    }

    async function disableComponent(component) {
        component.isDisabled = true;
        selectedSystem.editComponent(component);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        const message = craftingSystemManager.i18n.format(
            `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.disabled`,
            {
                componentName: component.name
            }
        );
        ui.notifications.info(message);
    }

    async function enableComponent(component) {
        component.isDisabled = false;
        selectedSystem.editComponent(component);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        const message = craftingSystemManager.i18n.format(
            `${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.enabled`,
            {
                componentName: component.name
            }
        );
        ui.notifications.info(message);
    }

    async function toggleComponentDisabled(component) {
        return component.isDisabled ? enableComponent(component) : disableComponent(component);
    }

    async function duplicateComponent(component) {
        const clonedComponent = component.clone(randomID());
        selectedSystem.editComponent(clonedComponent);
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        throw new Error("Not implemented");
    }

    async function openItemSheet(component) {
        const document = await new DefaultDocumentManager().getDocumentByUuid(component.id);
        await document.sourceDocument.sheet.render(true);
    }

</script>

<div class="fab-system-components fab-column">
    {#if !selectedSystem.isLocked}
        <div class="fab-tab-header fab-row">
            <h2>{craftingSystemManager.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.addNew`, { systemName: selectedSystem?.name })}</h2>
        </div>
        <div class="fab-drop-zone fab-add-component" on:drop|preventDefault={importComponent}>
            <i class="fa-solid fa-plus"></i>
        </div>
    {/if}
    <div class="fab-tab-header fab-row">
        <h2>{craftingSystemManager.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.search.title`, { systemName: selectedSystem?.name })}</h2>
    </div>
    <div class="fab-row fab-columns fab-component-search">
        <div class="fab-column fab-row fab-component-name">
            <p class="fab-label fab-inline">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.search.name`)}</p>
            <input type="text" bind:value={searchName} on:input={updateSearch} />
        </div>
        <div class="fab-column fab-row fab-has-essences">
            <p class="fab-label fab-inline">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.search.hasEssences`)}</p>
            <input type="checkbox" bind:checked={searchMustHaveEssences} on:change={updateSearch} />
        </div>
        <div class="fab-column fab-row fab-has-salvage">
            <p class="fab-label fab-inline">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.search.hasSalvage`)}</p>
            <input type="checkbox" bind:checked={searchMustHaveSalvage} on:change={updateSearch} />
        </div>
    </div>
    {#if components?.length > 0}
        <div class="fab-row">
            <div class="fab-component-grid fab-grid-4">
                {#each filteredComponents as component}
                    <div class="fab-component" class:fab-disabled={component.isDisabled} class:fab-error={component.hasErrors}>
                        <div class="fab-component-name" >
                            <p>{component.name}</p>
                            {#if component.hasErrors}<i class="fa-solid fa-circle-exclamation"></i>{/if}
                        </div>
                        <div class="fab-columns fab-component-preview">
                            {#if !component.hasErrors}
                                <div class="fab-column fab-component-image" data-tooltip="{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.openSheet`)}" on:click={openItemSheet(component)}>
                                    <img src={component.imageUrl} alt={component.name} />
                                </div>
                            {:else}
                                <div class="fab-column fab-component-image" data-tooltip="{craftingSystemManager.i18nExtension.localizeAll(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.errors`, component.errorCodes)}">
                                    <img src={component.imageUrl} alt={component.name} />
                                </div>
                            {/if}
                            {#if !selectedSystem.isLocked}
                            <div class="fab-column fab-component-editor-buttons">
                                <button class="fab-edit-component" on:click|preventDefault={editComponent(component)} data-tooltip="{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.edit`)}"><i class="fa-solid fa-file-pen"></i></button>
                                <button class="fab-edit-component" on:click|preventDefault={event => deleteComponent(event, component)} data-tooltip="{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.delete`)}"><i class="fa-solid fa-trash fa-fw"></i></button>
                                <button class="fab-edit-component" on:click|preventDefault={toggleComponentDisabled(component)} data-tooltip="{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.disable`)}"><i class="fa-solid fa-ban"></i></button>
                                <button class="fab-edit-component" on:click|preventDefault={duplicateComponent(component)} data-tooltip="{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.component.buttons.duplicate`)}"><i class="fa-solid fa-paste fa-fw"></i></button>
                            </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        {#if filteredComponents.length === 0}
            <div class="fab-no-search-results"><p>No matching components</p></div>
        {/if}
    {:else}
        <div class="fab-no-components">
            <p>This Crafting System has no components.</p>
            {#if !selectedSystem.isLocked}<p>Drag and drop an item onto the area above to add your first one!</p>{/if}
        </div>
    {/if}
</div>