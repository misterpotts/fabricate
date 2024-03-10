<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {AppBar} from "@skeletonlabs/skeleton";
    import {NoCraftingProcess, type CraftingProcess} from "./CraftingProcess";
    import type {LocalizationService} from "../common/LocalizationService";
    import {createEventDispatcher} from "svelte";
    import {Requirement} from "../../scripts/crafting/recipe/Requirement";
    import type {Option} from "../../scripts/common/Options";

    /*
     * ===========================================================================
     * Public component properties
     * ===========================================================================
     */

    export let localization: LocalizationService;
    export let craftingProcess: CraftingProcess = new NoCraftingProcess();

    /*
     * ===========================================================================
     * Private component properties
     * ===========================================================================
     */

    const dispatch = createEventDispatcher();

    let selectedRequirementOption: Option<Requirement> = craftingProcess.selectedRequirementOption;
    $: {
        selectedRequirementOption = craftingProcess.selectedRequirementOption;
    }
    $: requiredEssences = selectedRequirementOption.value.essences;
    $: requiredCatalysts = selectedRequirementOption.value.catalysts;
    $: requiredIngredients = selectedRequirementOption.value.ingredients;
    $: requirementOptionName = selectedRequirementOption.name;

    /*
     * ===========================================================================
     * Private component functions
     * ===========================================================================
     */

    function clearCraftingProcess() {
        craftingProcess = new NoCraftingProcess();
    }

</script>

<AppBar background="bg-surface-700 text-white">
    <svelte:fragment slot="lead">
        <i class="fa-solid fa-circle-arrow-left text-xl text-primary-500 cursor-pointer" on:click={clearCraftingProcess}></i>
    </svelte:fragment>
    <h2 class="text-lg">Crafting {craftingProcess.recipeName}</h2>
</AppBar>