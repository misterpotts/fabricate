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

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp`;

    export let craftingComponent;
    export let craftingSystem;
    export let inventory;
    export let ownedComponentsOfType;
    export let localization;
    export let closeHook;

    setContext(localizationKey, {
        localization,
    });

    onMount(async () => {
        return reIndex();
    });

    function doSalvage() {
        console.log("Do salvage");
    }

    function updateComponent(event) {
        const updatedComponent = event.detail;
        if (updatedComponent.id !== craftingComponent.id) {
            return;
        }
        craftingComponent = updatedComponent;
    }

    async function handleItemUpdated(event) {
        const { sourceId, actor } = event.detail;
        if (!actor || sourceId !== craftingComponent.itemUuid) {
            return;
        }
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
    <div class="fab-column"
         use:eventBus={["componentUpdated", "itemUpdated", "itemCreated", "itemDeleted"]}
         on:componentUpdated={(e) => updateComponent(e)}
         on:itemUpdated={(e) => handleItemUpdated(e)}
         on:itemCreated={(e) => handleItemCreated(e)}
         on:itemDeleted={(e) => handleItemDeleted(e)}>
        <SalvageHeader component={craftingComponent} ownedComponentsOfType={ownedComponentsOfType} on:salvageComponent={doSalvage} />
        <div class="fab-component-salvage-app-body fab-scrollable">
            {#if craftingComponent.salvageOptions.length === 1}
                <p class="fab-salvage-hint">{localization.localize(`${localizationPath}.hints.doSalvage`)}:</p>
                <CraftingComponentGrid columns={4} componentCombination={craftingComponent.selectedSalvage} />
            {:else if craftingComponent.salvageOptions.length > 1}
                <CraftingComponentCarousel columns={4} craftingComponent={craftingComponent} />
            {:else}
                <div class="fab-component-salvage-error">
                    <p>{localization.localize(`${localizationPath}.errors.notSalvageable`)}</p>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .fab-component-salvage-app-body {
        padding: 10px;
    }
    .fab-salvage-hint {
        margin-bottom: 20px;
    }
</style>