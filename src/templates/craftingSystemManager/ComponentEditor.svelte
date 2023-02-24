<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import Properties from "../../scripts/Properties.js";
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
    <div class="fab-hero-banner">
        <img src="{Properties.ui.banners.componentEditor}" >
        <div class="fab-buttons">
            <button class="fab-deselect-component" on:click={deselectComponent}><i class="fa-solid fa-circle-chevron-left"></i> Go back</button>
        </div>
    </div>
    <p>{selectedComponent.name}</p>
    <img src="{selectedComponent.imageUrl}" width="100px" height="100px" />
</div>
