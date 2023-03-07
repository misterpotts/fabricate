<!-- EssenceEditor.svelte -->
<script lang="ts">
    import Properties from "../../scripts/Properties.js";
    import {key} from "./CraftingSystemManagerApp";
    import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
    import {ICON_NAMES} from "../FontAwesomeIcons";
    import {clickOutside} from "../common/ClickOutside";
    import {getContext} from "svelte";
    import {EssenceManager} from "./EssenceManager";
    
    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences`;

    const { 
        localization, 
        loading, 
        selectedCraftingSystem,
        craftingSystemEditor
    } = getContext(key);

    const essenceEditor = new EssenceManager({
        localization,
        localizationPath,
        craftingSystemEditor
    });

    let iconCodeSearch = "";
    let selectedEssenceIconModal = null;
    let icons = searchIcons("");

    function searchIcons(target) {
        const predicate = iconName => iconName.search(new RegExp(target, "i")) >= 0;
        const solidCssClasses = ICON_NAMES
            .filter(predicate)
            .map(iconCode => `fa-solid fa-${iconCode}`);
        const regularCssClasses = ICON_NAMES
            .filter(predicate)
            .map(iconCode => `fa-regular fa-${iconCode}`);
       return solidCssClasses
           .concat(regularCssClasses);
    }

    async function createEssence() {
        $loading = true;
        await essenceEditor.create($selectedCraftingSystem);
        $loading = false;
    }

    async function deleteEssence(event, essence) {
        $loading = true;
        await essenceEditor.deleteEssence(event, essence, $selectedCraftingSystem);
        $loading = false;
    }

    async function addActiveEffectSource(event, essence) {
        $loading = true;
        await essenceEditor.setActiveEffectSource(event, essence, $selectedCraftingSystem);
        $loading = false;
    }

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            $loading = true;
            await craftingSystemEditor.saveCraftingSystem($selectedCraftingSystem);
            $loading = false;
        }, 1000);
    }

    async function removeActiveEffectSource(essence) {
        $loading = true;
        await essenceEditor.removeActiveEffectSource(essence, $selectedCraftingSystem);
        $loading = false;
    }

    async function openActiveEffectSourceItemSheet(essence) {
        const document = await new DefaultDocumentManager().getDocumentByUuid(essence.activeEffectSource.uuid);
        await document.sourceDocument.sheet.render(true);
    }

    async function setIconCode(essence, iconCode) {
        $loading = true;
        await essenceEditor.setIconCode(essence, iconCode, $selectedCraftingSystem);
        $loading = false;
    }

    function showEssenceIconModal(essence) {
        selectedEssenceIconModal = essence;
    }

    function hideEssenceIconModal() {
        selectedEssenceIconModal = null;
    }

</script>

<div class="fab-essence-editor fab-column">
    <div class="fab-hero-banner fab-row">
        <img src="{Properties.ui.banners.essenceEditor}" >
    </div>
    {#if !$selectedCraftingSystem.isLocked}
        <div class="fab-row">
            <button class="fab-new-essence" on:click={createEssence}><i class="fa-solid fa-mortar-pestle"></i> {localization.localize(`${localizationPath}.buttons.create`)}</button>
        </div>
    {/if}
    {#if $selectedCraftingSystem.hasEssences}
        <div class="fab-essences" class:fab-locked={$selectedCraftingSystem.isLocked} class:fab-unlocked={!$selectedCraftingSystem.isLocked}>
            {#each $selectedCraftingSystem.essences as essence}
                <div class="fab-essence-ae-source fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.activeEffectSource`)}:</p>
                        {#if !$selectedCraftingSystem?.isLocked}
                            {#if essence.hasActiveEffectSource}
                                <button on:auxclick={() => removeActiveEffectSource(essence)} on:click={openActiveEffectSourceItemSheet(essence)} on:drop|preventDefault={(e) => addActiveEffectSource(e, essence)}>
                                    <img class="fab-essence-ae-source-img" src="{essence.activeEffectSource.imageUrl}" data-tooltip="{essence.activeEffectSource.name}" />
                                </button>
                            {:else}
                                <div class="fab-drop-zone fab-essence-ae-source-add" on:drop|preventDefault={(e) => addActiveEffectSource(e, essence)}><i class="fa-solid fa-plus"></i></div>
                            {/if}
                        {:else}
                            {#if essence.hasActiveEffectSource}
                                <img src="{essence.activeEffectSource.imageUrl}" data-tooltip="{essence.activeEffectSource.name}" />
                            {:else}
                                <p>{localization.localize(`${localizationPath}.essence.info.noAeSource`)}</p>
                            {/if}
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-icon fab-column">
                    <div class="fab-row" style="position:relative;">
                        <p class="fab-label">{localization.localize(`${localizationPath}.essence.labels.icon`)}: </p>
                        {#if !$selectedCraftingSystem?.isLocked}
                            <button class="fab-essence-icon-btn" on:click={showEssenceIconModal(essence)}>
                                <i class="{essence.iconCode}"></i>
                            </button>
                            {#if essence === selectedEssenceIconModal}
                                <div class="fab-essence-icon-modal" use:clickOutside on:clickOutside={hideEssenceIconModal}>
                                    <input type="text" bind:value={iconCodeSearch} on:input={() => icons = searchIcons(iconCodeSearch)} placeholder="Search for an icon" />
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
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.name`)}: </p>
                        {#if !$selectedCraftingSystem?.isLocked}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.name} on:input={scheduleSave}>{essence.name}</div>
                        {:else}
                            <div class="fab-locked ">{essence.name}</div>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-tooltip fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.tooltip`)}: </p>
                        {#if !$selectedCraftingSystem?.isLocked}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.tooltip} on:input={scheduleSave}>{essence.tooltip}</div>
                        {:else}
                            <div class="fab-locked ">{essence.tooltip}</div>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-description fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.description`)}: </p>
                        {#if !$selectedCraftingSystem?.isLocked}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.description} on:input={scheduleSave}>{essence.description}</div>
                        {:else}
                            <div class="fab-locked ">{essence.description}</div>
                        {/if}
                    </div>
                </div>
                {#if !$selectedCraftingSystem.isLocked}
                <div class="fab-delete-essence fab-column">
                    <div class="fab-row">
                        <button class="fab-delete-essence" on:click={(e) => deleteEssence(e, essence)}><i class="fa-solid fa-trash"></i> {localization.localize(`${localizationPath}.essence.buttons.delete`)}</button>
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
            <p>{localization.localize(`${localizationPath}.essence.info.noEssences`)}</p>
            {#if !$selectedCraftingSystem.isLocked}<p>{localization.localize(`${localizationPath}.essence.info.createFirst`)}</p>{/if}
        </div>
    {/if}
</div>