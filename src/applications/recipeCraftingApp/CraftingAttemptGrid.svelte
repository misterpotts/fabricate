<!-- CraftingAttemptGrid.svelte -->
<script lang="ts">
    import openItemSheet from "../common/OpenItemSheet";
    import {getContext} from "svelte";
    import {localizationKey} from "../common/LocalizationService";
    import Properties from "../../scripts/Properties";
    import truncate from "../common/Truncate";

    const { localization } = getContext(localizationKey);
    const localizationPath = `${Properties.module.id}.CraftingAttemptGrid`;

    export let columns = 3;
    export let nameLength = 12;
    export let ingredients;
    export let catalysts;
    export let essences;

</script>

{#if !ingredients.isEmpty}
    <h3>{localization.localize(`${Properties.module.id}.typeNames.ingredient.plural`)}</h3>
    <div class="fab-component-grid fab-grid-{columns}">
        {#each ingredients.units as unit}
            <div class="fab-component">
                <div class="fab-component-name">
                    <p>{truncate(unit.target.part.name, nameLength)}</p>
                </div>
                <div class="fab-component-preview" class:fab-insufficient={!unit.isSufficient}>
                    <div class="fab-component-image" data-tooltip={unit.target.part.name}>
                        <img src={unit.target.part.imageUrl} alt={unit.target.part.name} use:openItemSheet={unit.target.part.itemUuid}>
                    </div>
                </div>
                <div class="fab-component-requirements" class:fab-insufficient={!unit.isSufficient}>
                    <p>{`${unit.actual.quantity} / ${unit.target.quantity}`}</p>
                </div>
            </div>
        {/each}
    </div>
{/if}
{#if !catalysts.isEmpty}
    <h3>{localization.localize(`${Properties.module.id}.typeNames.catalyst.plural`)}</h3>
    <div class="fab-component-grid fab-grid-{columns}">
        {#each catalysts.units as unit}
            <div class="fab-component">
                <div class="fab-component-name">
                    <p>{truncate(unit.target.part.name, nameLength)}</p>
                </div>
                <div class="fab-component-preview" class:fab-insufficient={!unit.isSufficient}>
                    <div class="fab-component-image" data-tooltip={unit.target.part.name}>
                        <img src={unit.target.part.imageUrl} alt={unit.target.part.name} use:openItemSheet={unit.target.part.itemUuid}>
                    </div>
                </div>
                <div class="fab-component-requirements" class:fab-insufficient={!unit.isSufficient}>
                    <p>{`${unit.actual.quantity} / ${unit.target.quantity}`}</p>
                </div>
            </div>
        {/each}
    </div>
{/if}
{#if !essences.isEmpty}
    <h3>{localization.localize(`${Properties.module.id}.typeNames.essence.plural`)}</h3>
    <div class="fab-essence-grid fab-grid-{2}">
        {#each essences.units as unit}
            <div class="fab-essence">
                <div class="fab-essence-amount" class:fab-insufficient={!unit.isSufficient}>
                    <span class="fab-essence-quantity">
                        {unit.actual.quantity} / {unit.target.quantity}
                    </span>
                    <span class="fab-essence-icon">
                        <i class="{unit.target.part.iconCode}"></i>
                    </span>
                    <span class="fab-essence-name">
                        {unit.target.part.name}
                    </span>
                </div>
            </div>
        {/each}
    </div>
{/if}