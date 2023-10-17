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

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let view: ActorCraftingAppViewType = ActorCraftingAppViewType.BROWSE_RECIPES;
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
    let summarisedRecipes: RecipeSummary[] = [];

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
        summarisedRecipes = await fabricateAPI.crafting.summariseRecipes({ sourceActorId: sourceActorDetails.id });
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
            <AppRailTile bind:group={view} name="recipes" value={ActorCraftingAppViewType.BROWSE_RECIPES} title="recipes">
                <svelte:fragment slot="lead"><i class="fa-solid fa-book"></i></svelte:fragment>
                <span>Recipes</span>
            </AppRailTile>
            <AppRailTile bind:group={view} name="components" value={ActorCraftingAppViewType.BROWSE_COMPONENTS} title="components">
                <svelte:fragment slot="lead"><i class="fa-solid fa-toolbox"></i></svelte:fragment>
                <span>Components</span>
            </AppRailTile>
        </AppRail>
    </svelte:fragment>
    <slot>
        {#if view === ActorCraftingAppViewType.BROWSE_RECIPES}
            <div class="grid grid-cols-6 gap-4 p-4">
                {#each summarisedRecipes as recipeSummary}
                    <div class="card variant-soft">
                        <header class="card-header"><img src="{recipeSummary.imageUrl}"></header>
                        <section class="p-4">{recipeSummary.name}</section>
                    </div>
                {/each}
            </div>
        {/if}
    </slot>
</AppShell>


