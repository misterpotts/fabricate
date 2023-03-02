<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    export let component;
    export let ownedComponentsOfType;

    function salvageComponent() {
        dispatch('salvageComponent', {
            component
        });
    }
</script>

<div class="fab-item-salvage-header fab-row">
    <img src={component.imageUrl}>
    <h2>{component.name} ({ownedComponentsOfType.size})</h2>
    <button class="fab-component-salvage-btn" on:click={salvageComponent}><i class="fa-solid fa-recycle"></i> Salvage</button>
</div>