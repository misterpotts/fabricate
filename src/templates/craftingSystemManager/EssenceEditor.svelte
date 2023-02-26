<!-- EssenceEditor.svelte -->
<script lang="ts">
    import {fade} from 'svelte/transition';
    import Properties from "../../scripts/Properties.js";
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import {Essence} from "../../scripts/common/Essence";
    import {DropEventParser} from "./DropEventParser";
    import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
    import {ICON_NAMES} from "../FontAwesomeIcons";
    import {clickOutside} from "../common/ClickOutside";

    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let loading = false;

    let selectedSystem;
    let essences = [];

    let iconCodeSearch = "";
    let selectedEssenceIconModal = null;
    let icons = [];

    craftingSystemManager.craftingSystemsStore.value.subscribe(async (value) => {
        selectedSystem = value.selectedSystem;
        if (selectedSystem) {
            essences = selectedSystem.getEssences();
            iconCodeSearch = "";
            selectedEssenceIconModal = null;
            searchIcons(iconCodeSearch);
        }
    });

    function searchIcons(target) {
        const predicate = iconName => iconName.search(new RegExp(target, "i")) >= 0;
        const solidCssClasses = ICON_NAMES
            .filter(predicate)
            .map(iconCode => `fa-solid fa-${iconCode}`);
        const regularCssClasses = ICON_NAMES
            .filter(predicate)
            .map(iconCode => `fa-regular fa-${iconCode}`);
        icons = solidCssClasses
            .concat(regularCssClasses);
    }

    async function createEssence() {
        const createdEssence = new Essence({
            id: randomID(),
            name: "Essence name",
            tooltip: "My new Essence",
            iconCode: "fa-solid fa-mortar-pestle",
            description: `A new Essence added to ${selectedSystem.name}`
        });
        selectedSystem.editEssence(createdEssence);
        loading = true;
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        const message = craftingSystemManager.i18n.format(
            `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.created`,
            {
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
        loading = false;
    }

    function editEssenceIcon(essence) {
        throw new Error("Not implemented!");
    }

    async function deleteEssence(event, essence) {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: craftingSystemManager.i18n.format(
                    `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.prompts.delete.title`,
                    {
                        essenceName: essence.name
                    }
                ),
                content: craftingSystemManager.i18n.format(
                    `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.prompts.delete.content`,
                    {
                        essenceName: essence.name,
                        systemName: selectedSystem.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        selectedSystem.deleteEssenceById(essence.id);
        loading = true;
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        const message = craftingSystemManager.i18n.format(
            `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.deleted`,
            {
                essenceName: essence.name,
                systemName: selectedSystem.name
            }
        );
        ui.notifications.info(message);
        loading = false;
    }

    async function addActiveEffectSource(event, essence) {
        const dropEventParser = new DropEventParser({
            event,
            i18n: craftingSystemManager.i18n,
            documentManager: new DefaultDocumentManager(),
            partType: craftingSystemManager.i18n.localize(`${Properties.module.id}.typeNames.activeEffectSource.singular`)
        })
        essence.activeEffectSource = await dropEventParser.parse();
        loading = true;
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        loading = false;
    }

    let scheduledUpdate;
    async function updateEssence() {
        clearTimeout(scheduledUpdate);
        scheduledUpdate = setTimeout(async () => {
            loading = true;
            await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
            loading = false;
        }, 500);
    }

    async function removeActiveEffectSource(event, essence) {
        essence.activeEffectSource = null;
        loading = true;
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        loading = false;
    }

    async function openActiveEffectSourceItemSheet(essence) {
        const document = await new DefaultDocumentManager().getDocumentByUuid(essence.activeEffectSource.uuid);
        await document.sourceDocument.sheet.render(true);
    }

    async function setIconCode(essence, code) {
        essence.iconCode = code;
        loading = true;
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
        selectedEssenceIconModal = null;
        loading = false;
    }

    function showEssenceIconModal(essence) {
        selectedEssenceIconModal = essence;
    }

    function hideEssenceIconModal() {
        selectedEssenceIconModal = null;
    }

</script>

{#if loading}
    <div class="loading" transition:fade="{{duration: 100}}">
        <div class="loading-inner">
            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
    </div>
{/if}
<div class="fab-essence-editor fab-column">
    <div class="fab-hero-banner fab-row">
        <img src="{Properties.ui.banners.essenceEditor}" >
    </div>
    {#if !selectedSystem.isLocked}
        <div class="fab-row">
            <button class="fab-new-essence" on:click={createEssence}><i class="fa-solid fa-mortar-pestle"></i> {craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.buttons.create`)}</button>
        </div>
    {/if}
    {#if selectedSystem.hasEssences}
        <div class="fab-essences" class:fab-locked={selectedSystem.isLocked} class:fab-unlocked={!selectedSystem.isLocked}>
            {#each essences as essence}
                <div class="fab-essence-ae-source fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.labels.activeEffectSource`)}:</p>
                        {#if !selectedSystem?.isLocked}
                            {#if essence.hasActiveEffectSource}
                                <button on:auxclick={(e) => removeActiveEffectSource(e, essence)} on:click={openActiveEffectSourceItemSheet(essence)} on:drop|preventDefault={(e) => addActiveEffectSource(e, essence)}>
                                    <img class="fab-essence-ae-source-img" src="{essence.activeEffectSource.imageUrl}" data-tooltip="{essence.activeEffectSource.name}" />
                                </button>
                            {:else}
                                <div class="fab-drop-zone fab-essence-ae-source-add" on:drop|preventDefault={(e) => addActiveEffectSource(e, essence)}><i class="fa-solid fa-plus"></i></div>
                            {/if}
                        {:else}
                            {#if essence.hasActiveEffectSource}
                                <img src="{essence.activeEffectSource.imageUrl}" data-tooltip="{essence.activeEffectSource.name}" />
                            {:else}
                                <p>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.info.noAeSource`)}</p>
                            {/if}
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-icon fab-column">
                    <div class="fab-row" style="position:relative;">
                        <p class="fab-label">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.labels.icon`)}: </p>
                        {#if !selectedSystem?.isLocked}
                            <button class="fab-essence-icon-btn" on:click={showEssenceIconModal(essence)}>
                                <i class="{essence.iconCode}"></i>
                            </button>
                            {#if essence === selectedEssenceIconModal}
                                <div class="fab-essence-icon-modal" use:clickOutside on:clickOutside={hideEssenceIconModal}>
                                    <input type="text" bind:value={iconCodeSearch} on:input={searchIcons(iconCodeSearch)} placeholder="Search for an icon" />
                                    <div class="fab-scrollable fab-essence-icon-opts">
                                        {#each icons as css}
                                            <button on:click={setIconCode(essence, css)}>
                                                <i class="{css}"></i>
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        {:else}
                            <i class="{essence.iconCode}"></i>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-name fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.labels.name`)}: </p>
                        {#if !selectedSystem?.isLocked}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.name} on:input={updateEssence(essence)}>{essence.name}</div>
                        {:else}
                            <div class="fab-locked ">{essence.name}</div>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-tooltip fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.labels.tooltip`)}: </p>
                        {#if !selectedSystem?.isLocked}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.tooltip} on:input={updateEssence(essence)}>{essence.tooltip}</div>
                        {:else}
                            <div class="fab-locked ">{essence.tooltip}</div>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-description fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.labels.description`)}: </p>
                        {#if !selectedSystem?.isLocked}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.description} on:input={updateEssence(essence)}>{essence.description}</div>
                        {:else}
                            <div class="fab-locked ">{essence.description}</div>
                        {/if}
                    </div>
                </div>
                {#if !selectedSystem.isLocked}
                <div class="fab-delete-essence fab-column">
                    <div class="fab-row">
                        <button class="fab-delete-essence" on:click={(e) => deleteEssence(e, essence)}><i class="fa-solid fa-trash"></i> {craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.buttons.delete`)}</button>
                    </div>
                </div>
                    <div class="fab-grid-spacer"></div>
                {:else}
                    <div class="fab-grid-spacer"></div>
                {/if}
            {/each}
        </div>
    {:else}
        <div class="fab-no-essences">
            <p>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.info.noEssences`)}</p>
            {#if !selectedSystem.isLocked}<p>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.essence.info.createFirst`)}</p>{/if}
        </div>
    {/if}
</div>