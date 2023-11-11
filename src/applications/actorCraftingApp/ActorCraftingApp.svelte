<!-- ActorCraftingApp.svelte -->
<script lang="ts">

    import {AppBar, AppRail, AppRailTile, AppShell, Avatar, ListBox, ListBoxItem} from "@skeletonlabs/skeleton";
    import type {LocalizationService} from "../common/LocalizationService";
    import type {FabricateAPI} from "../../scripts/api/FabricateAPI";
    import {ActorCraftingAppViewType} from "./ActorCraftingAppViewType";
    import type {ActorDetails} from "./ActorDetails";
    import {NoActorDetails} from "./ActorDetails";
    import {onMount} from "svelte";
    import {DefaultActorDetails} from "./ActorDetails.js";
    import type {CraftingAssessment} from "./CraftingAssessment";
    import truncate from "../common/Truncate";
    import Properties from "../../scripts/Properties";
    import {type CraftingProcess, DefaultCraftingProcess, NoCraftingProcess} from "./CraftingProcess";
    import {NoSalvageProcess, type SalvageProcess} from "./SalvageProcess";
    import type {SalvageAssessment} from "./SalvageAssessment";
    import {DefaultSalvageProcess} from "./SalvageProcess.js";
    import {clickOutside} from "../common/ClickOutside";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let view: ActorCraftingAppViewType = ActorCraftingAppViewType.SALVAGING;
    export let localization: LocalizationService;
    export let fabricateAPI: FabricateAPI;
    export let sourceActorId: string;
    export let targetActorId: string;
    export let selectedRecipeId: string;
    export let selectedComponentId: string;

    /*
     * ===========================================================================
     * Private component members
     * ===========================================================================
     */

    let sourceActorDetails: ActorDetails = new NoActorDetails();
    let targetActorDetails: ActorDetails = new NoActorDetails();
    let showSourceActorSelection: boolean = false;
    let craftingProcess: CraftingProcess = new NoCraftingProcess();
    let salvageProcess: SalvageProcess = new NoSalvageProcess();

    /*
     * ===========================================================================
     * Recipe crafting assessments search
     * ===========================================================================
     */
    let sourceActorName: string = "";
    let availableSourceActors: ActorDetails[] = [];
    $: filteredSourceActors = availableSourceActors.filter(actor => {
        if (!sourceActorName) {
            return true;
        }
        return actor.name.search(new RegExp(sourceActorName, "i")) >= 0;
    });

    /*
     * ===========================================================================
     * Recipe crafting assessments search
     * ===========================================================================
     */

    let mustBeCraftable: boolean = false;
    let searchRecipeName: string = "";
    let craftingAssessments: CraftingAssessment[] = [];
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
    let salvageAssessments: SalvageAssessment[] = [];
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
     * Component member functions
     * ===========================================================================
     */

    async function loadActorDetails() {
        const sourceActor = await game.actors.get(sourceActorId);
        if (!sourceActor) {
            throw new Error(`Fabricate | ActorCraftingApp: Unable to find actor with id ${sourceActorId}`);
        }
        sourceActorDetails = new DefaultActorDetails({
            id: sourceActorId,
            name: sourceActor.name,
            avatarUrl: sourceActor.img,
            initials: DefaultActorDetails.getInitialsFromName(sourceActor.name)
        });
        if (targetActorId === sourceActorId) {
            targetActorDetails = sourceActorDetails;
            return;
        }
        const targetActor = await game.actors.get(targetActorId);
        if (!targetActor) {
            throw new Error(`Fabricate | ActorCraftingApp: Unable to find actor with id ${targetActorId}`);
        }
        targetActorDetails = new DefaultActorDetails({
            id: targetActorId,
            name: targetActor.name,
            avatarUrl: targetActor.img,
            initials: DefaultActorDetails.getInitialsFromName(targetActor.name)
        });
    }

    async function setSourceActor(value: ActorDetails) {
        sourceActorDetails = value;
        showSourceActorSelection = false;
        await prepareRecipes();
        await prepareComponents();
    }

    async function clearSourceActor() {
        sourceActorDetails = targetActorDetails;
        await prepareRecipes();
        await prepareComponents();
    }

    function toggleSourceActorSelectionMenu() {
        if (showSourceActorSelection) {
            showSourceActorSelection = false;
            return;
        }
        availableSourceActors = game.actors
            .filter(actor => actor.isOwner)
            .filter(actor => actor.type === "character" || actor.type === "npc")
            .filter(actor => actor.id !== targetActorDetails.id)
            .filter(actor => actor.id !== sourceActorDetails.id)
            .map(actor => new DefaultActorDetails({
                id: actor.id,
                name: actor.name,
                avatarUrl: actor.img,
                initials: DefaultActorDetails.getInitialsFromName(actor.name)
            }));
        showSourceActorSelection = true;
    }

    async function prepareRecipes() {
        craftingAssessments = await fabricateAPI.crafting.summariseRecipes({
            targetActorId: targetActorDetails.id,
            sourceActorId: sourceActorDetails.id ? sourceActorDetails.id : undefined
        });
    }

    async function prepareComponents() {
        salvageAssessments = await fabricateAPI.crafting.summariseComponents({
            actorId: sourceActorDetails.id,
        });
    }

    function clearCraftingProcess() {
        craftingProcess = new NoCraftingProcess();
    }

    function clearSalvageProcess() {
        salvageProcess = new NoSalvageProcess();
    }

    function startCraftingProcess(craftingAssessment: CraftingAssessment) {
        craftingProcess = new DefaultCraftingProcess({ recipeName: craftingAssessment.recipeName });
    }

    function startSalvageProcess(salvageAssessment: SalvageAssessment) {
        if (!salvageAssessment.hasSalvage) {
            return;
        }
        salvageProcess = new DefaultSalvageProcess({ componentName: salvageAssessment.componentName });
    }

    onMount(async () => {
        await loadActorDetails();
        await prepareRecipes();
        await prepareComponents();
    });

</script>

<div class="flex flex-col w-full h-full">
    <div class="flex flex-row">
        <AppBar gridColumns="grid-cols-3" slotLead="place-self-start" slotTrail="w-full h-full relative" background="bg-surface-600" class="w-full">
            <svelte:fragment slot="lead">
                <div class="space-x-4 flex place-items-center">
                    <Avatar src="{targetActorDetails.avatarUrl}" initials="{targetActorDetails.initials}" width="w-16" rounded="rounded-full" />
                    <h1 class="mb-0 text-xl">{targetActorDetails.name}</h1>
                </div>
            </svelte:fragment>
            <svelte:fragment slot="trail">
                {#if sourceActorDetails.id === targetActorDetails.id}
                    <div class="flex w-full justify-center">
                        <a class="btn variant-filled-primary text-sm text-black" on:click={toggleSourceActorSelectionMenu}>
                            <span><i class="fa-solid fa-box-open"></i></span>
                            <span>Craft from another source</span>
                        </a>
                    </div>
                {:else if availableSourceActors.length > 0}
                    <div class="flex w-full justify-start">
                        <div class="space-x-4 place-items-center cursor-pointer inline-flex" on:auxclick={clearSourceActor} on:click={toggleSourceActorSelectionMenu}>
                            <div class="relative">
                                <span class="text-black text-lg badge-icon variant-filled-tertiary absolute w-7 h-7 -top-0 -right-0 z-10">
                                    <i class="fa-solid fa-box-open"></i>
                                </span>
                                <Avatar src="{sourceActorDetails.avatarUrl}" initials="{sourceActorDetails.initials}" width="w-16" rounded="rounded-full" class="no-img-border" />
                            </div>
                            <h2 class="text-xl">{sourceActorDetails.name}</h2>
                        </div>
                    </div>
                {/if}
                {#if showSourceActorSelection}
                    <div class="absolute rounded-lg bg-surface-700 top-14 -left-3 w-full border-primary-300 border space-x-0 z-10"
                         use:clickOutside
                         on:clickOutside={() => { showSourceActorSelection = false; }}>
                        <div class="p-4">
                            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                                <div class="input-group-shim"><i class="fa-solid fa-magnifying-glass"></i></div>
                                <input class="input h-full rounded-none p-2 text-black placeholder-gray-500" type="search" placeholder="Actor name..." bind:value={sourceActorName} />
                            </div>
                        </div>
                        <div class="scroll scroll-secondary overflow-x-hidden overflow-y-auto max-h-48 snap-y snap-mandatory scroll-smooth scroll-px-4">
                            <ListBox>
                                {#each filteredSourceActors as availableSourceActor}
                                    <ListBoxItem bind:group={sourceActorDetails}
                                                 class="snap-start"
                                                 name="Source Actor"
                                                 hover="hover:bg-primary-400 hover:text-black"
                                                 rounded="rounded-none"
                                                 value="{availableSourceActor}"
                                                 on:click={() => {setSourceActor(availableSourceActor);}}>
                                        <svelte:fragment slot="lead">
                                            <Avatar src="{availableSourceActor.avatarUrl}"
                                                    initials="{availableSourceActor.initials}"
                                                    width="w-8"
                                                    rounded="rounded-full"
                                                    class="inline-flex" />
                                        </svelte:fragment>
                                        <span>{availableSourceActor.name}</span>
                                    </ListBoxItem>
                                {/each}
                            </ListBox>
                        </div>
                    </div>
                {/if}
            </svelte:fragment>
        </AppBar>
    </div>
    {#if craftingProcess.isReady}
        <AppBar background="bg-surface-700 text-white">
            <svelte:fragment slot="lead"><i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearCraftingProcess}></i></svelte:fragment>
            <h2 class="text-lg">Crafting {craftingProcess.recipeName}</h2>
        </AppBar>
    {:else if salvageProcess.isReady}
        <AppBar background="bg-surface-700 text-white">
            <svelte:fragment slot="lead"><i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearSalvageProcess}></i></svelte:fragment>
            <h2 class="text-lg">Salvaging {salvageProcess.componentName}</h2>
        </AppBar>
    {:else}
        <div class="flex flex-row h-full">
            <div class="flex flex-col w-4/5  p-4 h-[654px]">
                <h2 class="text-center text-xl pb-4">Recipes</h2>
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
                <h2 class="text-center text-xl pb-4">Components</h2>
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
                                    <span class="text-black text-lg badge-icon variant-filled-tertiary w-6 h-6 absolute left-1 top-1 z-10" data-tooltip="Salvageable">
                                        <i class="fa-solid fa-recycle"></i>
                                    </span>
                                    {:else if salvageAssessment.hasSalvage}
                                        <span class="text-error-900 text-lg badge-icon variant-filled-error w-6 h-6 absolute left-1 top-1 z-10" data-tooltip="Not salvageable">
                                        <i class="fa-solid fa-recycle"></i>
                                    </span>
                                    {/if}
                                    <Avatar src="{salvageAssessment.imageUrl}"
                                            fallback="{Properties.ui.defaults.componentImageUrl}"
                                            width="w-16"
                                            rounded="rounded-r-none rounded-l-md" />
                                    <div class="flex flex-col p-2">
                                        <p class="font-bold text-white mb-2">
                                            {truncate(salvageAssessment.componentName, 18, 12)}
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
    {/if}
</div>


