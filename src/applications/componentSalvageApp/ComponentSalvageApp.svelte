<!-- ComponentSalvageApp.svelte-->
<script lang="ts">

    import { setContext } from 'svelte';
    import { onMount } from "svelte";
    import SalvageHeader from "./SalvageHeader.svelte";
    import CraftingComponentGrid from "../common/CratingComponentGrid.svelte";
    import eventBus from "../common/EventBus";
    import { localizationKey } from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import CraftingComponentCarousel from "../common/CraftingComponentCarousel.svelte";
    import {SuccessfulSalvageResult} from "../../scripts/crafting/result/SalvageResult";
    import {Combination} from "../../scripts/common/Combination";

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp`;

    export let craftingComponent;
    export let inventory;
    export let ownedComponentsOfType;
    export let localization;
    export let closeHook;

    let selectedOptionName = craftingComponent.firstOptionName;
    if (selectedOptionName) {
        craftingComponent.selectSalvageOption(selectedOptionName);
    }

    setContext(localizationKey, {
        localization,
    });

    onMount(async () => {
        return reIndex();
    });

    async function doSalvage(event) {
        const skipDialog = event.detail.skipDialog;
        if (skipDialog) {
            return salvageComponent(craftingComponent);
        }
        let confirm = false;
        await Dialog.confirm({
            title: localization.localize(`${localizationPath}.dialog.doSalvage.title`),
            content: `<p>${localization.format(`${localizationPath}.dialog.doSalvage.content`, { componentName: craftingComponent.name})}</p>`,
            yes: async () => {
                confirm = true;
            }
        });
        if (confirm) {
            return salvageComponent(craftingComponent);
        }
    }

    async function salvageComponent(craftingComponent) {
        const salvageResult = new SuccessfulSalvageResult({
            created: craftingComponent.selectedSalvage,
            consumed: Combination.of(craftingComponent, 1)
        });
        await inventory.acceptSalvageResult(salvageResult);
    }

    function handleComponentUpdated(event) {
        const updatedComponent = event.detail;
        if (updatedComponent.id !== craftingComponent.id) {
            return;
        }
        craftingComponent = updatedComponent;
        selectedOptionName = craftingComponent.firstOptionName;
        craftingComponent.selectSalvageOption(selectedOptionName);
        if (!craftingComponent.isSalvageable) {
            closeHook();
            return;
        }
    }

    async function handleItemUpdated(event) {
        const { sourceId, actor } = event.detail;
        // If the modified item is not owned, not owned by the actor who owns this crafting component, or is not associated with this component
        if (!actor || !actor.id === inventory.actor.id || sourceId !== craftingComponent.itemUuid) {
            // do nothing
            return;
        }
        // if it is, we need to re-index the inventory
        return reIndex();
    }

    async function handleItemCreated(event) {
        const {sourceId, actor} = event.detail;
        if (!actor?.id === inventory.actor.id || sourceId !== craftingComponent.itemUuid) {
            return;
        }
        return reIndex();
    }

    async function handleItemDeleted(event) {
        const {sourceId, actor} = event.detail;
        if (!actor?.id === inventory.actor.id || sourceId !== craftingComponent.itemUuid) {
            return;
        }
        await reIndex();
        if (ownedComponentsOfType.isEmpty()) {
            closeHook();
        }
    }

    async function reIndex() {
        const ownedComponents = await inventory.index();
        ownedComponentsOfType = ownedComponents.just(craftingComponent);
    }

</script>

<div class="fab-component-salvage-app fab-columns">
    <div class="fab-column" style="height: 100%"
         use:eventBus={["componentUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
         on:componentUpdated={(e) => handleComponentUpdated(e)}
         on:itemUpdated={(e) => handleItemUpdated(e)}
         on:itemCreated={(e) => handleItemCreated(e)}
         on:itemDeleted={(e) => handleItemDeleted(e)}>
        <SalvageHeader component={craftingComponent} ownedComponentsOfType={ownedComponentsOfType} on:salvageComponent={(e) => doSalvage(e)} />
        <div class="fab-component-salvage-app-body fab-scrollable">
            {#if craftingComponent.salvageOptions.length === 1}
                <p class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                <div class="fab-component-grid-wrapper">
                    <CraftingComponentGrid columns={4} componentCombination={craftingComponent.selectedSalvage} />
                </div>
            {:else if craftingComponent.salvageOptions.length > 1}
                    <CraftingComponentCarousel columns={4} craftingComponent={craftingComponent} bind:selectedOptionName={selectedOptionName}>
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