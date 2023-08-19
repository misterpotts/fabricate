<script lang="ts">
    import Properties from "../../scripts/Properties";
    import { createEventDispatcher } from 'svelte'
    import { getContext } from 'svelte';
    import { localizationKey } from "../common/LocalizationService";

    const localizationPath = `${Properties.module.id}.ComponentSalvageApp.header`;

    const dispatch = createEventDispatcher();

    export let component;
    export let amountOwned;
    const { localization } = getContext(localizationKey);

    function salvageComponent(event) {
        const skipDialog = event.shiftKey;
        dispatch('salvageComponent', {
            skipDialog
        });
    }
</script>

<div class="fab-item-salvage-header fab-row">
    <img src={component.imageUrl}>
    <h2>{component.name} ({amountOwned})</h2>
    <button class="fab-component-salvage-btn" on:click={(e) => salvageComponent(e)}><i class="fa-solid fa-recycle"></i> {localization.localize(`${localizationPath}.buttons.salvage`)}</button>
</div>