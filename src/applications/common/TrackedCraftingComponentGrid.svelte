<script lang="ts">

    import openItemSheet from "./OpenItemSheet";
    import truncate from "./Truncate";
    import {TrackedCombination} from "../../scripts/common/TrackedCombination";
    import type {Component} from "../../scripts/crafting/component/Component";

    export let trackedCombination: TrackedCombination<Component>;
    export let columns: number = 3;
    export let nameLength: number = 12;

    function formatQuantity(actual, target) {
        const formattedActual = actual > 99 ? "99+" : actual.toString();
        return `${formattedActual} / ${target}`;
    }
</script>

<div class="fab-component-grid fab-grid-{columns}">
    {#each trackedCombination.units as unit}
        <div class="fab-component">
            <div class="fab-component-name">
                <p>{truncate(unit.target.element.name, nameLength)}</p>
            </div>
            <div class="fab-component-preview" class:fab-insufficient={!unit.isSufficient}>
                <div class="fab-component-image" data-tooltip={unit.target.element.name}>
                    <img src={unit.target.element.imageUrl} alt={unit.target.element.name} use:openItemSheet={unit.target.element.itemUuid}>
                </div>
            </div>
            <div class="fab-component-requirements" class:fab-insufficient={!unit.isSufficient}>
                <p>{formatQuantity(unit.actual.quantity, unit.target.quantity)}</p>
            </div>
        </div>
    {/each}
</div>