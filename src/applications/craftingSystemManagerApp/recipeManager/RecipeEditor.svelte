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
    import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
    import {Unit} from "../../../scripts/common/Unit";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes`;
    const {
        localization,
        recipes,
        selectedRecipe,
        selectedCraftingSystem,
        essences,
        components,
        recipeEditor,
        craftingComponentEditor
    } = getContext(key);

    const componentSearchResults = new ComponentSearchStore({ components });
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

    async function addRequirementOption(event, addAsCatalyst) {
        if (addAsCatalyst) {
            await recipeEditor.addRequirementOptionComponentAsCatalyst(event, $selectedRecipe);
        } else {
            await recipeEditor.addRequirementOptionComponentAsIngredient(event, $selectedRecipe);
        }
        if ($selectedRecipe.requirementOptions.all.length > 1) {
            selectPreviousTab();
        }
        recipeUpdated($selectedRecipe);
    }

    async function incrementEssence(essence) {
        $selectedRecipe.essences = $selectedRecipe.essences.add(new Unit(essence, 1));
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
    }

    async function decrementEssence(essence) {
        $selectedRecipe.essences = $selectedRecipe.essences.minus(new Unit(essence, 1));
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
    }

    async function deleteRequirementOption(optionToDelete) {
        await recipeEditor.deleteRequirementOption($selectedRecipe, optionToDelete.id);
        recipeUpdated($selectedRecipe);
    }

    async function addComponentToIngredientOption(event, ingredientOption, asCatalyst) {
        const dropEventParser = new DropEventParser({
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $components
        });
        const dropData = await dropEventParser.parse(event);
        if (dropData.hasCraftingComponent) {
            await addExistingComponentToIngredientOption(ingredientOption, dropData.component, asCatalyst);
            recipeUpdated($selectedRecipe);
            return;
        }
        if (dropData.hasItemData) {
            await importNewComponent(dropData.itemData, ingredientOption, asCatalyst);
            recipeUpdated($selectedRecipe);
            return;
        }
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
        if (asCatalyst) {
            ingredientOption.subtractCatalyst(component);
        } else {
            ingredientOption.subtractIngredient(component);
        }
        if (ingredientOption.isEmpty) {
            return deleteRequirementOption(ingredientOption);
        }
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        recipeUpdated($selectedRecipe);
    }

    async function incrementIngredientOptionComponent(ingredientOption, component, event, asCatalyst) {
        if (event && event.shiftKey) {
            return decrementIngredientOptionComponent(ingredientOption, component, asCatalyst);
        }
        if (asCatalyst) {
            ingredientOption.addCatalyst(component);
        } else {
            ingredientOption.addIngredient(component);
        }
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        recipeUpdated($selectedRecipe);
    }

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        }, 1000);
    }

    onDestroy(() => {
        clearTimeout(scheduledSave);
    });

    async function deleteResultOption(optionToDelete) {
        $selectedRecipe.deleteResultOptionByName(optionToDelete.name);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        recipeUpdated($selectedRecipe);
    }

    async function addComponentToResultOption(event, resultOption) {
        const dropEventParser = new DropEventParser({
            strict: true,
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $components
        });
        const component = (await dropEventParser.parse(event)).component;
        resultOption.add(component);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        recipeUpdated($selectedRecipe);
    }

    async function incrementResultOptionComponent(resultOption, component, event) {
        if (event && event.shiftKey) {
            return decrementResultOptionComponent(resultOption, component);
        }
        resultOption.add(component);
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        recipeUpdated($selectedRecipe);
    }

    async function decrementResultOptionComponent(resultOption, component) {
        resultOption.subtract(component);
        if (resultOption.isEmpty) {
            return deleteResultOption(resultOption);
        }
        await recipeEditor.saveRecipe($selectedRecipe, $selectedCraftingSystem);
        recipeUpdated($selectedRecipe);
    }

    async function addResultOption(event) {
        await recipeEditor.addResultOption(event, $selectedRecipe, $selectedCraftingSystem);
        if ($selectedRecipe.resultOptions.length > 1) {
            selectPreviousTab();
        }
        recipeUpdated($selectedRecipe);
    }

    function dereferenceComponentCombination(componentReferenceCombination) {
        return componentReferenceCombination
            .map(componentReferenceUnit => new Unit(dereferenceComponent(componentReferenceUnit.element), componentReferenceUnit.quantity));
    }

    function dereferenceComponent(componentReference) {
        return $components.find(component => component.id === componentReference.id);
    }

    function dereferenceEssenceCombination(essenceReferenceCombination) {
        return essenceReferenceCombination
            .map(essenceReferenceUnit => new Unit(dereferenceEssence(essenceReferenceUnit.element), essenceReferenceUnit.quantity));
    }

    function dereferenceEssence(essenceReference) {
        return $essences.find(essence => essence.id === essenceReference.id);
    }

</script>

{#if $selectedRecipe}
    <div class="fab-recipe-editor fab-column">
        <div class="fab-hero-banner">
            <img src="{Properties.ui.banners.recipeEditor}" alt="A crafting recipe book">
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
                                        {#each $selectedRecipe.requirementOptions.all as ingredientOption}
                                            <Tab>{ingredientOption.name}</Tab>
                                        {/each}
                                        <Tab><i class="fa-regular fa-square-plus"></i> {localization.localize(`${localizationPath}.recipe.labels.newIngredientOption`)}</Tab>
                                    </TabList>

                                    {#each $selectedRecipe.requirementOptions.all as requirementOption}
                                        <TabPanel class="fab-columns">
                                            <div class="fab-column">
                                                <div class="fab-option-controls fab-row">
                                                    <div class="fab-option-name">
                                                        <p>{localization.localize(`${localizationPath}.recipe.labels.ingredientOptionName`)}</p>
                                                        <div class="fab-editable" contenteditable="true" bind:textContent={requirementOption.name} on:input={scheduleSave}>{requirementOption.name}</div>
                                                    </div>
                                                    <button class="fab-delete-ingredient-opt" on:click={deleteRequirementOption(requirementOption)}><i class="fa-solid fa-trash fa-fw"></i> {localization.localize(`${localizationPath}.recipe.buttons.deleteIngredientOption`)}</button>
                                                </div>
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.ingredientsHeading`)}</h4>
                                                {#if requirementOption.requiresIngredients}
                                                <div class="fab-component-grid fab-grid-4 fab-scrollable fab-ingredient-option-actual" on:drop={(e) => addComponentToIngredientOption(e, requirementOption, false)}>
                                                    {#each requirementOption.ingredients.units as ingredientUnit}
                                                        <div class="fab-component" on:click={(e) => incrementIngredientOptionComponent(requirementOption, ingredientUnit.element, e, false)} on:auxclick={decrementIngredientOptionComponent(requirementOption, ingredientUnit.element, false)}>
                                                            <div class="fab-component-name">
                                                                <p>{truncate(ingredientUnit.element.name, 9)}</p>
                                                            </div>
                                                            <div class="fab-component-preview">
                                                                <div class="fab-component-image" data-tooltip={ingredientUnit.element.name}>
                                                                    <img src={ingredientUnit.element.imageUrl} alt={ingredientUnit.element.name} />
                                                                    {#if ingredientUnit.quantity > 1}
                                                                        <span class="fab-component-info fab-component-quantity">{ingredientUnit.quantity}</span>
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {/each}
                                                </div>
                                                {:else}
                                                    <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addComponentToIngredientOption(e, requirementOption, false)}>
                                                        <i class="fa-solid fa-plus"></i>
                                                    </div>
                                                {/if}
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.catalystsHeading`)}</h4>
                                                {#if requirementOption.requiresCatalysts}
                                                    <div class="fab-component-grid fab-grid-4 fab-scrollable fab-catalyst-option-actual" on:drop={(e) => addComponentToIngredientOption(e, requirementOption, true)}>
                                                        {#each requirementOption.catalysts.units as catalystUnit}
                                                            <div class="fab-component" on:click={(e) => incrementIngredientOptionComponent(requirementOption, catalystUnit.element, e, true)} on:auxclick={decrementIngredientOptionComponent(requirementOption, catalystUnit.element, true)}>
                                                                <div class="fab-component-name">
                                                                    <p>{truncate(catalystUnit.element.name, 9)}</p>
                                                                </div>
                                                                <div class="fab-component-preview">
                                                                    <div class="fab-component-image" data-tooltip={catalystUnit.element.name}>
                                                                        <img src={catalystUnit.element.imageUrl} alt={catalystUnit.element.name} />
                                                                        {#if catalystUnit.quantity > 1}
                                                                            <span class="fab-component-info fab-component-quantity">{catalystUnit.quantity}</span>
                                                                        {/if}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                {:else}
                                                    <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addComponentToIngredientOption(e, requirementOption, true)}>
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
                                            <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addRequirementOption(e, false)}>
                                                <i class="fa-solid fa-plus"></i>
                                            </div>
                                            <div class="fab-row">
                                                <h4 class="fab-section-title">{localization.localize(`${localizationPath}.recipe.labels.catalystsHeading`)}</h4>
                                            </div>
                                            <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addRequirementOption(e, true)}>
                                                <i class="fa-solid fa-plus"></i>
                                            </div>
                                        </div>
                                    </TabPanel>

                                </Tabs>
                            {:else}
                                <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addRequirementOption(e, false)}>
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                                <div class="fab-row">
                                    <h3>{localization.localize(`${localizationPath}.recipe.labels.catalystsHeading`)}</h3>
                                </div>
                                <div class="fab-no-ingredients fab-drop-zone fab-row" on:drop|preventDefault={(e) => addRequirementOption(e, true)}>
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
                                            {#await component.load()}
                                                {:then nothing}
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
                                                {:catch error}
                                            {/await}
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
                                                <button class="fab-increment-essence" on:click={incrementEssence(essenceUnit.element)}><i class="fa-solid fa-plus"></i></button>
                                                <div class="fab-essence-amount">
                                                    <span class="fab-essence-quantity">
                                                        {essenceUnit.quantity}
                                                    </span>
                                                    <span class="fab-essence-icon">
                                                        <i class="{essenceUnit.element.iconCode}"></i>
                                                    </span>
                                                    <span class="fab-essence-name">
                                                        {essenceUnit.element.name}
                                                    </span>
                                                </div>
                                                <button class="fab-decrement-essence" on:click={decrementEssence(essenceUnit.element)}><i class="fa-solid fa-minus"></i></button>
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
                                                        <div class="fab-component" on:click={(e) => incrementResultOptionComponent(resultOption, resultUnit.element, e)} on:auxclick={decrementResultOptionComponent(resultOption, resultUnit.element)}>
                                                            <div class="fab-component-name">
                                                                <p>{truncate(resultUnit.element.name, 9)}</p>
                                                            </div>
                                                            <div class="fab-component-preview">
                                                                <div class="fab-component-image" data-tooltip={resultUnit.element.name}>
                                                                    <img src={resultUnit.element.imageUrl} alt={resultUnit.element.name} />
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