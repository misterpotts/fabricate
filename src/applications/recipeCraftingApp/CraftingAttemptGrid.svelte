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

    function formatQuantity(actual, target) {
        const formattedActual = actual > 99 ? "99+" : actual.toString();
        return `${formattedActual} / ${target}`;
    }

</script>

{#if !ingredients.isEmpty}
    <h3>{localization.localize(`${Properties.module.id}.typeNames.ingredient.plural`)}</h3>
    <div class="fab-component-grid fab-grid-{columns}">
        {#each ingredients.units as unit}
            {#await Promise.all([unit.target.element.load(), unit.actual.element.load()])}
                {:then nothing}
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
                {:catch error}
            {/await}
        {/each}
    </div>
{/if}
{#if !catalysts.isEmpty}
    <h3>{localization.localize(`${Properties.module.id}.typeNames.catalyst.plural`)}</h3>
    <div class="fab-component-grid fab-grid-{columns}">
        {#each catalysts.units as unit}
            {#await Promise.all([unit.target.element.load(), unit.actual.element.load()])}
                {:then nothing}
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
                {:catch error}
            {/await}
        {/each}
    </div>
{/if}
{#if !essences.isEmpty}
    <h3>{localization.localize(`${Properties.module.id}.typeNames.essence.plural`)}</h3>
    <div class="fab-essence-grid fab-grid-{2}">
        {#each essences.units as unit}
            {#await Promise.all([unit.target.element.load(), unit.actual.element.load()])}
                {:then nothing}
                    <div class="fab-essence">
                        <div class="fab-essence-amount" class:fab-insufficient={!unit.isSufficient}>
                            <span class="fab-essence-quantity">
                                {formatQuantity(unit.actual.quantity, unit.target.quantity)}
                            </span>
                            <span class="fab-essence-icon">
                                <i class="{unit.target.element.iconCode}"></i>
                            </span>
                            <span class="fab-essence-name">
                                {unit.target.element.name}
                            </span>
                        </div>
                    </div>
                {:catch error}
            {/await}
        {/each}
    </div>
{/if}