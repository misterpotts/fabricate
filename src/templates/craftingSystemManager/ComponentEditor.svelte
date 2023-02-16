<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    export let selectedComponent;

    craftingSystemManager.selectedComponentStore.selectedComponent.subscribe(component => {
        selectedComponent = component;
    });

    function deselectComponent() {
        craftingSystemManager.selectedComponentStore.deselect();
    }

</script>

<div class="fab-component-editor fab-column">
    <button class="fab-deselect-component" on:click={deselectComponent}>Go back</button>
    <p>{selectedComponent.name}</p>
    <img src="{selectedComponent.imageUrl}" width="100px" height="100px" />
</div>
