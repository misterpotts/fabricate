<!-- EssenceEditor.svelte -->
<script lang="ts">
    import { fade } from 'svelte/transition';
    import Properties from "../../scripts/Properties.js";
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import {CraftingSystemDetails} from "../../scripts/system/CraftingSystemDetails";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    let loading = false;

    let selectedSystem;
    let essences = [];

    craftingSystemManager.craftingSystemsStore.value.subscribe(async (value) => {
        selectedSystem = value.selectedSystem;
        if (selectedSystem) {
            essences = selectedSystem.getEssences();
        }
    });

    function createEssence() {
        throw new Error("Not implemented!");
    }

    function editEssenceIcon(essence) {
        throw new Error("Not implemented!");
    }

    function deleteEssence(essence) {
        throw new Error("Not implemented!");
    }

    function addActiveEffectSource(e) {
        throw new Error("Not implemented!");
    }

    let scheduledUpdate;
    async function updateEssence(essence) {
        clearTimeout(scheduledUpdate);
        scheduledUpdate = setTimeout(async () => {
            loading = true;
            await craftingSystemManager.craftingSystemsStore.saveCraftingSystem(selectedSystem);
            loading = false;
        }, 500);
    }

    async function removeActiveEffectSource(essence) {
        throw new Error("Not implemented!");
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
    <div class="fab-row">
        <button class="fab-new-essence" on:click={createEssence}><i class="fa-solid fa-mortar-pestle"></i> New Essence</button>
    </div>
    <div class="fab-essences" class:fab-locked={selectedSystem.isLocked} class:fab-unlocked={!selectedSystem.isLocked}>
        {#each essences as essence}
            <div class="fab-essence-ae-source fab-column">
                <div class="fab-row">
                    <p class="fab-label ">Active Effect Source</p>
                    {#if !selectedSystem?.isLocked}
                        {#if essence.hasActiveEffectSource}
                            <img src="{essence.activeEffectSource.imageUrl}" data-tooltip="{essence.activeEffectSource.name}" on:click={removeActiveEffectSource(essence)} />
                        {:else}
                            <div on:drop|preventDefault={addActiveEffectSource}>No active effect source. Add one here.</div>
                        {/if}
                    {:else}
                        {#if essence.hasActiveEffectSource}
                            <img src="{essence.activeEffectSource.imageUrl}" data-tooltip="{essence.activeEffectSource.name}" />
                        {:else}
                            <div>No active effect source. </div>
                        {/if}
                    {/if}
                </div>
            </div>
            <div class="fab-essence-icon fab-column">
                <div class="fab-row">
                    <p class="fab-label ">Icon: </p>
                    {#if !selectedSystem?.isLocked}
                        <button class="fab-essence-icon-btn" on:click={editEssenceIcon(essence)}><i class="{essence.iconCode}"></i></button>
                    {:else}
                        <i class="{essence.iconCode}"></i>
                    {/if}
                </div>
            </div>
            <div class="fab-essence-name fab-column">
                <div class="fab-row">
                    <p class="fab-label ">Name: </p>
                    {#if !selectedSystem?.isLocked}
                        <div class="fab-editable" contenteditable="true" bind:textContent={essence.name} on:input={updateEssence(essence)}>{essence.name}</div>
                    {:else}
                        <div class="fab-locked ">{essence.name}</div>
                    {/if}
                </div>
            </div>
            <div class="fab-essence-tooltip fab-column">
                <div class="fab-row">
                    <p class="fab-label ">Tooltip: </p>
                    {#if !selectedSystem?.isLocked}
                        <div class="fab-editable" contenteditable="true" bind:textContent={essence.tooltip} on:input={updateEssence(essence)}>{essence.tooltip}</div>
                    {:else}
                        <div class="fab-locked ">{essence.tooltip}</div>
                    {/if}
                </div>
            </div>
            <div class="fab-essence-description fab-column">
                <div class="fab-row">
                    <p class="fab-label ">Description: </p>
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
                    <button class="fab-delete-essence" on:click={deleteEssence(essence)}><i class="fa-solid fa-trash"></i> Delete Essence</button>
                </div>
            </div>
                <div class="fab-grid-spacer"></div>
            {:else}
                <div class="fab-grid-spacer"></div>
            {/if}
        {/each}
    </div>
    {#if !selectedSystem.hasEssences}
        <div class="fab-no-essences">
            <p>This Crafting System has no essences. </p>
            {#if !selectedSystem.isLocked}<p>Click the button above to add your first one!</p>{/if}
        </div>
    {/if}
</div>