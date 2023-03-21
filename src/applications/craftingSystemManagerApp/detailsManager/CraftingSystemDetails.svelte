<script lang="ts">
    import {key} from "../CraftingSystemManagerApp"
    import Properties from "../../../scripts/Properties";
    import { getContext } from "svelte";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.details`;

    const {
        selectedCraftingSystem,
        craftingSystemEditor,
        localization,
        loading
    } = getContext(key);

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            $loading = true;
            await craftingSystemEditor.saveCraftingSystem($selectedCraftingSystem);
            $loading = false;
        }, 1000);
    }

</script>

<div class="fab-system-details fab-column">
    <div class="fab-hero-banner">
        <img src="{Properties.ui.banners.detailsEditor}" >
    </div>
    <div class="fab-tab-header fab-row">
        <h2>{localization.format(`${localizationPath}.title`, { systemName: $selectedCraftingSystem?.name })}</h2>
    </div>
    <div class="fab-row fab-columns">
        <div class="fab-column">
            <div class="fab-row fab-system-name">
                <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.labels.name`)}: </p>
                {#if !$selectedCraftingSystem?.isLocked}
                    <div class="fab-editable fab-inline"
                         contenteditable="true"
                         bind:textContent={$selectedCraftingSystem.name}
                         on:input={scheduleSave}>
                        {$selectedCraftingSystem.name}
                    </div>
                {:else}
                    <div class="fab-locked fab-inline">{$selectedCraftingSystem.name}</div>
                {/if}
            </div>
        </div>
        <div class="fab-column">
            <div class="fab-row fab-system-author">
                <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.labels.author`)}: </p>
                {#if !$selectedCraftingSystem?.isLocked}
                    <div class="fab-editable fab-inline"
                         contenteditable="true"
                         bind:textContent={$selectedCraftingSystem.author}
                         on:input={scheduleSave}>
                        {$selectedCraftingSystem.author}
                    </div>
                {:else}
                    <div class="fab-locked fab-inline">{$selectedCraftingSystem.author}</div>
                {/if}
            </div>
        </div>
    </div>
    <div class="fab-row fab-system-summary">
        <p class="fab-label">{localization.localize(`${localizationPath}.labels.summary`)}: </p>
    </div>
    <div class="fab-row fab-system-summary">
        {#if !$selectedCraftingSystem?.isLocked}
            <div class="fab-editable fab-textbox"
                 contenteditable="true"
                 bind:textContent={$selectedCraftingSystem.summary}
                 on:input={scheduleSave}>
                {$selectedCraftingSystem.summary}
            </div>
        {:else}
            <div class="fab-locked fab-textbox">{$selectedCraftingSystem.summary}</div>
        {/if}
    </div>
    <div class="fab-row fab-system-description">
        <p class="fab-label">{localization.localize(`${localizationPath}.labels.description`)}: </p>
    </div>
    <div class="fab-row fab-system-description">
        {#if !$selectedCraftingSystem?.isLocked}
            <div class="fab-editable fab-textbox"
                 contenteditable="true"
                 bind:textContent={$selectedCraftingSystem.description}
                 on:input={scheduleSave}>
                {$selectedCraftingSystem.description}
            </div>
        {:else}
            <div class="fab-locked fab-textbox">{$selectedCraftingSystem.description}</div>
        {/if}
    </div>
    <div class="fab-tab-header fab-row">
        <h2>{localization.localize(`${localizationPath}.settings.title`)}</h2>
    </div>
    <div class="fab-row">
        <p class="fab-label">{localization.localize(`${localizationPath}.settings.enabled.label`)}: </p>
        <input type="checkbox"
               bind:checked={$selectedCraftingSystem.enabled}
               on:change={scheduleSave}>
    </div>
    <div class="fab-row">
        <p>{localization.localize(`${localizationPath}.settings.enabled.description`)}</p>
    </div>
</div>