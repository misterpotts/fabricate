<script lang="ts">
    import Properties from "../../../scripts/Properties";
    import {getContext} from "svelte";
    import {key} from "../CraftingSystemManagerApp";
    import Tabs from "../../common/Tabs.svelte";
    import TabList from "../../common/TabList.svelte";
    import Tab from "../../common/Tab.svelte";
    import TabPanel from "../../common/TabPanel.svelte";
    import truncate from "../../common/Truncate";
    import {ComponentSearchStore} from "../../stores/ComponentSearchStore";
    import {DropEventParser} from "../../common/DropEventParser";
    import {recipeUpdated} from "../../common/EventBus";
    import {RecipeEssenceStore} from "../../stores/RecipeEssenceStore";
    import {Unit} from "../../../scripts/common/Combination";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes`;
    const {
        localization,
        recipes,
        selectedRecipe,
        selectedCraftingSystem,
        craftingComponents,
        loading,
        recipeEditor
    } = getContext(key);

    const componentSearchResults = new ComponentSearchStore({ availableComponents: craftingComponents });
    const searchTerms = componentSearchResults.searchTerms;
    const recipeEssences = new RecipeEssenceStore({selectedCraftingSystem, selectedRecipe});
    let selectPreviousTab;

    function clearSearch() {
        componentSearchResults.clear();
    }

    function dragStart(event, component) {
        event.dataTransfer.setData('application/json', DropEventParser.serialiseComponentData(component));
    }

    function deselectRecipe() {
        $selectedRecipe = null;
    }

    function replaceItem(event) {
        recipeEditor.replaceItem(event, $selectedCraftingSystem, $selectedRecipe);
    }

    async function addIngredientOption(event, addAsCatalyst) {
        $loading = true;
        await recipeEditor.addIngredientOption(event, addAsCatalyst, $selectedRecipe, $selectedCraftingSystem);
        if ($selectedRecipe.ingredientOptions.length > 1) {
            selectPreviousTab();
        }
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function incrementEssence(essence) {
        $loading = true;
        $selectedRecipe.essences = $selectedRecipe.essences.add(new Unit(essence, 1));
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
    }

    async function decrementEssence(essence) {
        $loading = true;
        $selectedRecipe.essences = $selectedRecipe.essences.minus(new Unit(essence, 1));
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
    }

</script>

{#if $selectedRecipe}
    <div class="fab-recipe-editor fab-column">
        <div class="fab-hero-banner">
            <img src="{Properties.ui.banners.recipeEditor}" >
            <div class="fab-buttons">
                <button class="fab-deselect-recipe" on:click={deselectRecipe}><i class="fa-solid fa-circle-chevron-left"></i> {localization.localize(`${localizationPath}.recipe.buttons.deselect`)}</button>
            </div>
        </div>
        <div class="fab-tab-header fab-row" class:fab-error={$selectedRecipe.hasErrors}>
            <img src="{$selectedRecipe.imageUrl}" width="48px" height="48px"  alt="{$selectedRecipe.name} icon"/>
            <h2 class="fab-recipe-name">{$selectedRecipe.name}</h2>
            <div class="fab-drop-zone fab-swap-item" on:drop|preventDefault={(e) => replaceItem(e)}>
                <i class="fa-solid fa-arrow-right-arrow-left"></i>
                {localization.localize(`${localizationPath}.recipe.labels.replaceItem`)}
            </div>
        </div>
        <Tabs>

            <TabList>
                <Tab>{localization.localize(`${localizationPath}.recipe.tabs.requirements`)}</Tab>
                <Tab>{localization.localize(`${localizationPath}.recipe.tabs.results`)}</Tab>
            </TabList>

            <TabPanel>
                <div class="fab-recipe-ingredients-editor">
                    <div class="fab-recipe-ingredients fab-columns">
                        <div class="fab-column">
                            <div class="fab-row">
                                <h3>{localization.localize(`${localizationPath}.recipe.labels.ingredientsHeading`)}</h3>
                            </div>
                            {#if $selectedRecipe.hasIngredients}
                                <Tabs bind:selectPreviousTab={selectPreviousTab}>

                                </Tabs>
                            {:else}
                                <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addIngredientOption(e, false)}>
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                                <div class="fab-row">
                                    <h3>{localization.localize(`${localizationPath}.recipe.labels.catalystsHeading`)}</h3>
                                </div>
                                <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addIngredientOption(e, true)}>
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            {/if}
                        </div>
                    </div>
                    <div class="fab-recipe-options fab-columns">
                        <div class="fab-column">
                            <div class="fab-row">
                                <h3>{localization.localize(`${localizationPath}.recipe.labels.availableComponentsHeading`)}</h3>
                            </div>
                            <div class="fab-row fab-search fab-component-search">
                                <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.search.name`)}: </p>
                                <input type="text" bind:value={$searchTerms.name} />
                                <button class="clear-search" data-tooltip={localization.localize(`${localizationPath}.search.clear`)} on:click={clearSearch}><i class="fa-regular fa-circle-xmark"></i></button>
                            </div>
                            <div class="fab-row">
                                {#if $componentSearchResults.length > 0}
                                    <div class="fab-component-grid fab-grid-4 fab-scrollable fab-component-source">
                                        {#each $componentSearchResults as component}
                                            <div class="fab-component" draggable="true" on:dragstart={event => dragStart(event, component)}>
                                                <div class="fab-component-name" draggable="false">
                                                    <p draggable="false">{truncate(component.name, 9)}</p>
                                                </div>
                                                <div class="fab-component-preview" draggable="false">
                                                    <div class="fab-component-image" data-tooltip={component.name} draggable="false">
                                                        <img src={component.imageUrl} alt={component.name} draggable="false" />
                                                    </div>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else if $searchTerms.name}
                                    <div class="fab-no-component-opts"><p>{localization.localize(`${localizationPath}.recipe.info.noMatchingComponents`)}</p></div>
                                {:else}
                                    <div class="fab-no-component-opts"><p>{localization.format(`${localizationPath}.recipe.info.noAvailableComponents`, { systemName: $selectedCraftingSystem.name, recipeName: $selectedRecipe.name })}</p></div>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="fab-columns" style="grid-column: 1/3">
                        <div class="fab-column">
                            <div class="fab-row">
                                <h3>{localization.localize(`${localizationPath}.recipe.labels.essencesHeading`)}</h3>
                            </div>
                            <div class="fab-row">
                                <div class="fab-recipe-essences">
                                    {#if $selectedCraftingSystem.hasEssences}
                                        {#each $recipeEssences as essenceUnit}
                                            <div class="fab-recipe-essence-adjustment">
                                                <button class="fab-increment-essence" on:click={incrementEssence(essenceUnit.part)}><i class="fa-solid fa-plus"></i></button>
                                                <div class="fab-essence-amount">
                                                    <span class="fab-essence-quantity">
                                                        {essenceUnit.quantity}
                                                    </span>
                                                    <span class="fab-essence-icon">
                                                        <i class="{essenceUnit.part.iconCode}"></i>
                                                    </span>
                                                    <span class="fab-essence-name">
                                                        {essenceUnit.part.name}
                                                    </span>
                                                </div>
                                                <button class="fab-decrement-essence" on:click={decrementEssence(essenceUnit.part)}><i class="fa-solid fa-minus"></i></button>
                                            </div>
                                        {/each}
                                    {:else}
                                        <div class="fab-no-essence-opts"><p>{localization.format(`${localizationPath}.recipe.info.noAvailableEssences`, { systemName: $selectedCraftingSystem.name, recipeName: selectedRecipe.name })}</p></div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <TabPanel>
                <div class="fab-recipe-results-editor">
                    <div class="fab-recipe-results fab-columns">
                        <div class="fab-column">
                            <div class="fab-row">
                                <h3>{localization.localize(`${localizationPath}.recipe.labels.resultsHeading`)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>

        </Tabs>

    </div>
{/if}