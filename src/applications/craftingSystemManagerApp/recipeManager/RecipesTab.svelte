<script lang="ts">
    import { key } from "../CraftingSystemManagerApp";
    import { getContext } from "svelte";
    import RecipeEditor from "./RecipeEditor.svelte";
    import RecipeBrowser from "./RecipeBrowser.svelte";

    const { selectedRecipe } = getContext(key);

</script>

{#if !$selectedRecipe}
    <RecipeBrowser />
{:else}
    <RecipeEditor />
{/if}

