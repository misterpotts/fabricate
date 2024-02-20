<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import Properties from "../../scripts/Properties";
    import truncate from "../common/Truncate";
    import {Avatar} from "@skeletonlabs/skeleton";
    import type {Essence} from "../../scripts/crafting/essence/Essence";
    import {type Combination, DefaultCombination} from "../../scripts/common/Combination";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let name: string;
    export let quantity: number = 1;
    export let requiredQuantity: number = undefined;
    export let imageUrl: string;
    export let essences: Combination<Essence> = DefaultCombination.EMPTY();
    export let imageWidth: string = "w-24";
    export let imageRounding: string = "rounded-r-none rounded-l-md";

</script>

<div class="card snap-start h-full bg-surface-700 flex flex-row col-span-1 row-span-1 relative">
    <Avatar src={imageUrl}
            alt={name}
            fallback={Properties.ui.defaults.componentImageUrl}
            width={imageWidth}
            rounded={imageRounding}/>
    {#if typeof requiredQuantity !== "undefined"}
        {#if quantity >= requiredQuantity}
            <span class="absolute bottom-0 left-0 rounded-bl-lg {imageWidth} bg-success-500 text-center text-black font-bold h-5 leading-5">
                {quantity} / {requiredQuantity}
            </span>
        {:else}
            <span class="absolute bottom-0 left-0 rounded-bl-lg {imageWidth} bg-error-500 text-center text-black font-bold h-5 leading-5">
                {quantity} / {requiredQuantity}
            </span>
        {/if}
    {:else if quantity > 1}
        <span class="text-black badge-icon text-lg font-light variant-filled-secondary w-7 h-7 absolute left-2 top-2 z-10">
            {quantity}
        </span>
    {/if}
    <div class="flex flex-col p-2">
        <p class="text-white mb-2 font-bold">
            {truncate(name, 18, 12)}
        </p>
        <div class="flex flex-row">
            {#if !essences.isEmpty()}
                <div class="flex mr-2">
                    <p class="mr-2">Essences:</p>
                    {#each essences.units as essenceUnit}
                        <span class="text-l flex" data-tooltip="{essenceUnit.element.name}">
                            <span class="mr-1">{essenceUnit.quantity}</span>
                            <i class="{essenceUnit.element.iconCode}"></i>
                        </span>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>