<script lang="ts">
    import Properties from "../../scripts/Properties";
    import { createEventDispatcher } from 'svelte'
    import { getContext } from 'svelte';
    import { localizationKey } from "../common/LocalizationService";

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp.header`;

    const dispatch = createEventDispatcher();

    export let component;
    export let ownedComponentsOfType;
    const { localization } = getContext(localizationKey);

    function salvageComponent() {
        dispatch('salvageComponent', {
            component
        });
    }
</script>

<div class="fab-item-salvage-header fab-row">
    <img src={component.imageUrl}>
    <h2>{component.name} ({ownedComponentsOfType.size})</h2>
    <button class="fab-component-salvage-btn" on:click={salvageComponent}><i class="fa-solid fa-recycle"></i> {localization.localize(`${localizationPath}.buttons.salvage`)}</button>
</div>