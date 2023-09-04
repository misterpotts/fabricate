<!-- EssenceEditorComponent.svelte -->
<script lang="ts">
    import Properties from "../../../scripts/Properties";
    import {key} from "../CraftingSystemManagerApp";
    import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
    import {getContext} from "svelte";
    import EssenceIconSelectorModal from "./EssenceIconSelectorModal.svelte";
    
    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences`;

    const { 
        localization,
        selectedCraftingSystem,
        essences,
        essenceEditor
    } = getContext(key);

    async function createEssence() {
        await essenceEditor.create($selectedCraftingSystem);
    }

    async function deleteEssence(event, essence) {
        await essenceEditor.deleteEssence(event, essence, $selectedCraftingSystem);
    }

    async function addActiveEffectSource(event, essence) {
        await essenceEditor.setActiveEffectSource(event, essence);
    }

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            await essenceEditor.saveAll($essences);
        }, 1000);
    }

    async function removeActiveEffectSource(essence) {
        await essenceEditor.removeActiveEffectSource(essence);
    }

    async function openActiveEffectSourceItemSheet(essence) {
        const document = await new DefaultDocumentManager().loadItemDataByDocumentUuid(essence.activeEffectSource.uuid);
        await document.sourceDocument.sheet.render(true);
    }

    async function setIconCode(event) {
        const { essence, iconCode } = event.detail;
        await essenceEditor.setIconCode(essence, iconCode);
    }

    let showIconModal;
    function showEssenceIconModal(event, essence) {
        showIconModal(event, essence);
    }

</script>

<EssenceIconSelectorModal bind:show={showIconModal} on:iconSelected={(e) => setIconCode(e)} />
<div class="fab-essence-editor fab-column">
    <div class="fab-hero-banner fab-row">
        <img src="{Properties.ui.banners.essenceEditor}" >
    </div>
    {#if !$selectedCraftingSystem.isEmbedded}
        <div class="fab-row">
            <button class="fab-new-essence" on:click={createEssence}><i class="fa-solid fa-mortar-pestle"></i> {localization.localize(`${localizationPath}.buttons.create`)}</button>
        </div>
    {/if}
    {#if $essences.length > 0}
        <div class="fab-essences" class:fab-locked={$selectedCraftingSystem.isEmbedded} class:fab-unlocked={!$selectedCraftingSystem.isEmbedded}>
            {#each $essences as essence}
                <div class="fab-essence-ae-source fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.activeEffectSource`)}:</p>
                        {#if !$selectedCraftingSystem?.isEmbedded}
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
                        {#if !$selectedCraftingSystem?.isEmbedded}
                            <button class="fab-essence-icon-btn" on:click={(e) => showEssenceIconModal(e, essence)}>
                                <i class="{essence.iconCode}"></i>
                            </button>
                        {:else}
                            <i class="{essence.iconCode}"></i>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-name fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.name`)}: </p>
                        {#if !$selectedCraftingSystem?.isEmbedded}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.name} on:input={scheduleSave}>{essence.name}</div>
                        {:else}
                            <div class="fab-locked ">{essence.name}</div>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-tooltip fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.tooltip`)}: </p>
                        {#if !$selectedCraftingSystem?.isEmbedded}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.tooltip} on:input={scheduleSave}>{essence.tooltip}</div>
                        {:else}
                            <div class="fab-locked ">{essence.tooltip}</div>
                        {/if}
                    </div>
                </div>
                <div class="fab-essence-description fab-column">
                    <div class="fab-row">
                        <p class="fab-label ">{localization.localize(`${localizationPath}.essence.labels.description`)}: </p>
                        {#if !$selectedCraftingSystem?.isEmbedded}
                            <div class="fab-editable" contenteditable="true" bind:textContent={essence.description} on:input={scheduleSave}>{essence.description}</div>
                        {:else}
                            <div class="fab-locked ">{essence.description}</div>
                        {/if}
                    </div>
                </div>
                {#if !$selectedCraftingSystem.isEmbedded}
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
            {#if !$selectedCraftingSystem.isEmbedded}<p>{localization.localize(`${localizationPath}.essence.info.createFirst`)}</p>{/if}
        </div>
    {/if}
</div>