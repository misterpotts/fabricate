<!-- CraftingComponentGrid.svelte -->
<script lang="ts">
    import openItemSheet from "./OpenItemSheet";
    import truncate from "./Truncate";
    import type {Combination} from "../../scripts/common/Combination";
    import type {Component} from "../../scripts/crafting/component/Component";
    export let componentCombination: Combination<Component>;
    export let columns: number = 3;
    export let nameLength: number = 12;
</script>

<div class="fab-component-grid fab-grid-{columns}">
    {#each componentCombination.units as unit}
        {#await unit.element.load()}
            {:then nothing}
                <div class="fab-component">
                    <div class="fab-component-name">
                        <p>{truncate(unit.element.name, nameLength)}</p>
                    </div>
                    <div class="fab-component-preview">
                        <div class="fab-component-image" data-tooltip={unit.element.name}>
                            <img src={unit.element.imageUrl} alt={unit.element.name} use:openItemSheet={unit.element.itemUuid}>
                            {#if unit.quantity > 1}
                                <span class="fab-component-info fab-component-quantity">{unit.quantity}</span>
                            {/if}
                        </div>
                    </div>
                </div>
            {:catch error}
        {/await}
    {/each}
</div>