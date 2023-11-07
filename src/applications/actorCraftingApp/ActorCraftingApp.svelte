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
    import {NoSalvagePlan, type SalvagePlan} from "./SalvagePlan";
    import type {SalvageAssessment} from "./SalvageAssessment";

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
    let availableSourceActors: ActorDetails[] = [];
    let showSourceActorSelection: boolean = false;
    let craftingAssessment: CraftingProcess = new NoCraftingProcess();
    let salvagePlan: SalvagePlan = new NoSalvagePlan();

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
    let searchSalvageName: string = "";
    let salvageAssessments: SalvageAssessment[] = [];
    $: salvageAssessmentsToDisplay = salvageAssessments
        .filter(salvageAssessment => {
            if (mustHaveSalvage && !salvageAssessment.hasSalvage) {
                return false;
            }
            if (mustBeSalvageable && !salvageAssessment.isSalvageable) {
                return false;
            }
            if (!searchSalvageName) {
                return true;
            }
            return salvageAssessment.componentName.search(new RegExp(searchSalvageName, "i")) >= 0;
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
    }

    async function clearSourceActor() {
        sourceActorDetails = targetActorDetails;
        await prepareRecipes();
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
            actorId: targetActorDetails.id,
        });
    }

    function clearCraftingPlan() {
        craftingAssessment = new NoCraftingProcess();
    }

    function openCraftingAssessment(recipeSummary: CraftingAssessment) {
        craftingAssessment = new DefaultCraftingProcess({ recipeName: recipeSummary.recipeName });
    }

    onMount(async () => {
        await loadActorDetails();
        await prepareRecipes();
        await prepareComponents();
    });

</script>

<AppShell>
    <svelte:fragment slot="header">
        <AppBar gridColumns="grid-cols-3" slotLead="place-self-start" slotTrail="w-full h-full relative" background="bg-surface-600">
            <svelte:fragment slot="lead">
                <div class="space-x-4 flex place-items-center">
                    <Avatar src="{targetActorDetails.avatarUrl}" initials="{targetActorDetails.initials}" width="w-16" rounded="rounded-full" />
                    <h1 class="mb-0 text-lg">{targetActorDetails.name}</h1>
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
                                <span class="text-black badge-icon variant-filled-tertiary absolute -top-0 -right-0 z-10"><i class="fa-solid fa-box-open"></i></span>
                                <Avatar src="{sourceActorDetails.avatarUrl}" initials="{sourceActorDetails.initials}" width="w-16" rounded="rounded-full" class="no-img-border" />
                            </div>
                            <h2 class="text-lg">{sourceActorDetails.name}</h2>
                        </div>
                    </div>
                {/if}
                {#if showSourceActorSelection}
                    <ListBox rounded="rounded" class="absolute bg-surface-700 top-14 -left-3 w-full border-surface-500 space-x-0">
                        {#each availableSourceActors as availableSourceActor}
                            <ListBoxItem bind:group={sourceActorDetails}
                                         name="Source Actor"
                                         hover="hover:bg-primary-500 hover:text-black"
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
                {/if}
            </svelte:fragment>
        </AppBar>
    </svelte:fragment>
    <svelte:fragment slot="sidebarLeft">
        <AppRail background="bg-surface-600">
            <AppRailTile bind:group={view} name="components" value={ActorCraftingAppViewType.SALVAGING} title="components">
                <svelte:fragment slot="lead"><i class="fa-solid fa-toolbox"></i></svelte:fragment>
                <span>Components</span>
            </AppRailTile>
            <AppRailTile bind:group={view} name="recipes" value={ActorCraftingAppViewType.CRAFTING} title="recipes">
                <svelte:fragment slot="lead"><i class="fa-solid fa-book"></i></svelte:fragment>
                <span>Recipes</span>
            </AppRailTile>
        </AppRail>
    </svelte:fragment>
    <slot>
        {#if view === ActorCraftingAppViewType.CRAFTING}
            {#if craftingAssessment.isReady}
                <AppBar background="bg-surface-700 text-white">
                    <svelte:fragment slot="lead"><i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearCraftingPlan}></i></svelte:fragment>
                    <h2 class="text-lg">{craftingAssessment.recipeName}</h2>
                </AppBar>
            {:else}
                <AppBar background="bg-surface-700 text-white" slotDefault="space-x-4 flex">
                    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                        <div class="input-group-shim"><i class="fa-solid fa-magnifying-glass"></i></div>
                        <input class="input h-full rounded-none p-2 text-black placeholder-gray-500" type="search" placeholder="Recipe name..." bind:value={searchRecipeName} />
                    </div>
                    <label class="label flex items-center space-x-2">
                        <span>Craftable only?</span>
                        <input class="checkbox" type="checkbox" bind:checked={mustBeCraftable} />
                    </label>
                </AppBar>
                <div class="max-h-full overflow-y-auto">
                </div>
                <div class="grid grid-cols-6 gap-5 p-4">
                    {#each craftingAssessmentsToDisplay as craftingAssessment}
                        <div class="card variant-soft-primary rounded-none cursor-pointer" on:click={() => openCraftingAssessment(craftingAssessment)}>
                            <header class="card-header bg-surface-800 h-1/3 text-center pb-4 grid grid-cols-1 grid-rows-1">
                                <span class="place-self-center text-white">{truncate(craftingAssessment.recipeName, 24, 12)}</span>
                            </header>
                            <section class="relative">
                                <Avatar src="{craftingAssessment.imageUrl}"
                                        fallback="{Properties.ui.defaults.recipeImageUrl}"
                                        width="w-full"
                                        rounded="rounded-none" />
                                {#if craftingAssessment.isDisabled}
                                    <footer class="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                        <span class="text-warning-900 text-2xl badge-icon variant-filled-warning w-10 h-10">
                                            <i class="fa-solid fa-lock"></i>
                                        </span>
                                    </footer>
                                {:else if !craftingAssessment.isCraftable}
                                    <footer class="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                        <span class="text-error-900 text-2xl badge-icon variant-filled-error w-10 h-10">
                                            <i class="fa-solid fa-circle-xmark"></i>
                                        </span>
                                    </footer>
                                {/if}
                            </section>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </slot>
</AppShell>


