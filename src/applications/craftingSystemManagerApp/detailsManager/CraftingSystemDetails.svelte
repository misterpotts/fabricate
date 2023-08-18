<script lang="ts">
    import {key} from "../CraftingSystemManagerApp"
    import Properties from "../../../scripts/Properties";
    import { getContext } from "svelte";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.details`;

    const {
        selectedCraftingSystem,
        craftingSystemEditor,
        localization
    } = getContext(key);

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            await craftingSystemEditor.saveCraftingSystem($selectedCraftingSystem);
        }, 1000);
    }

</script>

<div class="fab-system-details fab-column">
    <div class="fab-hero-banner">
        <img src="{Properties.ui.banners.detailsEditor}" >
    </div>
    <div class="fab-tab-header fab-row">
        <h2>{localization.format(`${localizationPath}.title`, { systemName: $selectedCraftingSystem?.details.name })}</h2>
    </div>
    <div class="fab-row fab-columns">
        <div class="fab-column">
            <div class="fab-row fab-system-name">
                <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.labels.name`)}: </p>
                {#if !$selectedCraftingSystem?.isEmbedded}
                    <div class="fab-editable fab-inline"
                         contenteditable="true"
                         bind:textContent={$selectedCraftingSystem.details.name}
                         on:input={scheduleSave}>
                        {$selectedCraftingSystem.details.name}
                    </div>
                {:else}
                    <div class="fab-locked fab-inline">{$selectedCraftingSystem.details.name}</div>
                {/if}
            </div>
        </div>
        <div class="fab-column">
            <div class="fab-row fab-system-author">
                <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.labels.author`)}: </p>
                {#if !$selectedCraftingSystem?.isEmbedded}
                    <div class="fab-editable fab-inline"
                         contenteditable="true"
                         bind:textContent={$selectedCraftingSystem.details.author}
                         on:input={scheduleSave}>
                        {$selectedCraftingSystem.details.author}
                    </div>
                {:else}
                    <div class="fab-locked fab-inline">{$selectedCraftingSystem.details.author}</div>
                {/if}
            </div>
        </div>
    </div>
    <div class="fab-row fab-system-summary">
        <p class="fab-label">{localization.localize(`${localizationPath}.labels.summary`)}: </p>
    </div>
    <div class="fab-row fab-system-summary">
        {#if !$selectedCraftingSystem?.isEmbedded}
            <div class="fab-editable fab-textbox"
                 contenteditable="true"
                 bind:textContent={$selectedCraftingSystem.details.summary}
                 on:input={scheduleSave}>
                {$selectedCraftingSystem.details.summary}
            </div>
        {:else}
            <div class="fab-locked fab-textbox">{$selectedCraftingSystem.details.summary}</div>
        {/if}
    </div>
    <div class="fab-row fab-system-description">
        <p class="fab-label">{localization.localize(`${localizationPath}.labels.description`)}: </p>
    </div>
    <div class="fab-row fab-system-description">
        {#if !$selectedCraftingSystem?.isEmbedded}
            <div class="fab-editable fab-textbox"
                 contenteditable="true"
                 bind:textContent={$selectedCraftingSystem.details.description}
                 on:input={scheduleSave}>
                {$selectedCraftingSystem.details.description}
            </div>
        {:else}
            <div class="fab-locked fab-textbox">{$selectedCraftingSystem.details.description}</div>
        {/if}
    </div>
    <div class="fab-tab-header fab-row">
        <h2>{localization.localize(`${localizationPath}.settings.title`)}</h2>
    </div>
    <div class="fab-row">
        <p class="fab-label">{localization.localize(`${localizationPath}.settings.disabled.label`)}: </p>
        <input type="checkbox"
               bind:checked={$selectedCraftingSystem.isDisabled}
               on:change={scheduleSave}>
    </div>
    <div class="fab-row">
        <p>{localization.localize(`${localizationPath}.settings.disabled.description`)}</p>
    </div>
</div>