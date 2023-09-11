<script lang="ts">
    import {key} from "../CraftingSystemManagerApp";
    import Properties from "../../../scripts/Properties.js";
    import {DropEventParser} from "../../common/DropEventParser";
    import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
    import truncate from "../../common/Truncate";
    import {Tab, Tabs} from "../../common/FabricateTabs.js";
    import TabList from "../../common/TabList.svelte";
    import TabPanel from "../../common/TabPanel.svelte";
    import {componentUpdated, recipeUpdated} from "../../common/EventBus";
    import {getContext, onDestroy} from "svelte";
    import {SalvageSearchStore} from "../../stores/SalvageSearchStore";
    import {ComponentEssenceStore} from "../../stores/ComponentEssenceStore";
    import {DefaultUnit} from "../../../scripts/common/Unit";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.components`;
    let selectSalvageTab;

    const {
        localization,
        selectedComponent,
        components,
        selectedCraftingSystem,
        componentEditor,
        essences
    } = getContext(key);

    const salvageSearchResults = new SalvageSearchStore({ selectedComponent, components });
    const searchTerms = salvageSearchResults.searchTerms;
    const componentEssences = new ComponentEssenceStore({ allEssences: essences, selectedComponent });

    function deselectComponent() {
        $selectedComponent = null;
    }

    function selectLastSalvageOption() {
        if ($selectedComponent.salvageOptions.all.length > 1) {
            selectSalvageTab(length => length - 1);
        }
    }

    async function replaceItem(event) {
        await componentEditor.replaceItem(event,$selectedComponent);
    }
    
    async function incrementEssence(essence) {
        $selectedComponent.essences = $selectedComponent.essences.addUnit(new DefaultUnit(essence.toReference(), 1));
        await componentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
    }

    async function decrementEssence(essence) {
        $selectedComponent.essences = $selectedComponent.essences.subtractUnit(new DefaultUnit(essence.toReference(), 1));
        await componentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
    }

    function clearSearch() {
        salvageSearchResults.clear();
    }

    async function addSalvageOption(event, addAsCatalyst = false) {
        if (addAsCatalyst) {
            await componentEditor.addSalvageOptionComponentAsCatalyst(event, $selectedComponent);
        } else {
            await componentEditor.addSalvageOptionComponentAsSalvageResult(event, $selectedComponent);
        }
        selectLastSalvageOption();
        componentUpdated($selectedComponent);
    }
    
    function dragStart(event, component) {
        event.dataTransfer.setData('application/json', DropEventParser.serialiseComponentData(component));
    }

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            await componentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        }, 1000);
    }
    
    async function deleteSalvageOption(optionToDelete) {
        $selectedComponent.deleteSalvageOptionById(optionToDelete.id);
        await componentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        componentUpdated($selectedComponent);
    }

    async function addComponentToSalvageOption(event, salvageOption, addAsCatalyst = false) {
        const dropEventParser = new DropEventParser({
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $components
        });
        const dropData = await dropEventParser.parse(event);
        if (dropData.hasCraftingComponent) {
            await addExistingComponentToSalvageOption(salvageOption, dropData.component, addAsCatalyst);
            componentUpdated($selectedComponent);
            return;
        }
        if (dropData.hasItemData) {
            await importNewComponent(dropData.itemData, salvageOption, addAsCatalyst);
            componentUpdated($selectedComponent);
            return;
        }
        throw new Error("Something went wrong adding a component to an Ingredient option. ");
    }

    async function importNewComponent(itemData, salvageOption, addAsCatalyst) {
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
                    systemName: $selectedCraftingSystem.details.name
                }
            )
        });
        if (doImport) {
            const component = await componentEditor.createComponent(itemData, $selectedCraftingSystem);
            await addExistingComponentToSalvageOption(salvageOption, component, addAsCatalyst);
        }
    }

    async function addExistingComponentToSalvageOption(salvageOption, component, addAsCatalyst) {
        if (addAsCatalyst) {
            salvageOption.addCatalyst(component.id);
        } else {
            salvageOption.addResult(component.id);
        }
        $selectedComponent.setSalvageOption(salvageOption);
        await componentEditor.saveComponent($selectedComponent);
    }

    async function decrementSalvageOptionComponent(salvageOption, component, asCatalyst = false) {
        if (asCatalyst) {
            salvageOption.subtractCatalyst(component.id);
        } else {
            salvageOption.subtractResult(component.id);
        }
        if (salvageOption.isEmpty) {
            return deleteSalvageOption(salvageOption);
        }
        await componentEditor.saveComponent($selectedComponent);
        componentUpdated($selectedComponent);
    }

    async function incrementSalvageOptionComponent(salvageOption, component, event, asCatalyst = false) {
        if (event && event.shiftKey) {
            return decrementSalvageOptionComponent(salvageOption, component, asCatalyst);
        }
        if (asCatalyst) {
            salvageOption.addCatalyst(component.id);
        } else {
            salvageOption.addResult(component.id);
        }
        await componentEditor.saveComponent($selectedComponent);
        componentUpdated($selectedComponent);
    }

    function dereferenceComponentCombination(componentReferenceCombination) {
        return componentReferenceCombination
            .map(componentReferenceUnit => new DefaultUnit(dereferenceComponent(componentReferenceUnit.element), componentReferenceUnit.quantity));
    }

    function dereferenceComponent(componentReference) {
        return $components.find(component => component.id === componentReference.id);
    }

    onDestroy(() => {
        clearTimeout(scheduledSave);
    });
    
</script>

{#if $selectedComponent}
    <div class="fab-component-editor fab-column">
        <div class="fab-hero-banner fab-row">
            <img src="{Properties.ui.banners.componentEditor}" alt="Component editor banner">
            <div class="fab-buttons">
                <button class="fab-deselect-component" on:click={deselectComponent}><i class="fa-solid fa-circle-chevron-left"></i> {localization.localize(`${localizationPath}.component.buttons.deselect`)}</button>
            </div>
        </div>
        <div class="fab-tab-header fab-row" class:fab-error={$selectedComponent.hasErrors}>
            <img src="{$selectedComponent.imageUrl}" width="48px" height="48px"  alt="{$selectedComponent.name} icon"/>
            <h2 class="fab-component-name">{$selectedComponent.name}</h2>
            <div class="fab-drop-zone fab-swap-item" on:drop|preventDefault={(e) => replaceItem(e)}>
                <i class="fa-solid fa-arrow-right-arrow-left"></i>
                {localization.localize(`${localizationPath}.component.labels.replaceItem`)}
            </div>
        </div>
        <div class="fab-component-salvage-editor">
            <div class="fab-component-salvage fab-columns">
                <div class="fab-column">
                    <div class="fab-row">
                        <h3>{localization.localize(`${localizationPath}.component.labels.salvageHeading`)}</h3>
                    </div>
                    {#if $selectedComponent.isSalvageable}
                        <div class="fab-salvage-editor fab-row">
                            <Tabs bind:selectTabAtIndex={selectSalvageTab}>
                                <TabList>
                                    {#each $selectedComponent.salvageOptions.all as salvageOption}
                                        <Tab>{salvageOption.name}</Tab>
                                    {/each}
                                    <Tab><i class="fa-regular fa-square-plus"></i> {localization.localize(`${localizationPath}.component.labels.newSalvageOption`)}</Tab>
                                </TabList>
                                {#each $selectedComponent.salvageOptions.all as salvageOption}
                                    <TabPanel class="fab-columns">
                                        <div class="fab-column">
                                            <div class="fab-option-controls fab-row">
                                                <div class="fab-option-name">
                                                    <p>{localization.localize(`${localizationPath}.component.labels.salvageName`)}</p>
                                                    <div class="fab-editable" contenteditable="true" bind:textContent={salvageOption.name} on:input={scheduleSave}>{salvageOption.name}</div>
                                                </div>
                                                <button class="fab-delete-salvage-opt" on:click={deleteSalvageOption(salvageOption)}><i class="fa-solid fa-trash fa-fw"></i> {localization.localize(`${localizationPath}.component.buttons.deleteSalvageOption`)}</button>
                                            </div>
                                            <h4 class="fab-section-title">{localization.localize(`${localizationPath}.component.labels.salvageHeading`)}</h4>
                                            {#if salvageOption.hasResults}
                                                <div class="fab-component-grid fab-grid-4 fab-scrollable fab-salvage-option-actual" on:drop={(e) => addComponentToSalvageOption(e, salvageOption)}>
                                                    {#each dereferenceComponentCombination(salvageOption.results) as resultUnit}
                                                        {#await resultUnit.element.load()}
                                                            {:then nothing}
                                                                <div class="fab-component" on:click={(e) => incrementSalvageOptionComponent(salvageOption, resultUnit.element, e)} on:auxclick={decrementSalvageOptionComponent(salvageOption, resultUnit.element)}>
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
                                                            {:catch error}
                                                        {/await}
                                                    {/each}
                                                </div>
                                            {:else}
                                                <div class="fab-no-salvage-results fab-drop-zone fab-row" on:drop|preventDefault={(e) => addComponentToSalvageOption(e, salvageOption, false)}>
                                                    <i class="fa-solid fa-plus"></i>
                                                </div>
                                            {/if}
                                            <h4 class="fab-section-title">{localization.localize(`${localizationPath}.component.labels.catalystsHeading`)}</h4>
                                            {#if salvageOption.requiresCatalysts}
                                                <div class="fab-component-grid fab-grid-4 fab-scrollable fab-salvage-option-catalysts" on:drop={(e) => addComponentToSalvageOption(e, salvageOption, true)}>
                                                    {#each dereferenceComponentCombination(salvageOption.catalysts) as catalystUnit}
                                                        {#await catalystUnit.element.load()}
                                                            {:then nothing}
                                                                <div class="fab-component" on:click={(e) => incrementSalvageOptionComponent(salvageOption, catalystUnit.element, e)} on:auxclick={decrementSalvageOptionComponent(salvageOption, catalystUnit.element, true)}>
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
                                                            {:catch error}
                                                        {/await}
                                                    {/each}
                                                </div>
                                            {:else}
                                                <div class="fab-no-salvage-catalysts fab-drop-zone fab-row" on:drop|preventDefault={(e) => addComponentToSalvageOption(e, salvageOption, true)}>
                                                    <i class="fa-solid fa-plus"></i>
                                                </div>
                                            {/if}
                                        </div>
                                    </TabPanel>
                                {/each}
                                <TabPanel>
                                    <div class="fab-column">
                                        <div class="fab-row">
                                            <h3 class="fab-section-title">{localization.localize(`${localizationPath}.component.labels.resultsHeading`)}</h3>
                                        </div>
                                        <div class="fab-not-salvageable fab-drop-zone fab-row" on:drop|preventDefault={(e) => addSalvageOption(e, false)}>
                                            <i class="fa-solid fa-plus"></i>
                                        </div>
                                        <div class="fab-row">
                                            <h3 class="fab-section-title">{localization.localize(`${localizationPath}.component.labels.catalystsHeading`)}</h3>
                                        </div>
                                        <div class="fab-not-salvageable fab-drop-zone fab-row" on:drop|preventDefault={(e) => addSalvageOption(e, true)}>
                                            <i class="fa-solid fa-plus"></i>
                                        </div>
                                    </div>
                                </TabPanel>
                            </Tabs>
                        </div>
                    {:else}
                        <div class="fab-not-salvageable fab-drop-zone fab-row" on:drop|preventDefault={(e) => addSalvageOption(e, false)}>
                            <i class="fa-solid fa-plus"></i>
                        </div>
                        <div class="fab-row">
                            <h3 class="fab-section-title">{localization.localize(`${localizationPath}.component.labels.catalystsHeading`)}</h3>
                        </div>
                        <div class="fab-not-salvageable fab-drop-zone fab-row" on:drop|preventDefault={(e) => addSalvageOption(e, true)}>
                            <i class="fa-solid fa-plus"></i>
                        </div>
                    {/if}
                </div>
            </div>
            <div class="fab-salvage-options fab-columns">
                <div class="fab-column">
                    <div class="fab-row">
                        <h3>{localization.localize(`${localizationPath}.component.labels.availableComponentsHeading`)}</h3>
                    </div>
                    <div class="fab-row fab-search fab-salvage-search">
                        <p class="fab-label fab-inline">{localization.localize(`${localizationPath}.search.name`)}: </p>
                        <input type="text" bind:value={$searchTerms.name} />
                        <button class="clear-search" data-tooltip={localization.localize(`${localizationPath}.search.clear`)} on:click={clearSearch}><i class="fa-regular fa-circle-xmark"></i></button>
                    </div>
                    <div class="fab-row">
                        {#if $salvageSearchResults.length > 0}
                            <div class="fab-component-grid fab-grid-4 fab-scrollable fab-salvage-source">
                                {#each $salvageSearchResults as component}
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
                            <div class="fab-no-salvage-opts"><p>{localization.localize(`${localizationPath}.component.info.noMatchingSalvage`)}</p></div>
                        {:else}
                            <div class="fab-no-salvage-opts"><p>{localization.format(`${localizationPath}.component.info.noAvailableSalvage`, { systemName: $selectedCraftingSystem.details.name, componentName: selectedComponent.name })}</p></div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
        <div class="fab-row">
            <h3>{localization.localize(`${localizationPath}.component.labels.essencesHeading`)}</h3>
        </div>
        <div class="fab-row">
            <div class="fab-component-essences">
                {#if $essences.length > 0}
                    {#each $componentEssences as essenceUnit}
                        <div class="fab-component-essence-adjustment">
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
                    <div class="fab-no-essence-opts"><p>{localization.format(`${localizationPath}.component.info.noAvailableEssences`, { systemName: $selectedCraftingSystem.details.name, componentName: $selectedComponent.name })}</p></div>
                {/if}
            </div>
        </div>
    </div>
{/if}