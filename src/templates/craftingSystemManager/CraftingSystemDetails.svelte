<script lang="ts">
    import { fade } from 'svelte/transition';
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp"
    import Properties from "../../scripts/Properties";
    import {CraftingSystemDetails} from "../../scripts/system/CraftingSystemDetails";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let loading = false;

    let selectedSystem;

    let name = "No name";
    let author = "No author";
    let summary = "No summary";
    let description = "No description";
    let enabled = false;

    craftingSystemManager.craftingSystemsStore.value.subscribe((value) => {
        selectedSystem = value.selectedSystem;
        if (selectedSystem) {
            name = selectedSystem.name;
            author = selectedSystem.author;
            summary = selectedSystem.summary;
            description = selectedSystem.description;
            enabled = selectedSystem.enabled;
        }
    });

    let scheduledUpdate;
    function updateDetails() {
        clearTimeout(scheduledUpdate);
        scheduledUpdate = setTimeout(async () => {
            loading = true;
            selectedSystem.details = new CraftingSystemDetails({
                name,
                author,
                description,
                summary
            });
            await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
            loading = false;
        }, 500);
    }

    async function toggleSystemEnabled() {
        selectedSystem.enabled = enabled;
        await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
    }
</script>

<div class="fab-system-details fab-column">
    {#if loading}
        <div class="loading" transition:fade="{{duration: 100}}">
            <div class="loading-inner">
                <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </div>
        </div>
    {/if}
    <div class="fab-tab-header fab-row">
        <h2>{craftingSystemManager.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.tabs.details.title`, { systemName: selectedSystem?.name })}</h2>
    </div>
    <div class="fab-row fab-columns">
        <div class="fab-column">
            <div class="fab-row fab-system-name">
                <p class="fab-label fab-inline">Name: </p>
                {#if !selectedSystem?.isLocked}
                    <div class="fab-editable fab-inline" contenteditable="true" bind:textContent={name} on:input={updateDetails}>{name}</div>
                {:else}
                    <div class="fab-locked fab-inline">{name}</div>
                {/if}
            </div>
        </div>
        <div class="fab-column">
            <div class="fab-row fab-system-author">
                <p class="fab-label fab-inline">Author: </p>
                {#if !selectedSystem?.isLocked}
                    <div class="fab-editable fab-inline" contenteditable="true" bind:textContent={author} on:input={updateDetails}>{author}</div>
                {:else}
                    <div class="fab-locked fab-inline">{author}</div>
                {/if}
            </div>
        </div>
    </div>
    <div class="fab-row fab-system-summary">
        <p class="fab-label">Summary: </p>
    </div>
    <div class="fab-row fab-system-summary">
        {#if !selectedSystem?.isLocked}
            <div class="fab-editable fab-textbox" contenteditable="true" bind:textContent={summary} on:input={updateDetails}>{summary}</div>
        {:else}
            <div class="fab-locked fab-textbox">{summary}</div>
        {/if}
    </div>
    <div class="fab-row fab-system-description">
        <p class="fab-label">Detailed description: </p>
    </div>
    <div class="fab-row fab-system-description">
        {#if !selectedSystem?.isLocked}
            <div class="fab-editable fab-textbox" contenteditable="true" bind:textContent={description} on:input={updateDetails}>{description}</div>
        {:else}
            <div class="fab-locked fab-textbox">{description}</div>
        {/if}
    </div>
    <div class="fab-tab-header fab-row">
        <h2>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.details.settings.title`)}</h2>
    </div>
    <div class="fab-row">
        <p class="fab-label">{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.details.settings.enabled.label`)}: </p> <input type="checkbox" bind:checked={enabled} on:change={toggleSystemEnabled}>
    </div>
    <div class="fab-row">
        <p>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.details.settings.enabled.description`)}</p>
    </div>
</div>

<style>
    .fab-system-details {
        position: relative;
    }

    .loading-inner {
        position: absolute;
        margin-left: -40px;
        margin-top: -41px;
        top: 50%;
        left: 50%;
    }

    .loading {
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.2);
        width: 100%;
        height: 100%;
    }

    .lds-ellipsis {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
    }
    .lds-ellipsis div {
        position: absolute;
        top: 33px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #fff;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
    }
    .lds-ellipsis div:nth-child(1) {
        left: 8px;
        animation: lds-ellipsis1 0.6s infinite;
    }
    .lds-ellipsis div:nth-child(2) {
        left: 8px;
        animation: lds-ellipsis2 0.6s infinite;
    }
    .lds-ellipsis div:nth-child(3) {
        left: 32px;
        animation: lds-ellipsis2 0.6s infinite;
    }
    .lds-ellipsis div:nth-child(4) {
        left: 56px;
        animation: lds-ellipsis3 0.6s infinite;
    }
    @keyframes lds-ellipsis1 {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
        }
    }
    @keyframes lds-ellipsis3 {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(0);
        }
    }
    @keyframes lds-ellipsis2 {
        0% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(24px, 0);
        }
    }

</style>