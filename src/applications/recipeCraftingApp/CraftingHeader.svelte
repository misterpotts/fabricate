<script lang="ts">
    import Properties from "../../scripts/Properties";
    import { createEventDispatcher } from 'svelte'
    import { getContext } from 'svelte';
    import { localizationKey } from "../common/LocalizationService";

    const localizationPath = `${Properties.module.id}.RecipeCraftingApp.header`;

    const dispatch = createEventDispatcher();

    export let recipe;
    const { localization } = getContext(localizationKey);

    function craftRecipe(event) {
        const skipDialog = event.shiftKey;
        dispatch('craftRecipe', {
            skipDialog
        });
    }
</script>

<div class="fab-recipe-crafting-header fab-row">
    <img src={recipe.imageUrl}>
    <h2>{recipe.name}</h2>
    <button class="fab-recipe-crafting-btn" on:click={(e) => craftRecipe(e)}><i class="fa-solid fa-recycle"></i> {localization.localize(`${localizationPath}.buttons.craft`)}</button>
</div>