<!-- ComponentSalvageApp.svelte-->
<script lang="ts">

    import { setContext } from 'svelte';
    import { onMount } from "svelte";
    import SalvageHeader from "./SalvageHeader.svelte";
    import CraftingComponentGrid from "../common/CraftingComponentGrid.svelte";
    import eventBus from "../common/EventBus";
    import { localizationKey } from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import ComponentSalvageCarousel from "../common/ComponentSalvageCarousel.svelte";
    import CraftingAttemptCarousel from "../recipeCraftingApp/CraftingAttemptCarousel.svelte";

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp`;

    export let componentSalvageManager;

    export let localization;
    export let closeHook;

    let salvageAttempts = [];
    let selectedSalvageAttempt;

    async function loadAppData() {
        salvageAttempts = await componentSalvageManager.loadSalvageAttempts();
        if (!selectedSalvageAttempt && salvageAttempts.length > 0) {
            selectedSalvageAttempt = salvageAttempts[0];
        }
        if (selectedSalvageAttempt && salvageAttempts.length > 0) {
            selectedSalvageAttempt = salvageAttempts.find((attempt) => attempt.optionId === selectedSalvageAttempt.optionId);
        }
    }

    function selectNextSalvageOption() {
        const currentIndex = salvageAttempts.findIndex((attempt) => attempt.optionId === selectedSalvageAttempt.optionId);
        if (currentIndex === salvageAttempts.length - 1) {
            selectedSalvageAttempt = salvageAttempts[0];
        } else {
            selectedSalvageAttempt = salvageAttempts[currentIndex + 1];
        }
    }

    function selectPreviousSalvageOption() {
        const currentIndex = salvageAttempts.findIndex((attempt) => attempt.optionId === selectedSalvageAttempt.optionId);
        if (currentIndex === 0) {
            selectedSalvageAttempt = salvageAttempts[salvageAttempts.length - 1];
        } else {
            selectedSalvageAttempt = salvageAttempts[currentIndex - 1];
        }
    }

    onMount(loadAppData);

    setContext(localizationKey, {
        localization,
    });

    async function doSalvage(event) {
        const skipDialog = event.detail.skipDialog;
        if (skipDialog) {
            return salvageComponent();
        }
        let confirm = false;
        await Dialog.confirm({
            title: localization.localize(`${localizationPath}.dialog.doSalvage.title`),
            content: `<p>${localization.format(`${localizationPath}.dialog.doSalvage.content`, { componentName: componentSalvageManager.componentToSalvage.name })}</p>`,
            yes: async () => {
                confirm = true;
            }
        });
        if (confirm) {
            return salvageComponent();
        }
    }

    async function salvageComponent() {
        await componentSalvageManager.doSalvage(selectedSalvageAttempt.optionId);
        await loadAppData();
    }

    async function handleComponentUpdated(event) {
        const updatedComponent = event.detail;
        if (updatedComponent.id !== componentSalvageManager.componentToSalvage.id) {
            return;
        }
        if (!updatedComponent.isSalvageable) {
            closeHook();
            return;
        }
        await loadAppData();
    }

    async function handleItemUpdated(event) {
        // If the modified item is not owned, not owned by the actor who owns this crafting component, or is not associated with this component
        if (!event?.detail?.actor?.id == componentSalvageManager.actor.id || !event?.detail?.sourceId == componentSalvageManager.componentToSalvage.itemUuid) {
            return;
        }
        // if it is, we need to re-index the inventory
        return loadAppData();
    }

    async function handleItemCreated(event) {
        // If the modified item is not owned, not owned by the actor who owns this crafting component, or is not associated with this component
        if (!event?.detail?.actor?.id == componentSalvageManager.actor.id || !event?.detail?.sourceId == componentSalvageManager.componentToSalvage.itemUuid) {
            return;
        }
        // if it is, we need to re-index the inventory
        return loadAppData();
    }

    async function handleItemDeleted(event) {
        // If the modified item is not owned, not owned by the actor who owns this crafting component, or is not associated with this component
        if (!event?.detail?.actor?.id == componentSalvageManager.actor.id || !event?.detail?.sourceId == componentSalvageManager.componentToSalvage.itemUuid) {
            return;
        }
        // if it is, we need to re-index the inventory
        return loadAppData();
    }

</script>

{#if selectedSalvageAttempt}
    <div class="fab-component-salvage-app fab-columns">
        <div class="fab-column" style="height: 100%"
             use:eventBus={["componentUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
             on:componentUpdated={(e) => handleComponentUpdated(e)}
             on:itemUpdated={(e) => handleItemUpdated(e)}
             on:itemCreated={(e) => handleItemCreated(e)}
             on:itemDeleted={(e) => handleItemDeleted(e)}>
            <SalvageHeader component={selectedSalvageAttempt.componentToSalvage} amountOwned={selectedSalvageAttempt.amountOwned} on:salvageComponent={(e) => doSalvage(e)} />
            <div class="fab-component-salvage-app-body fab-scrollable">
                {#if salvageAttempts.length === 1}
                    <p class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                    <div class="fab-component-grid-wrapper">
                        <CraftingComponentGrid columns={4} componentCombination={selectedSalvageAttempt.producedComponents} />
                    </div>
                {:else if salvageAttempts.length > 1}
                    <ComponentSalvageCarousel columns={4}
                                              selectedSalvageAttempt={selectedSalvageAttempt}
                                              on:nextSalvageOptionSelected={selectNextSalvageOption}
                                              on:previousSalvageOptionSelected={selectPreviousSalvageOption}>
                        <p slot="description" class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                    </ComponentSalvageCarousel>
                {:else}
                    <div class="fab-salvage-hint">
                        <p>{localization.localize(`${localizationPath}.errors.notSalvageable`)}</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <div class="fab-component-salvage-app fab-columns">
        <div class="fab-component-salvage-app-body fab-scrollable">
            <div class="fab-salvage-hint">
                <p>{localization.localize(`${localizationPath}.errors.notSalvageable`)}</p>
            </div>
        </div>
    </div>
{/if}
