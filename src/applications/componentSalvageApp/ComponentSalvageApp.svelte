<!-- ComponentSalvageApp.svelte-->
<script lang="ts">

    import { setContext } from 'svelte';
    import { onMount } from "svelte";
    import SalvageHeader from "./SalvageHeader.svelte";
    import CraftingComponentGrid from "../common/CraftingComponentGrid.svelte";
    import eventBus from "../common/EventBus";
    import {localizationKey} from "../common/LocalizationService";
    import type {LocalizationService} from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import ComponentSalvageCarousel from "../common/ComponentSalvageCarousel.svelte";
    import TrackedCraftingComponentGrid from "../common/TrackedCraftingComponentGrid.svelte";
    import type {ComponentSalvageManager} from "./ComponentSalvageManager";

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp`;

    export let componentSalvageManager: ComponentSalvageManager;

    export let localization: LocalizationService;
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
        const atLeastOneAttemptIsPossible = salvageAttempts
            .map(salvageAttempt => salvageAttempt.isPossible)
            .reduce((left, right) => left || right, false);
        if (!atLeastOneAttemptIsPossible) {
            closeHook();
        }
    }

    onMount(loadAppData);

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

    async function reloadApplicableInventoryEvents(event) {
        const actor = event.detail.actor;
        const sourceId = event.detail.sourceId;
        if (!actor) {
            throw new Error("No actor provided in event detail");
        }
        if (!sourceId) {
            throw new Error("No sourceId provided in event detail");
        }
        // If the modified item is not owned, or not owned by the actor who owns this crafting component
        if (actor.id !== componentSalvageManager.actor.id) {
            return;
        }
        // if it is, we need to re-index the inventory
        await loadAppData();
    }

    async function handleItemUpdated(event) {
        await reloadApplicableInventoryEvents(event);
    }

    async function handleItemCreated(event) {
        await reloadApplicableInventoryEvents(event);
    }

    async function handleItemDeleted(event) {
        await reloadApplicableInventoryEvents(event);
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
                        {#if selectedSalvageAttempt.requiresCatalysts}
                            <p style="margin: 10px 0;">{localization.localize(`${localizationPath}.hints.requiresCatalysts`)}</p>
                            <TrackedCraftingComponentGrid columns={4} trackedCombination={selectedSalvageAttempt.requiredCatalysts} />
                        {/if}
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
