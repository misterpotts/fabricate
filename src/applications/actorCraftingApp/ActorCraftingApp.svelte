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
    import {onMount} from "svelte";
    import type {CraftingAssessment} from "./CraftingAssessment";
    import {type CraftingProcess, DefaultCraftingProcess, NoCraftingProcess} from "./CraftingProcess";
    import {NoSalvageProcess, type SalvageProcess} from "./SalvageProcess";
    import type {SalvageAssessment} from "./SalvageAssessment";
    import {DefaultSalvageProcess} from "./SalvageProcess.js";
    import ActorCraftingAppHeader from "./ActorCraftingAppHeader.svelte";
    import RecipeCraftingProcess from "./RecipeCraftingProcess.svelte";
    import ComponentSalvageProcess from "./ComponentSalvageProcess.svelte";
    import ActorInventoryBrowser from "./ActorInventoryBrowser.svelte";

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

    let targetActorDetails: ActorDetails = new PendingActorDetails({id: targetActorId})
    let sourceActorDetails: ActorDetails = new PendingActorDetails({id: sourceActorId ?? targetActorId});
    let craftingProcess: CraftingProcess = new NoCraftingProcess();
    let salvageProcess: SalvageProcess = new NoSalvageProcess();
    let craftingAssessments: CraftingAssessment[] = [];
    let salvageAssessments: SalvageAssessment[] = [];

    /*
     * ===========================================================================
     * Component member functions
     * ===========================================================================
     */

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

    async function load() {
        await prepareRecipes();
        await prepareComponents();
    }

    function startCraftingProcess(event: CustomEvent<CraftingAssessment>) {
        craftingProcess = new DefaultCraftingProcess({ recipeName: event.detail.recipeName });
    }

    function startSalvageProcess(event: CustomEvent<SalvageAssessment>) {
        salvageProcess = new DefaultSalvageProcess({ componentName: event.detail.componentName });
    }

    async function handleSourceActorChanged(event: CustomEvent<ActorDetails>) {
        sourceActorDetails = event.detail;
        await load();
    }

    onMount(load);

</script>

<div class="flex flex-col w-full h-full">
    <ActorCraftingAppHeader localization={localization}
                            targetActorDetails={targetActorDetails}
                            sourceActorDetails={sourceActorDetails}
                            on:sourceActorChanged={handleSourceActorChanged} />
    {#if craftingProcess.isReady}
        <RecipeCraftingProcess localization={localization}
                               bind:craftingProcess={craftingProcess} />
    {:else if salvageProcess.isReady}
        <ComponentSalvageProcess localization={localization}
                                 bind:salvageProcess={salvageProcess} />
    {:else}
        <ActorInventoryBrowser localization={localization}
                               bind:craftingAssessments={craftingAssessments}
                               bind:salvageAssessments={salvageAssessments}
                               on:startCraftingProcess={startCraftingProcess}
                               on:startSalvageProcess={startSalvageProcess} />
    {/if}
</div>