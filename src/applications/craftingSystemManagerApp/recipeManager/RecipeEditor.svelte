<script lang="ts">
    import Properties from "../../../scripts/Properties";
    import {getContext, onDestroy} from "svelte";
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
    import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes`;
    const {
        localization,
        recipes,
        selectedRecipe,
        selectedCraftingSystem,
        craftingComponents,
        loading,
        recipeEditor,
        craftingComponentEditor
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

    function sortByName(option) {
        return option.sort((left, right) => left.name.localeCompare(right.name));
    }

    async function deleteIngredientOption(optionToDelete) {
        $loading = true;
        $selectedRecipe.deleteIngredientOptionByName(optionToDelete.name);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function addComponentToIngredientOption(event, ingredientOption, asCatalyst) {
        $loading = true;
        const dropEventParser = new DropEventParser({
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $craftingComponents
        });
        const dropData = await dropEventParser.parse(event);
        if (dropData.hasCraftingComponent) {
            await addExistingComponentToIngredientOption(ingredientOption, dropData.component, asCatalyst);
            $loading = false;
            recipeUpdated($selectedRecipe);
            return;
        }
        if (dropData.hasItemData) {
            await importNewComponent(dropData.itemData, ingredientOption, asCatalyst);
            $loading = false;
            recipeUpdated($selectedRecipe);
            return;
        }
        $loading = false;
        throw new Error("Something went wrong adding a component to an Ingredient option. ");
    }

    async function importNewComponent(itemData, ingredientOption, asCatalyst) {
        const doImport = await Dialog.confirm({
            title: localization.format(
                `${localizationPath}.prompts.importItemAsComponent.title`,
                {
                    componentName: itemData.name
                }
            ),
            content: localization.format(
                `${localizationPath}.prompts.importItemAsComponent.content`,
                {
                    componentName: itemData.name,
                    systemName: $selectedCraftingSystem.name
                }
            )
        });
        if (doImport) {
            const component = await craftingComponentEditor.createComponent(itemData, $selectedCraftingSystem);
            await addExistingComponentToIngredientOption(ingredientOption, component, asCatalyst);
        }
    }

    async function addExistingComponentToIngredientOption(ingredientOption, component, asCatalyst) {
        if (asCatalyst) {
            ingredientOption.addCatalyst(component);
        } else {
            ingredientOption.addIngredient(component);
        }
        $selectedRecipe.editIngredientOption(ingredientOption);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
    }

    async function decrementIngredientOptionComponent(ingredientOption, component, asCatalyst) {
        $loading = true;
        if (asCatalyst) {
            ingredientOption.subtractCatalyst(component);
        } else {
            ingredientOption.subtractIngredient(component);
        }
        if (ingredientOption.isEmpty) {
            return deleteIngredientOption(ingredientOption);
        }
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function incrementIngredientOptionComponent(ingredientOption, component, event, asCatalyst) {
        if (event && event.shiftKey) {
            return decrementIngredientOptionComponent(ingredientOption, component, asCatalyst);
        }
        $loading = true;
        if (asCatalyst) {
            ingredientOption.addCatalyst(component);
        } else {
            ingredientOption.addIngredient(component);
        }
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            $loading = true;
            await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
            $loading = false;
        }, 1000);
    }

    onDestroy(() => {
        clearTimeout(scheduledSave);
    });

    async function deleteResultOption(optionToDelete) {
        $loading = true;
        $selectedRecipe.deleteResultOptionByName(optionToDelete.name);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function addComponentToResultOption(event, resultOption) {
        $loading = true;
        const dropEventParser = new DropEventParser({
            strict: true,
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $craftingComponents
        });
        const component = (await dropEventParser.parse(event)).component;
        resultOption.add(component);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function incrementResultOptionComponent(resultOption, component, event) {
        if (event && event.shiftKey) {
            return decrementResultOptionComponent(resultOption, component);
        }
        $loading = true;
        resultOption.add(component);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function decrementResultOptionComponent(resultOption, component) {
        $loading = true;
        resultOption.subtract(component);
        if (resultOption.isEmpty) {
            return deleteResultOption(resultOption);
        }
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        $loading = false;
        recipeUpdated($selectedRecipe);
    }

    async function addResultOption(event) {
        $loading = true;
        await recipeEditor.addResultOption(event, $selectedRecipe, $selectedCraftingSystem);
        if ($selectedRecipe.resultOptions.length > 1) {
            selectPreviousTab();
        }
        $loading = false;
        recipeUpdated($selectedRecipe);
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
                                <h3>{localization.localize(`${localizationPath}.recipe.labels.requirementsHeading`)}</h3>
                            </div>
                            {#if $selectedRecipe.hasRequirements}
                                <Tabs bind:selectPreviousTab={selectPreviousTab}>
                                    <TabList>
                                        {#each $selectedRecipe.ingredientOptions as ingredientOption}
                                            <Tab>{ingredientOption.name}</Tab>
                                        {/each}
                                        <Tab><i class="fa-regular fa-square-plus"></i> {localization.localize(`${localizationPath}.recipe.labels.newIngredientOption`)}</Tab>
                                    </TabList>

                                    {#each $selectedRecipe.ingredientOptions as ingredientOption}
                                        <TabPanel class="fab-columns">
                                            <div class="fab-column">
                                                <div class="fab-option-controls fab-row">
                                                    <div class="fab-option-name">
                                                        <p>{localization.localize(`${localizationPath}.recipe.labels.ingredientOptionName`)}</p>
                                                        <div class="fab-editable" contenteditable="true" bind:textContent={ingredientOption.name} on:input={scheduleSave}>{ingredientOption.name}</div>
                                                    </div>
                                                    <button class="fab-delete-ingredient-opt" on:click={deleteIngredientOption(ingredientOption)}><i class="fa-solid fa-trash fa-fw"></i> {localization.localize(`${localizationPath}.recipe.buttons.deleteIngredientOption`)}</button>
                                                </div>
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.ingredientsHeading`)}</h4>
                                                {#if ingredientOption.requiresIngredients}
                                                <div class="fab-component-grid fab-grid-4 fab-scrollable fab-ingredient-option-actual" on:drop={(e) => addComponentToIngredientOption(e, ingredientOption, false)}>
                                                    {#each ingredientOption.ingredients.units as ingredientUnit}
                                                        <div class="fab-component" on:click={(e) => incrementIngredientOptionComponent(ingredientOption, ingredientUnit.part, e, false)} on:auxclick={decrementIngredientOptionComponent(ingredientOption, ingredientUnit.part, false)}>
                                                            <div class="fab-component-name">
                                                                <p>{truncate(ingredientUnit.part.name, 9)}</p>
                                                            </div>
                                                            <div class="fab-component-preview">
                                                                <div class="fab-component-image" data-tooltip={ingredientUnit.part.name}>
                                                                    <img src={ingredientUnit.part.imageUrl} alt={ingredientUnit.part.name} />
                                                                    {#if ingredientUnit.quantity > 1}
                                                                        <span class="fab-component-info fab-component-quantity">{ingredientUnit.quantity}</span>
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {/each}
                                                </div>
                                                {:else}
                                                    <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addComponentToIngredientOption(e, ingredientOption, false)}>
                                                        <i class="fa-solid fa-plus"></i>
                                                    </div>
                                                {/if}
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.catalystsHeading`)}</h4>
                                                {#if ingredientOption.requiresCatalysts}
                                                    <div class="fab-component-grid fab-grid-4 fab-scrollable fab-catalyst-option-actual" on:drop={(e) => addComponentToIngredientOption(e, ingredientOption, true)}>
                                                        {#each ingredientOption.catalysts.units as catalystUnit}
                                                            <div class="fab-component" on:click={(e) => incrementIngredientOptionComponent(ingredientOption, catalystUnit.part, e, true)} on:auxclick={decrementIngredientOptionComponent(ingredientOption, catalystUnit.part, true)}>
                                                                <div class="fab-component-name">
                                                                    <p>{truncate(catalystUnit.part.name, 9)}</p>
                                                                </div>
                                                                <div class="fab-component-preview">
                                                                    <div class="fab-component-image" data-tooltip={catalystUnit.part.name}>
                                                                        <img src={catalystUnit.part.imageUrl} alt={catalystUnit.part.name} />
                                                                        {#if catalystUnit.quantity > 1}
                                                                            <span class="fab-component-info fab-component-quantity">{catalystUnit.quantity}</span>
                                                                        {/if}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                {:else}
                                                    <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addComponentToIngredientOption(e, ingredientOption, true)}>
                                                        <i class="fa-solid fa-plus"></i>
                                                    </div>
                                                {/if}
                                            </div>
                                        </TabPanel>
                                    {/each}

                                    <TabPanel class="fab-columns">
                                        <div class="fab-column">
                                            <div class="fab-row">
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.ingredientsHeading`)}</h4>
                                            </div>
                                            <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addIngredientOption(e, false)}>
                                                <i class="fa-solid fa-plus"></i>
                                            </div>
                                            <div class="fab-row">
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.catalystsHeading`)}</h4>
                                            </div>
                                            <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addIngredientOption(e, true)}>
                                                <i class="fa-solid fa-plus"></i>
                                            </div>
                                        </div>
                                    </TabPanel>

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
                            {#if $selectedRecipe.hasResults}
                                <Tabs bind:selectPreviousTab={selectPreviousTab}>
                                    <TabList>
                                        {#each $selectedRecipe.resultOptions as resultOption}
                                            <Tab>{resultOption.name}</Tab>
                                        {/each}
                                        <Tab><i class="fa-regular fa-square-plus"></i> {localization.localize(`${localizationPath}.recipe.labels.newResultOption`)}</Tab>
                                    </TabList>
                                    {#each $selectedRecipe.resultOptions as resultOption}
                                        <TabPanel class="fab-columns">
                                            <div class="fab-column">
                                                <div class="fab-option-controls fab-row">
                                                    <div class="fab-option-name">
                                                        <p>{localization.localize(`${localizationPath}.recipe.labels.resultOptionName`)}</p>
                                                        <div class="fab-editable" contenteditable="true" bind:textContent={resultOption.name} on:input={scheduleSave}>{resultOption.name}</div>
                                                    </div>
                                                    <button class="fab-delete-result-opt" on:click={deleteResultOption(resultOption)}><i class="fa-solid fa-trash fa-fw"></i> {localization.localize(`${localizationPath}.recipe.buttons.deleteResultOption`)}</button>
                                                </div>
                                                <div class="fab-component-grid fab-grid-4 fab-scrollable fab-result-option-actual" on:drop={(e) => addComponentToResultOption(e, resultOption)}>
                                                    {#each resultOption.results.units as resultUnit}
                                                        <div class="fab-component" on:click={(e) => incrementResultOptionComponent(resultOption, resultUnit.part, e)} on:auxclick={decrementResultOptionComponent(resultOption, resultUnit.part)}>
                                                            <div class="fab-component-name">
                                                                <p>{truncate(resultUnit.part.name, 9)}</p>
                                                            </div>
                                                            <div class="fab-component-preview">
                                                                <div class="fab-component-image" data-tooltip={resultUnit.part.name}>
                                                                    <img src={resultUnit.part.imageUrl} alt={resultUnit.part.name} />
                                                                    {#if resultUnit.quantity > 1}
                                                                        <span class="fab-component-info fab-component-quantity">{resultUnit.quantity}</span>
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {/each}
                                                </div>
                                            </div>
                                        </TabPanel>
                                    {/each}
                                    <TabPanel>
                                        <div class="fab-drop-zone fab-new-result-opt fab-row" on:drop|preventDefault={(e) => addResultOption(e)}>
                                            <i class="fa-solid fa-plus"></i>
                                        </div>
                                    </TabPanel>
                                </Tabs>
                            {:else}
                                <div class="fab-no-result-opts fab-drop-zone fab-row" on:drop|preventDefault={(e) => addResultOption(e)}>
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
                </div>
            </TabPanel>

        </Tabs>

    </div>
{/if}