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

    function setSourceActor(value: ActorDetails) {
        sourceActorDetails = value;
        showSourceActorSelection = false;
    }

    function clearSourceActor() {
        sourceActorDetails = targetActorDetails;
    }

    function toggleSourceActorSelectionMenu() {
        if (showSourceActorSelection) {
            showSourceActorSelection = false;
            return;
        }
        availableSourceActors = game.actors
            .filter(actor => actor.isOwner)
            .filter(actor => actor.id !== targetActorDetails.id)
            .filter(actor => actor.type === "character" || actor.type === "npc")
            .map(actor => new DefaultActorDetails({
                id: actor.id,
                name: actor.name,
                avatarUrl: actor.img,
                initials: DefaultActorDetails.getInitialsFromName(actor.name)
            }));
        showSourceActorSelection = true;
    }

    onMount(async () => {
        await loadActorDetails();
    });

</script>

<AppShell>
    <svelte:fragment slot="header">
        <AppBar gridColumns="grid-cols-3" slotLead="place-self-start" slotTrail="w-full" background="bg-surface-600">
            <svelte:fragment slot="lead">
                <div class="space-x-4 flex place-items-center">
                    <Avatar src="{targetActorDetails.avatarUrl}" initials="{targetActorDetails.initials}" width="w-16" rounded="rounded-full" />
                    <h1 class="mb-0 text-lg">{targetActorDetails.name}</h1>
                </div>
            </svelte:fragment>
            <svelte:fragment slot="trail">
                <div class="relative flex w-full justify-end">
                    {#if sourceActorDetails.id === targetActorDetails.id}
                            <a class="btn variant-filled-primary text-sm text-black" on:click={toggleSourceActorSelectionMenu}>
                                <span><i class="fa-solid fa-box-open"></i></span>
                                <span>Craft from another source</span>
                            </a>
                    {:else if availableSourceActors.length > 0}
                        <div class="space-x-4 place-items-center cursor-pointer inline-flex" on:auxclick={clearSourceActor} on:click={toggleSourceActorSelectionMenu}>
                            <div class="relative">
                                <span class="text-black badge-icon variant-filled-tertiary absolute -top-0 -right-0 z-10"><i class="fa-solid fa-box-open"></i></span>
                                <Avatar src="{sourceActorDetails.avatarUrl}" initials="{sourceActorDetails.initials}" width="w-16" rounded="rounded-full" class="no-img-border" />
                            </div>
                            <h2 class="text-lg">{sourceActorDetails.name}</h2>
                        </div>
                    {/if}
                    {#if showSourceActorSelection}
                        <ListBox rounded="rounded" class="absolute bg-surface-700 w-full mt-2">
                            {#each availableSourceActors as availableSourceActor}
                                <ListBoxItem bind:group={sourceActorDetails}
                                            name="Source Actor" value="{availableSourceActor}"
                                            on:click={() => {setSourceActor(availableSourceActor);}}>
                                    <svelte:fragment slot="lead">
                                        <Avatar src="{availableSourceActor.avatarUrl}" initials="{availableSourceActor.initials}" width="w-8" rounded="rounded-full" class="inline-flex" />
                                    </svelte:fragment>
                                    <span>{availableSourceActor.name}</span>
                                </ListBoxItem>
                            {/each}
                        </ListBox>
                    {/if}
                </div>
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
        <div class="grid grid-cols-6 gap-4 p-4">
            <div class="card variant-soft">
                <header class="card-header"><div class="placeholder animate-pulse" /></header>
                <section class="p-4"><div class="placeholder animate-pulse" /></section>
                <footer class="card-footer"><div class="placeholder animate-pulse" /></footer>
            </div>
            <div class="card variant-soft">
                <header class="card-header"><div class="placeholder animate-pulse" /></header>
                <section class="p-4"><div class="placeholder animate-pulse" /></section>
                <footer class="card-footer"><div class="placeholder animate-pulse" /></footer>
            </div>
            <div class="card variant-soft">
                <header class="card-header"><div class="placeholder animate-pulse" /></header>
                <section class="p-4"><div class="placeholder animate-pulse" /></section>
                <footer class="card-footer"><div class="placeholder animate-pulse" /></footer>
            </div>

        </div>
    </slot>
</AppShell>


