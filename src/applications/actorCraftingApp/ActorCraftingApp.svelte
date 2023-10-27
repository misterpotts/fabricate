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
    import type {RecipeSummary} from "./RecipeSummary";
    import truncate from "../common/Truncate";
    import Properties from "../../scripts/Properties";
    import {type CraftingPlan, DefaultCraftingPlan, NoCraftingPlan} from "./CraftingPlan";
    import {NoSalvagePlan, type SalvagePlan} from "./SalvagePlan";
    import {RecipeSummarySearchStore} from "./RecipeSummarySearchStore";

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

    let searchCraftableOnly: boolean = false;
    let searchName: string = "";
    const summarisedRecipes: RecipeSummarySearchStore = new RecipeSummarySearchStore();

    let craftingPlan: CraftingPlan = new NoCraftingPlan();

    let salvagePlan: SalvagePlan = new NoSalvagePlan();

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

    function searchRecipeSummaries() {
        console.log(`Fabricate | ActorCraftingApp: Searching for recipes with name ${searchName} and craftable only ${searchCraftableOnly}`);
        summarisedRecipes.searchTerms = {
            name: searchName,
            craftableOnly: searchCraftableOnly
        };
    }

    async function prepareRecipes() {
        summarisedRecipes.availableRecipes = await fabricateAPI.crafting.summariseRecipes({
            targetActorId: targetActorDetails.id,
            sourceActorId: sourceActorDetails.id ? sourceActorDetails.id : undefined
        });
    }

    function clearCraftingPlan() {
        craftingPlan = new NoCraftingPlan();
    }

    function clearSearchName() {
        if (!searchName) {
            summarisedRecipes.searchTerms = {
                name: "",
                craftableOnly: searchCraftableOnly
            };
        }
    }

    function handleRecipeSummaryClicked(recipeSummary: RecipeSummary) {
        craftingPlan = new DefaultCraftingPlan({ recipeName: recipeSummary.name });
    }

    onMount(async () => {
        await loadActorDetails();
        await prepareRecipes();
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
            {#if craftingPlan.isReady}
                <AppBar background="bg-surface-700 text-white">
                    <svelte:fragment slot="lead"><i class="fa-solid fa-circle-arrow-left text-lg text-primary-500 cursor-pointer" on:click={clearCraftingPlan}></i></svelte:fragment>
                    <h2 class="text-lg">{craftingPlan.recipeName}</h2>
                </AppBar>
            {:else}
                <AppBar background="bg-surface-700 text-white" slotDefault="space-x-4 flex">
                    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                        <div class="input-group-shim"><i class="fa-solid fa-magnifying-glass"></i></div>
                        <input class="input h-full rounded-none p-2 text-black placeholder-gray-500" type="search" placeholder="Recipe name..." bind:value={searchName} on:change={clearSearchName} />
                        <a class="btn variant-filled-primary text-black text-sm border-none rounded-l-none" on:click={searchRecipeSummaries}>Search</a>
                    </div>
                    <label class="label flex items-center space-x-2">
                        <span>Craftable only?</span>
                        <input class="checkbox" type="checkbox" bind:checked={searchCraftableOnly} on:change={searchRecipeSummaries}/>
                    </label>
                </AppBar>
                <div class="max-h-full overflow-y-auto">
                </div>
                <div class="grid grid-cols-6 gap-5 p-4">
                    {#each $summarisedRecipes as recipeSummary}
                        <div class="card variant-soft-primary rounded-none cursor-pointer" on:click={() => handleRecipeSummaryClicked(recipeSummary)}>
                            <header class="card-header bg-surface-800 h-1/3 text-center pb-4 grid grid-cols-1 grid-rows-1">
                                <span class="place-self-center text-white">{truncate(recipeSummary.name, 24, 12)}</span>
                            </header>
                            <section class="relative">
                                <Avatar src="{recipeSummary.imageUrl}"
                                        fallback="{Properties.ui.defaults.recipeImageUrl}"
                                        width="w-full"
                                        rounded="rounded-none" />
                                {#if recipeSummary.isDisabled}
                                    <footer class="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                        <span class="text-warning-900 text-2xl badge-icon variant-filled-warning w-10 h-10">
                                            <i class="fa-solid fa-lock"></i>
                                        </span>
                                    </footer>
                                {:else if !recipeSummary.isCraftable}
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


