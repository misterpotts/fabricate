<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import Properties from "../../scripts/Properties";
    import truncate from "../common/Truncate";
    import type {CraftingAssessment} from "./CraftingAssessment";
    import type {SalvageAssessment} from "./SalvageAssessment";
    import {Avatar} from "@skeletonlabs/skeleton-svelte";
    import {type ActorDetails, NoActorDetails} from "./ActorDetails";
    import {createEventDispatcher} from "svelte";
    import type {LocalizationService} from "../common/LocalizationService";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let localization: LocalizationService;
    export let sourceActorDetails: ActorDetails = new NoActorDetails();
    export let targetActorDetails: ActorDetails = new NoActorDetails();
    export let craftingAssessments: CraftingAssessment[] = [];
    export let salvageAssessments: SalvageAssessment[] = [];

    /*
     * ===========================================================================
     * Private component properties
     * ===========================================================================
     */

    const dispatch = createEventDispatcher();

    /*
     * ===========================================================================
     * Recipe crafting assessments search
     * ===========================================================================
     */

    let mustBeCraftable: boolean = false;
    let searchRecipeName: string = "";
    $: craftingAssessmentsToDisplay = craftingAssessments.filter(recipe => {
        if (mustBeCraftable && !recipe.isCraftable) {
            return false;
        }
        if (!searchRecipeName) {
            return true;
        }
        return recipe.recipeName.search(new RegExp(searchRecipeName, "i")) >= 0;
    });

    /*
     * ===========================================================================
     * Component salvage assessments search
     * ===========================================================================
     */

    let mustHaveSalvage: boolean = false;
    let mustBeSalvageable: boolean = false;
    let mustHaveEssences: boolean = false;
    let mustHaveCatalysts: boolean = false;
    let searchComponentName: string = "";
    $: salvageAssessmentsToDisplay = salvageAssessments
        .filter(salvageAssessment => {
            if (mustHaveSalvage && !salvageAssessment.hasSalvage) {
                return false;
            }
            if (mustBeSalvageable && !salvageAssessment.isSalvageable) {
                return false;
            }
            if (mustHaveEssences && !salvageAssessment.hasEssences) {
                return false;
            }
            if (mustHaveCatalysts && !salvageAssessment.needsCatalysts) {
                return false;
            }
            if (!searchComponentName) {
                return true;
            }
            return salvageAssessment.componentName.search(new RegExp(searchComponentName, "i")) >= 0;
        });

    /*
     * ===========================================================================
     * Private component functions
     * ===========================================================================
     */

    function startCraftingProcess(craftingAssessment: CraftingAssessment) {
        dispatch("startCraftingProcess", craftingAssessment);
    }

    function startSalvageProcess(salvageAssessment: SalvageAssessment) {
        if (!salvageAssessment.hasSalvage) {
            return;
        }
        dispatch("startSalvageProcess", salvageAssessment);
    }

</script>

<div class="flex flex-row h-full">
    <div class="flex flex-col w-4/5  p-4 h-[654px]">
        <h2 class="text-center text-xl pb-4 text-white">Recipes</h2>
        <div class="bg-surface-700 text-white grid grid-cols-3 grid-rows-1 p-4 gap-2 h-[64px] rounded-md">
            <div class="row-span-1 col-span-2 pb-1">
                <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                    <div class="input-group-shim"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <input class="input h-full rounded-none p-2 text-black placeholder-gray-500" type="search" placeholder="Recipe name..." bind:value={searchRecipeName} />
                </div>
            </div>
            <label class="label flex items-center space-x-2 col-span-1 row-span-1">
                <input class="checkbox" type="checkbox" bind:checked={mustBeCraftable} />
                <span class="mt-0">Can be crafted</span>
            </label>
        </div>
        <div class="pt-4 pb-4 h-[528px]">
            <div class="overflow-y-auto overflow-x-hidden h-full snap-y snap-mandatory scroll-smooth scroll-secondary scroll-px-4">
                <div class="grid grid-cols-2 gap-3">
                    {#each craftingAssessmentsToDisplay as craftingAssessment}
                        <div class="card overflow-hidden snap-start col-span-1 row-span-1 w-full bg-surface-700 flex flex-row relative"
                             class:cursor-pointer={!craftingAssessment.isDisabled}
                             on:click={() => startCraftingProcess(craftingAssessment)}>
                            <Avatar src="{craftingAssessment.imageUrl}"
                                    fallback="{Properties.ui.defaults.recipeImageUrl}"
                                    width="w-3/12"
                                    rounded="rounded-r-none rounded-l-md" />
                            <div class="flex flex-col p-2 w-9/12">
                                <p class="font-bold text-white mb-2">
                                    {truncate(craftingAssessment.recipeName, 38, 16)}
                                </p>
                            </div>
                            {#if craftingAssessment.isDisabled}
                                <div class="absolute e w-3/12 h-full bg-black bg-opacity-50 flex justify-center items-center">
                                    <span class="text-warning-900 text-2xl badge-icon variant-filled-warning w-10 h-10">
                                        <i class="fa-solid fa-lock"></i>
                                    </span>
                                </div>
                            {:else if !craftingAssessment.isCraftable}
                                <div class="absolute w-3/12 h-full bg-black bg-opacity-50 flex justify-center items-center">
                                    <span class="text-error-900 text-2xl badge-icon variant-filled-error w-10 h-10">
                                        <i class="fa-solid fa-circle-xmark"></i>
                                    </span>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        {#if craftingAssessments.length > 0}
                            <div class="col-span-2 h-96 flex place-items-center">
                                <p class="w-full text-center leading-relaxed">No matching recipes. Broaden your search terms, or get more stuff.</p>
                            </div>
                        {:else}
                            <div class="col-span-2 h-96 flex place-items-center">
                                <p class="w-full text-center leading-relaxed">{targetActorDetails.name} doesn't own any recipes.</p>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
    <div class="flex flex-col w-2/5 p-4 h-[654px]">
        <h2 class="text-center text-xl pb-4 text-white">Components</h2>
        <div class="bg-surface-700 text-white grid grid-cols-2 grid-rows-3 p-4 gap-2 h-[156px] rounded-md">
            <div class="row-span-1 col-span-2 pb-1">
                <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                    <div class="input-group-shim"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <input class="input h-full rounded-none p-2 text-black placeholder-gray-500" type="search" placeholder="Component name..." bind:value={searchComponentName} />
                </div>
            </div>
            <label class="label flex items-center space-x-2 col-span-1 row-span-1">
                <input class="checkbox" type="checkbox" bind:checked={mustBeSalvageable} />
                <span class="mt-0">Can be salvaged</span>
            </label>
            <label class="label flex items-center space-x-2 col-span-1 row-span-1">
                <input class="checkbox" type="checkbox" bind:checked={mustHaveSalvage} />
                <span class="mt-0">Has Salvage</span>
            </label>
            <label class="label flex items-center space-x-2 col-span-1 row-span-1">
                <input class="checkbox" type="checkbox" bind:checked={mustHaveEssences} />
                <span class="mt-0">Has essences</span>
            </label>
            <label class="label flex items-center space-x-2 col-span-1 row-span-1">
                <input class="checkbox" type="checkbox" bind:checked={mustHaveCatalysts} />
                <span class="mt-0">Needs catalysts</span>
            </label>
        </div>
        <div class="pt-4 pb-4 h-[436px]">
            <div class="overflow-y-auto overflow-x-hidden h-full snap-y snap-mandatory scroll-smooth scroll-secondary scroll-px-4">
                <div class="grid grid-cols-1 gap-3">
                    {#each salvageAssessmentsToDisplay as salvageAssessment}
                        <div class="card snap-start col-span-1 row-span-1 w-full bg-surface-700 flex flex-row relative"
                             class:cursor-pointer={salvageAssessment.hasSalvage}
                             on:click={() => startSalvageProcess(salvageAssessment)}>
                            {#if salvageAssessment.isSalvageable}
                                <span class="text-black text-lg badge-icon variant-filled-success w-6 h-6 absolute left-1 top-1 z-10" data-tooltip="Salvageable">
                                    <i class="fa-solid fa-recycle"></i>
                                </span>
                            {:else if salvageAssessment.hasSalvage}
                                <span class="text-black text-lg badge-icon variant-filled-error w-6 h-6 absolute left-1 top-1 z-10" data-tooltip="Not salvageable">
                                    <i class="fa-solid fa-recycle"></i>
                                </span>
                            {/if}
                            <Avatar src="{salvageAssessment.imageUrl}"
                                    fallback="{Properties.ui.defaults.componentImageUrl}"
                                    width="w-16"
                                    rounded="rounded-r-none rounded-l-md" />
                            <div class="flex flex-col p-2">
                                <p class="font-bold text-white mb-2">
                                    {truncate(salvageAssessment.componentName, 18, 12)} {#if salvageAssessment.quantity > 1}({salvageAssessment.quantity}){/if}
                                </p>
                                {#if salvageAssessment.hasEssences}
                                    <div class="flex-row flex">
                                        <p class="mr-2">Essences:</p>
                                        {#each salvageAssessment.essences as essence}
                                                <span class="text-l flex" data-tooltip="{essence.element.name}">
                                                    <span class="mr-1">{essence.quantity}</span>
                                                    <i class="{essence.element.iconCode}"></i>
                                                </span>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {:else}
                        {#if salvageAssessments.length > 0}
                            <div class="col-span-1 h-96 flex place-items-center">
                                <p class="w-full text-center leading-relaxed">No matching components. Broaden your search terms, or get more stuff.</p>
                            </div>
                        {:else}
                            <div class="col-span-1 h-96 flex place-items-center">
                                <p class="w-full text-center leading-relaxed">{sourceActorDetails.name} doesn't own any components.</p>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
