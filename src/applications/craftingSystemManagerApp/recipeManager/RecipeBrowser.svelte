<script lang="ts">
    import Properties from "../../../scripts/Properties";
    import {getContext} from "svelte";
    import {key} from "../CraftingSystemManagerApp";
    import {RecipeSearchStore} from "../../stores/RecipeSearchStore";
    import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes`;
    const {
        localization,
        recipes,
        selectedRecipe,
        selectedCraftingSystem,
        recipeEditor
    } = getContext(key);

    const recipeSearchResults = new RecipeSearchStore({availableRecipes: recipes});
    const searchTerms = recipeSearchResults.searchTerms;

    async function importRecipe(event) {
        await recipeEditor.importRecipe(event, $selectedCraftingSystem);
    }

    function clearSearch() {
        recipeSearchResults.clear();
    }

    function selectRecipe(recipe) {
        $selectedRecipe = recipe;
    }

    async function deleteRecipe(event, recipe) {
        await recipeEditor.deleteRecipe(event, recipe, $selectedCraftingSystem);
    }

    async function disableRecipe(recipe) {
        recipe.isDisabled = true;
        await recipeEditor.saveRecipe(recipe, $selectedCraftingSystem);
        const message = localization.format(
            `${localizationPath}.recipe.disabled`,
            {
                recipeName: recipe.name
            }
        );
        ui.notifications.info(message);
    }

    async function enableRecipe(recipe) {
        recipe.isDisabled = false;
        await recipeEditor.saveRecipe(recipe, $selectedCraftingSystem);
        const message = localization.format(
            `${localizationPath}.recipe.enabled`,
            {
                recipeName: recipe.name
            }
        );
        ui.notifications.info(message);
    }

    function toggleRecipeDisabled(recipe) {
        return recipe.isDisabled ? enableRecipe(recipe) : disableRecipe(recipe);
    }

    async function duplicateRecipe(recipe) {
        await recipeEditor.duplicateRecipe(recipe, $selectedCraftingSystem);
    }

    async function openItemSheet(recipe) {
        const document = await new DefaultDocumentManager().loadItemDataByDocumentUuid(recipe.itemUuid);
        await document.sourceDocument.sheet.render(true);
    }

</script>

{#if $selectedCraftingSystem}
<div class="fab-system-recipes fab-column">
    <div class="fab-hero-banner">
        <img src="{Properties.ui.banners.recipeEditor}" >
    </div>
    {#if !$selectedCraftingSystem.isEmbedded}
        <div class="fab-tab-header fab-row">
            <h2>{localization.format(`${localizationPath}.addNew`, { systemName: $selectedCraftingSystem?.details.name })}</h2>
        </div>
        <div class="fab-drop-zone fab-add-recipe" on:drop|preventDefault={importRecipe}>
            <i class="fa-solid fa-plus"></i>
        </div>
    {/if}
    <div class="fab-tab-header fab-row">
        <h2>{localization.format(`${localizationPath}.search.title`, { systemName: $selectedCraftingSystem?.details.name })}</h2>
    </div>
    <div class="fab-row fab-columns fab-recipe-search">
        <div class="fab-column fab-row fab-search fab-recipe-name">
            <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.search.name`)}</p>
            <input type="text" bind:value={$searchTerms.name} />
            <button class="clear-search" data-tooltip={localization.localize(`${localizationPath}.search.clear`)} on:click={clearSearch}><i class="fa-regular fa-circle-xmark"></i></button>
        </div>
        <div class="fab-column fab-row fab-req-essences">
            <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.search.requiresEssences`)}</p>
            <input type="checkbox" bind:checked={$searchTerms.requiresEssences} />
        </div>
        <div class="fab-column fab-row fab-req-ingredients">
            <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.search.requiresNamedIngredients`)}</p>
            <input type="checkbox" bind:checked={$searchTerms.requiresNamedIngredients} />
        </div>
    </div>
    {#if $recipes.length > 0}
        <div class="fab-row">
            <div class="fab-recipe-grid fab-grid-4">
                {#each $recipeSearchResults as recipe}
                    <div class="fab-recipe" class:fab-disabled={recipe.isDisabled} class:fab-error={recipe.hasErrors}>
                        {#await recipe.load()}
                            {:then nothing}
                                <div class="fab-recipe-name">
                                    <p>{recipe.name}</p>
                                </div>
                                <div class="fab-columns fab-recipe-preview">
                                    <div class="fab-column fab-recipe-image" data-tooltip="{localization.localizeAll(`${localizationPath}.recipe.errors`, recipe.errorCodes)}">
                                        <img src={recipe.imageUrl} alt={recipe.name} />
                                    </div>
                                    {#if !$selectedCraftingSystem.isEmbedded}
                                        <div class="fab-column fab-recipe-editor-buttons">
                                            <button class="fab-edit-recipe" on:click|preventDefault={selectRecipe(recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.edit`)}"><i class="fa-solid fa-file-pen"></i></button>
                                            <button class="fab-edit-recipe" on:click|preventDefault={event => deleteRecipe(event, recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.delete`)}"><i class="fa-solid fa-trash fa-fw"></i></button>
                                            <button class="fab-edit-recipe" on:click|preventDefault={toggleRecipeDisabled(recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.disable`)}"><i class="fa-solid fa-ban"></i></button>
                                            <button class="fab-edit-recipe" on:click|preventDefault={duplicateRecipe(recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.duplicate`)}"><i class="fa-solid fa-paste fa-fw"></i></button>
                                        </div>
                                    {/if}
                                </div>
                            {:catch error}
                            <div class="fab-recipe-name">
                                <p>{recipe.name}</p>
                                <i class="fa-solid fa-circle-exclamation"></i>
                            </div>
                            <div class="fab-columns fab-recipe-preview">
                                <div class="fab-column fab-recipe-image" data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.openSheet`)}" on:click={openItemSheet(recipe)}>
                                    <img src={recipe.imageUrl} alt={recipe.name} />
                                </div>
                                {#if !$selectedCraftingSystem.isEmbedded}
                                    <div class="fab-column fab-recipe-editor-buttons">
                                        <button class="fab-edit-recipe" on:click|preventDefault={selectRecipe(recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.edit`)}"><i class="fa-solid fa-file-pen"></i></button>
                                        <button class="fab-edit-recipe" on:click|preventDefault={event => deleteRecipe(event, recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.delete`)}"><i class="fa-solid fa-trash fa-fw"></i></button>
                                        <button class="fab-edit-recipe" on:click|preventDefault={toggleRecipeDisabled(recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.disable`)}"><i class="fa-solid fa-ban"></i></button>
                                        <button class="fab-edit-recipe" on:click|preventDefault={duplicateRecipe(recipe)} data-tooltip="{localization.localize(`${localizationPath}.recipe.buttons.duplicate`)}"><i class="fa-solid fa-paste fa-fw"></i></button>
                                    </div>
                                {/if}
                            </div>
                        {/await}
                    </div>
                {/each}
            </div>
        </div>
        {#if $recipeSearchResults.length === 0}
            <div class="fab-no-search-results"><p>{localization.localize(`${localizationPath}.search.noMatches`)}</p></div>
        {/if}
    {:else}
        <div class="fab-no-recipes">
            <p>{localization.localize(`${localizationPath}.noneFound`)}</p>
            {#if !$selectedCraftingSystem.isEmbedded}<p>{localization.localize(`${localizationPath}.create`)}</p>{/if}
        </div>
    {/if}
</div>
{/if}