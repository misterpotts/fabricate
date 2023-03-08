<script lang="ts">
    import { key } from "../CraftingSystemManagerApp";
    import { getContext } from "svelte";

    const { selectedRecipe } = getContext(key);

</script>

{#if !$selectedRecipe}
    <RecipeBrowser />
{:else}
    <RecipeEditor />
{/if}

