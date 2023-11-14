<!-- ActorCraftingApp.svelte -->
<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import type {LocalizationService} from "../common/LocalizationService";
    import type {FabricateAPI} from "../../scripts/api/FabricateAPI";
    import type {ActorDetails} from "./ActorDetails";
    import {PendingActorDetails} from "./ActorDetails";
    import {onMount, setContext} from "svelte";
    import eventBus from "../common/EventBus";
    import type {CraftingAssessment} from "./CraftingAssessment";
    import {type CraftingProcess, DefaultCraftingProcess, NoCraftingProcess} from "./CraftingProcess";
    import {NoSalvageProcess, type SalvageProcess} from "./SalvageProcess";
    import type {SalvageAssessment} from "./SalvageAssessment";
    import ActorCraftingAppHeader from "./ActorCraftingAppHeader.svelte";
    import RecipeCraftingProcess from "./RecipeCraftingProcess.svelte";
    import ComponentSalvageProcess from "./ComponentSalvageProcess.svelte";
    import ActorInventoryBrowser from "./ActorInventoryBrowser.svelte";
    import {ComponentsStore} from "./ComponentsStore";
    import {key} from "./ActorCraftingAppManager";
    import {EssencesStore} from "./EssencesStore";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

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

    let batchSize: number = 1;
    let targetActorDetails: ActorDetails = new PendingActorDetails({id: targetActorId})
    let sourceActorDetails: ActorDetails = new PendingActorDetails({id: sourceActorId ?? targetActorId});
    let craftingProcess: CraftingProcess = new NoCraftingProcess();
    let salvageProcess: SalvageProcess = new NoSalvageProcess();
    let craftingAssessments: CraftingAssessment[] = [];
    let salvageAssessments: SalvageAssessment[] = [];

    const componentsById = new ComponentsStore({ fabricateAPI });
    const essencesById = new EssencesStore({ fabricateAPI, components: componentsById });
    setContext(key, { componentsById, essencesById });

    /*
     * ===========================================================================
     * Component member functions
     * ===========================================================================
     */

    async function prepareRecipes() {
        craftingAssessments = await fabricateAPI.crafting.assessCrafting({
            targetActorId: targetActorDetails.id,
            sourceActorId: sourceActorDetails.id ? sourceActorDetails.id : undefined
        });
    }

    async function prepareComponents() {
        salvageAssessments = await fabricateAPI.crafting.assessSalvage({
            actorId: sourceActorDetails.id,
        });
    }

    async function load() {
        await prepareRecipes();
        await prepareComponents();
        await componentsById.loadAll();
    }

    function startCraftingProcess(event: CustomEvent<CraftingAssessment>) {
        craftingProcess = new DefaultCraftingProcess({ recipeName: event.detail.recipeName });
    }

    async function startSalvageProcess(event: CustomEvent<SalvageAssessment>) {
        salvageProcess = await fabricateAPI.crafting.getSalvageProcess({
            componentId: event.detail.componentId,
            actorId: sourceActorDetails.id
        });
    }

    async function handleSourceActorChanged(event: CustomEvent<ActorDetails>) {
        sourceActorDetails = event.detail;
        await load();
        if (salvageProcess.isReady) {
            salvageProcess = await fabricateAPI.crafting.getSalvageProcess({
                componentId: salvageProcess.componentId,
                actorId: sourceActorDetails.id
            });
        }
    }

    async function salvageComponent(event: CustomEvent<SalvageProcess>) {
        const salvageResult = await fabricateAPI.crafting.salvageComponent({
            sourceActorId: sourceActorDetails.id,
            targetActorId: targetActorDetails.id,
            componentId: event.detail.componentId,
            salvageOptionId: event.detail.selectedOption.id,
            batchSize: batchSize < event.detail.ownedQuantity ? batchSize : event.detail.ownedQuantity
        });
        await load();
        if (salvageResult.remaining.isEmpty()) {
            salvageProcess = new NoSalvageProcess();
            return;
        }
        salvageProcess = await fabricateAPI.crafting.getSalvageProcess({
            componentId: event.detail.componentId,
            actorId: sourceActorDetails.id
        });
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.shiftKey) {
            batchSize = 5;
        }
    }

    function onKeyUp(event: KeyboardEvent) {
        if (!event.shiftKey) {
            batchSize = 1;
        }
    }

    function handleOwnedItemChanged(event: CustomEvent<{item: any, sourceId: string, actor:Actor}>) {
        console.log("reload", event.detail);
        if (event.detail.actor.id === sourceActorDetails.id) {
            load();
        }
    }

    onMount(load);

</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<div class="flex flex-col w-full h-full"
     use:eventBus={["itemUpdated", "itemCreated", "itemDeleted"]}
     on:itemUpdated={handleOwnedItemChanged}
     on:itemCreated={handleOwnedItemChanged}
     on:itemDeleted={handleOwnedItemChanged}>
    <ActorCraftingAppHeader localization={localization}
                            targetActorDetails={targetActorDetails}
                            sourceActorDetails={sourceActorDetails}
                            on:sourceActorChanged={handleSourceActorChanged} />
    {#if craftingProcess.isReady}
        <RecipeCraftingProcess localization={localization}
                               bind:craftingProcess={craftingProcess} />
    {:else if salvageProcess.isReady}
        <ComponentSalvageProcess localization={localization}
                                 bind:salvageProcess={salvageProcess}
                                 on:salvageComponent={salvageComponent}
                                 batchSize={batchSize}/>
    {:else}
        <ActorInventoryBrowser localization={localization}
                               bind:craftingAssessments={craftingAssessments}
                               bind:salvageAssessments={salvageAssessments}
                               on:startCraftingProcess={startCraftingProcess}
                               on:startSalvageProcess={startSalvageProcess} />
    {/if}
</div>