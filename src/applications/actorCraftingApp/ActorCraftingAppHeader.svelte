<!-- ActorCraftingAppHeader.svelte -->
<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {AppBar, Avatar, ListBox, ListBoxItem} from "@skeletonlabs/skeleton";
    import type {ActorDetails} from "./ActorDetails";
    import {clickOutside} from "../common/ClickOutside";
    import {DefaultActorDetails, NoActorDetails} from "./ActorDetails";
    import {createEventDispatcher, onMount} from "svelte";
    import type {LocalizationService} from "../common/LocalizationService";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let localization: LocalizationService;
    export let targetActorDetails: ActorDetails = new NoActorDetails();
    export let sourceActorDetails: ActorDetails = new NoActorDetails();

    /*
     * ===========================================================================
     * Private component properties
     * ===========================================================================
     */

    const dispatch = createEventDispatcher();

    /*
     * ===========================================================================
     * Source actor selection and search
     * ===========================================================================
     */

    let showSourceActorSelection: boolean = false;
    let sourceActorNameSearchValue: string = "";
    let availableSourceActors: ActorDetails[] = [];
    $: filteredSourceActors = availableSourceActors.filter(actor => {
        if (!sourceActorNameSearchValue) {
            return true;
        }
        return actor.name.search(new RegExp(sourceActorNameSearchValue, "i")) >= 0;
    });

    /*
     * ===========================================================================
     * Private component functions
     * ===========================================================================
     */

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

    async function loadActorDetails() {

        const sourceActor = await game.actors.get(sourceActorDetails.id);
        if (!sourceActor) {
            throw new Error(`Fabricate | ActorCraftingApp: Unable to find actor with id ${sourceActorDetails.id}`);
        }

        sourceActorDetails = new DefaultActorDetails({
            id: sourceActorDetails.id,
            name: sourceActor.name,
            avatarUrl: sourceActor.img,
            initials: DefaultActorDetails.getInitialsFromName(sourceActor.name)
        });

        if (targetActorDetails.id === sourceActorDetails.id) {
            targetActorDetails = sourceActorDetails;

            dispatch("actorDetailsLoaded", {
                sourceActorDetails: sourceActorDetails,
                targetActorDetails: targetActorDetails
            });

            return;
        }

        const targetActor = await game.actors.get(targetActorDetails.id);
        if (!targetActor) {
            throw new Error(`Fabricate | ActorCraftingApp: Unable to find actor with id ${targetActorDetails.id}`);
        }

        targetActorDetails = new DefaultActorDetails({
            id: targetActorDetails.id,
            name: targetActor.name,
            avatarUrl: targetActor.img,
            initials: DefaultActorDetails.getInitialsFromName(targetActor.name)
        });

        dispatch("actorDetailsLoaded", {
            sourceActorDetails: sourceActorDetails,
            targetActorDetails: targetActorDetails
        });

    }

    async function setSourceActor(value: ActorDetails) {
        sourceActorDetails = value;
        showSourceActorSelection = false;
        dispatch("sourceActorChanged", sourceActorDetails);
        sourceActorNameSearchValue = "";
    }

    async function clearSourceActor() {
        sourceActorDetails = targetActorDetails;
        dispatch("sourceActorChanged", sourceActorDetails);
        sourceActorNameSearchValue = "";
    }

    onMount(async () => {
        await loadActorDetails();
    });

</script>

<div class="flex flex-row">
    <AppBar gridColumns="grid-cols-3" slotLead="place-self-start" slotTrail="w-full h-full relative" background="bg-surface-600" class="w-full">
        <svelte:fragment slot="lead">
            <div class="space-x-4 flex place-items-center">
                <Avatar src="{targetActorDetails.avatarUrl}" initials="{targetActorDetails.initials}" width="w-16" rounded="rounded-full" />
                <h1 class="mb-0 text-xl text-white">{targetActorDetails.name}</h1>
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
                        <h2 class="text-xl text-white">{sourceActorDetails.name}</h2>
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
                            <input class="input h-full rounded-none p-2 text-black placeholder-gray-500" type="search" placeholder="Actor name..." bind:value={sourceActorNameSearchValue} />
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
                                             on:click={() => { setSourceActor(availableSourceActor); }}>
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