<!-- CraftingComponentGrid.svelte -->
<script lang="ts">
    import openItemSheet from "./OpenItemSheet";
    import truncate from "./Truncate";
    export let componentCombination;
    export let columns = 3;
    export let nameLength = 12;
</script>

<div class="fab-component-grid fab-grid-{columns}">
    {#each componentCombination.units as unit}
        <div class="fab-component">
            <div class="fab-component-name">
                <p>{truncate(unit.part.name, nameLength)}</p>
            </div> 
            <div class="fab-component-preview">
                <div class="fab-component-image" data-tooltip={unit.part.name}>
                    <img src={unit.part.imageUrl} alt={unit.part.name} use:openItemSheet={unit.part.itemUuid}>
                    {#if unit.quantity > 1}
                        <span class="fab-component-info fab-component-quantity">{unit.quantity}</span>
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>