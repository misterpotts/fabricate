<script lang="ts">
    import {key} from "../CraftingSystemManagerApp";
    import Properties from "../../../scripts/Properties.js";
    import {DropEventParser} from "../../common/DropEventParser";
    import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
    import {Combination, Unit} from "../../../scripts/common/Combination";
    import truncate from "../../common/Truncate";
    import {SalvageOption} from "../../../scripts/common/CraftingComponent";
    import {Tab, Tabs} from "../../common/FabricateTabs.js";
    import TabList from "../../common/TabList.svelte";
    import TabPanel from "../../common/TabPanel.svelte";
    import {componentUpdated} from "../../common/EventBus";
    import {getContext, onDestroy} from "svelte";
    import {SalvageSearchStore} from "../../stores/SalvageSearchStore";
    import {ComponentEssenceStore} from "../../stores/ComponentEssenceStore";

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.components`;
    let selectPreviousTab;

    const {
        localization,
        loading,
        selectedComponent,
        craftingComponents,
        selectedCraftingSystem,
        craftingComponentEditor
    } = getContext(key);

    const salvageSearchResults = new SalvageSearchStore({ selectedComponent, availableComponents: craftingComponents });
    const searchTerms = salvageSearchResults.searchTerms;
    const componentEssences = new ComponentEssenceStore({selectedCraftingSystem, selectedComponent});

    function deselectComponent() {
        $selectedComponent = null;
    }

    async function replaceItem(event) {
        $loading = true;
        await craftingComponentEditor.replaceItem(event, $selectedCraftingSystem, $selectedComponent);
        $loading = false;
    }
    
    async function incrementEssence(essence) {
        $loading = true;
        $selectedComponent.essences = $selectedComponent.essences.add(new Unit(essence, 1));
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        $loading = false;
    }

    async function decrementEssence(essence) {
        $loading = true;
        $selectedComponent.essences = $selectedComponent.essences.minus(new Unit(essence, 1));
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        $loading = false;
    }

    function clearSearch() {
        salvageSearchResults.clear();
    }

    async function addSalvageOption(event) {
        $loading = true;
        const dropEventParser = new DropEventParser({
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $craftingComponents
        });
        const component = (await dropEventParser.parse(event)).component;
        const name = generateOptionName($selectedComponent);
        const salvageOption = new SalvageOption({name, salvage: Combination.of(component, 1)});
        $selectedComponent.addSalvageOption(salvageOption);
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        if ($selectedComponent.salvageOptions.length > 1) {
            selectPreviousTab();
        }
        $loading = false;
        componentUpdated($selectedComponent);
    }

    function generateOptionName(component) {
        if (!component.isSalvageable) {
            return localization.format(`${Properties.module.id}.typeNames.component.salvageOption.name`, { number: 1 });
        }
        const existingNames = component.salvageOptions.map(salvageOption => salvageOption.name);
        let nextOptionNumber = 2;
        let nextOptionName;
        do {
            nextOptionName = localization.format(`${Properties.module.id}.typeNames.component.salvageOption.name`, { number: nextOptionNumber });
            nextOptionNumber++;
        } while (existingNames.includes(nextOptionName));
        return nextOptionName;
    }
    
    function dragStart(event, component) {
        event.dataTransfer.setData('application/json', DropEventParser.serialiseComponentData(component));
    }

    let scheduledSave;
    function scheduleSave() {
        clearTimeout(scheduledSave);
        scheduledSave = setTimeout(async () => {
            $loading = true;
            await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
            $loading = false;
        }, 1000);
    }
    
    async function deleteSalvageOption(optionToDelete) {
        $loading = true;
        $selectedComponent.deleteSalvageOptionByName(optionToDelete.name);
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        $loading = false;
        componentUpdated($selectedComponent);
    }

    async function addComponentToSalvageOption(event, salvageOption) {
        $loading = true;
        const dropEventParser = new DropEventParser({
            localizationService: localization,
            documentManager: new DefaultDocumentManager(),
            partType: localization.localize(`${Properties.module.id}.typeNames.component.singular`),
            allowedCraftingComponents: $craftingComponents
        });
        const component = (await dropEventParser.parse(event)).component;
        salvageOption.add(component);
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        $loading = false;
        componentUpdated($selectedComponent);
    }

    async function decrementSalvageOptionComponent(salvageOption, component) {
        $loading = true;
        salvageOption.subtract(component);
        if (salvageOption.isEmpty) {
            return deleteSalvageOption(salvageOption);
        }
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        $loading = false;
        componentUpdated($selectedComponent);
    }

    async function incrementSalvageOptionComponent(salvageOption, component, event) {
        if (event && event.shiftKey) {
            return decrementSalvageOptionComponent(salvageOption, component);
        }
        $loading = true;
        salvageOption.add(component);
        await craftingComponentEditor.saveComponent($selectedComponent, $selectedCraftingSystem);
        $loading = false;
        componentUpdated($selectedComponent);
    }

    function sortByName(salvageOption) {
        return salvageOption.sort((left, right) => left.name.localeCompare(right.name));
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
                            <Tabs bind:selectPreviousTab={selectPreviousTab}>
                                <TabList>
                                    {#each sortByName($selectedComponent.salvageOptions) as salvageOption}
                                        <Tab>{salvageOption.name}</Tab>
                                    {/each}
                                    <Tab><i class="fa-regular fa-square-plus"></i> {localization.localize(`${localizationPath}.component.labels.newSalvageOption`)}</Tab>
                                </TabList>
                                {#each sortByName($selectedComponent.salvageOptions) as salvageOption}
                                    <TabPanel class="fab-columns">
                                        <div class="fab-column">
                                            <div class="fab-option-controls fab-row">
                                                <div class="fab-option-name">
                                                    <p>{localization.localize(`${localizationPath}.component.labels.salvageName`)}</p>
                                                    <div class="fab-editable" contenteditable="true" bind:textContent={salvageOption.name} on:input={scheduleSave}>{salvageOption.name}</div>
                                                </div>
                                                <button class="fab-delete-salvage-opt" on:click={deleteSalvageOption(salvageOption)}><i class="fa-solid fa-trash fa-fw"></i> {localization.localize(`${localizationPath}.component.buttons.deleteSalvageOption`)}</button>
                                            </div>
                                            <div class="fab-component-grid fab-grid-4 fab-scrollable fab-salvage-option-actual" on:drop={(e) => addComponentToSalvageOption(e, salvageOption)}>
                                                {#each salvageOption.salvage.units as salvageUnit}
                                                    <div class="fab-component" on:click={(e) => incrementSalvageOptionComponent(salvageOption, salvageUnit.part, e)} on:auxclick={decrementSalvageOptionComponent(salvageOption, salvageUnit.part)}>
                                                        <div class="fab-component-name">
                                                            <p>{truncate(salvageUnit.part.name, 9)}</p>
                                                        </div>
                                                        <div class="fab-component-preview">
                                                            <div class="fab-component-image" data-tooltip={salvageUnit.part.name}>
                                                                <img src={salvageUnit.part.imageUrl} alt={salvageUnit.part.name} />
                                                                {#if salvageUnit.quantity > 1}
                                                                    <span class="fab-component-info fab-component-quantity">{salvageUnit.quantity}</span>
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
                                    <div class="fab-drop-zone fab-new-salvage-opt" on:drop|preventDefault={(e) => addSalvageOption(e)}>
                                        <i class="fa-solid fa-plus"></i>
                                    </div>
                                </TabPanel>
                            </Tabs>
                        </div>
                    {:else}
                        <div class="fab-not-salvageable fab-drop-zone fab-row" on:drop|preventDefault={(e) => addSalvageOption(e)}>
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
                            <div class="fab-no-salvage-opts"><p>{localization.format(`${localizationPath}.component.info.noAvailableSalvage`, { systemName: $selectedCraftingSystem.name, componentName: selectedComponent.name })}</p></div>
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
                {#if $selectedCraftingSystem.hasEssences}
                    {#each $componentEssences as essenceUnit}
                        <div class="fab-component-essence-adjustment">
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
                    <div class="fab-no-essence-opts"><p>{localization.format(`${localizationPath}.component.info.noAvailableEssences`, { systemName: $selectedCraftingSystem.name, componentName: selectedComponent.name })}</p></div>
                {/if}
            </div>
        </div>
    </div>
{/if}