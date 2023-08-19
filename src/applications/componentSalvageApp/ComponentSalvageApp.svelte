<!-- ComponentSalvageApp.svelte-->
<script lang="ts">

    import { setContext } from 'svelte';
    import { onMount } from "svelte";
    import SalvageHeader from "./SalvageHeader.svelte";
    import CraftingComponentGrid from "../common/CraftingComponentGrid.svelte";
    import eventBus from "../common/EventBus";
    import { localizationKey } from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import CraftingComponentCarousel from "../common/ComponentSalvageCarousel.svelte";

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp`;

    export let component;
    export let actor;
    export let craftingAPI;
    export let localization;
    export let closeApplication;

    let salvageAttempt;
    let amountOwned;

    onMount(async () => {
        await loadSalvageAttempt();
        amountOwned = await craftingAPI.countOwnedComponents(actor.id, component.id);
    });

    setContext(localizationKey, {
        localization,
    });

    async function doSalvage(event) {
        const skipDialog = event.detail.skipDialog;
        if (skipDialog) {
            return salvageComponent(component);
        }
        let confirm = false;
        await Dialog.confirm({
            title: localization.localize(`${localizationPath}.dialog.doSalvage.title`),
            content: `<p>${localization.format(`${localizationPath}.dialog.doSalvage.content`, { componentName: component.name})}</p>`,
            yes: async () => {
                confirm = true;
            }
        });
        if (confirm) {
            return salvageComponent(component);
        }
    }

    async function salvageComponent(craftingComponent) {
        const salvageResult = await salvageAttempt.perform();
        await craftingAPI.acceptSalvageResult(salvageResult);
    }

    async function handleComponentUpdated(event) {
        const updatedComponent = event.detail;
        if (updatedComponent.id !== component.id) {
            return;
        }
        component = updatedComponent;
        if (!component.isSalvageable) {
            closeApplication();
            return;
        }
        await loadSalvageAttempt();
        if (!salvageAttempt.isPossible()) {
            closeApplication();
        }
    }

    async function handleItemUpdated(event) {
        // If the modified item is not owned, not owned by the actor who owns this crafting component, or is not associated with this component
        if (!event?.detail?.actor?.id == actor.id || !event?.detail?.sourceId == component.itemUuid) {
            return;
        }
        // if it is, we need to re-index the inventory
        return loadSalvageAttempt();
    }

    async function handleItemCreated(event) {
        if (!event?.detail?.actor?.id == actor.id || !event?.detail?.sourceId == component.itemUuid) {
            return;
        }
        return loadSalvageAttempt();
    }

    async function handleItemDeleted(event) {
        if (!event?.detail?.actor?.id == actor.id || !event?.detail?.sourceId == component.itemUuid) {
            return;
        }
        await loadSalvageAttempt();
        if (!salvageAttempt.isPossible()) {
            closeApplication();
        }
    }

    async function loadSalvageAttempt() {
        salvageAttempt = await craftingAPI.prepareSalvageAttempt({
            componentId: component.id,
            sourceActor: actor.id,
            targetActor: actor.id,
        });
    }

</script>

{#if salvageAttempt}
    <div class="fab-component-salvage-app fab-columns">
        <div class="fab-column" style="height: 100%"
             use:eventBus={["componentUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
             on:componentUpdated={(e) => handleComponentUpdated(e)}
             on:itemUpdated={(e) => handleItemUpdated(e)}
             on:itemCreated={(e) => handleItemCreated(e)}
             on:itemDeleted={(e) => handleItemDeleted(e)}>
            <SalvageHeader component={component} amountOwned={amountOwned} on:salvageComponent={(e) => doSalvage(e)} />
            <div class="fab-component-salvage-app-body fab-scrollable">
                {#if component.salvageOptions.all.length === 1}
                    <p class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                    <div class="fab-component-grid-wrapper">
                        <CraftingComponentGrid columns={4} componentCombination={component.selectedSalvage} />
                    </div>
                {:else if component.salvageOptions.all.length > 1}
                    <CraftingComponentCarousel columns={4} salvageAttempt={salvageAttempt}>
                        <p slot="description" class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                    </CraftingComponentCarousel>
                {:else}
                    <div class="fab-salvage-hint">
                        <p>{localization.localize(`${localizationPath}.errors.notSalvageable`)}</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
