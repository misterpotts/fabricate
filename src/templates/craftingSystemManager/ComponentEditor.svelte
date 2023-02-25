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
    <div class="fab-hero-banner fab-row">
        <img src="{Properties.ui.banners.componentEditor}" >
        <div class="fab-buttons">
            <button class="fab-deselect-component" on:click={deselectComponent}><i class="fa-solid fa-circle-chevron-left"></i> Go back</button>
        </div>
    </div>
    <div class="fab-tab-header fab-row">
        <img src="{selectedComponent.imageUrl}" width="48px" height="48px" />
        <h2>{selectedComponent.name}</h2>
    </div>
    <div class="fab-row fab-columns">
        <div class="fab-column">
            <div class="fab-row">
                <h3>Salvage</h3>
            </div>
        </div>
        <div class="fab-column">
            <div class="fab-row">
                <h3>Available Components</h3>
            </div>
        </div>
    </div>
    <div class="fab-row">
        <h3>Essences</h3>
    </div>
</div>
