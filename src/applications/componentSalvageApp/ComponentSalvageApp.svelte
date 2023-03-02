<!-- ComponentSalvageApp.svelte-->
<script lang="ts">

    import {onMount} from "svelte";
    import SalvageHeader from "./SalvageHeader.svelte";
    import eventBus from "./EventBus";

    export let craftingComponent;
    export let craftingSystem;
    export let inventory;
    export let ownedComponentsOfType;
    export let localization;

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
    >
        <SalvageHeader component={craftingComponent} ownedComponentsOfType={ownedComponentsOfType} localization on:salvageComponent={doSalvage} />
        {#if craftingComponent.salvageOptions.length === 1}
            Only one eh
        {:else if craftingComponent.salvageOptions.length > 1}
            Carousel time
        {:else}
            <p>This component has zero salvage options. This shouldn't be possible, as you should not have been presented with the button to open the application window. </p>
        {/if}
    </div>
</div>