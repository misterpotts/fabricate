<!-- CraftingSystemManager.svelte -->
<script>
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs.ts';
    import Properties from "../../scripts/Properties";
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";
    import CraftingSystemDetails from "./CraftingSystemDetails.svelte";
    import {CraftingSystemManagerApp, key} from "./CraftingSystemManagerApp";
    import ComponentsTab from "./ComponentsTab.svelte";
    import EssenceEditor from "./EssenceEditor.svelte";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();
    import eventBus from "../common/EventBus";
    import {onMount, setContext} from "svelte";

    import {CraftingSystemsStore} from "../stores/CraftingSystemsStore";
    import {SelectedCraftingSystemStore} from "../stores/SelectedCraftingSystemStore";
    import {RecipesStore} from "../stores/RecipesStore";
    import {CraftingComponentsStore} from "../stores/CraftingComponentsStore";
    import {SelectedRecipeStore} from "../stores/SelectedRecipeStore";
    import {SelectedCraftingComponentStore} from "../stores/SelectedCraftingComponentStore";
    import {CraftingSystemEditor} from "./CraftingSystemEditor";
    import {LoadingStore} from "../common/LoadingStore";
    import LoadingModal from "../common/LoadingModal.svelte";
    import {CraftingComponentEditor} from "./CraftingComponentEditor";

    export let systemRegistry;
    export let gameProvider;
    export let localization;

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp`
    const loading = new LoadingStore({});

    const craftingSystems = new CraftingSystemsStore({});
    const selectedCraftingSystem = new SelectedCraftingSystemStore({craftingSystems});
    const recipes = new RecipesStore({selectedCraftingSystem});
    const craftingComponents = new CraftingComponentsStore({selectedCraftingSystem});
    const selectedRecipe = new SelectedRecipeStore({recipes});
    const selectedComponent = new SelectedCraftingComponentStore({craftingComponents});

    const craftingSystemEditor = new CraftingSystemEditor({
        craftingSystems,
        systemRegistry,
        game: gameProvider.globalGameObject(),
        localization
    });

    const craftingComponentEditor = new CraftingComponentEditor({ craftingSystemEditor, localization });

    setContext(key, {
        craftingSystems,
        selectedCraftingSystem,
        recipes,
        craftingComponents,
        selectedRecipe,
        selectedComponent,
        craftingSystemEditor,
        localization,
        loading,
        craftingComponentEditor
    });

    onMount(async () => {
        const allSystemsById = await systemRegistry.getAllCraftingSystems();
        $craftingSystems = Array.from(allSystemsById.values());
    });

    function handleItemDeleted(event) {
        craftingSystemManager.craftingSystemsStore.handleItemDeleted(event.detail.uuid);
    }

</script>

<svelte:window on:itemDeleted={(e) => handleItemDeleted(e)} use:eventBus='{"itemDeleted"}'></svelte:window>

<LoadingModal loading={$loading} />

<CraftingSystemNavbar />

{#if $craftingSystems.length > 0}
    <Tabs class="fab-main">

        <TabList class="fab-main-nav">
            <Tab><i class="fa-solid fa-file-lines"></i>{localization.localize(`${localizationPath}.tabs.details.label`)}</Tab>
            <Tab><i class="fa-solid fa-boxes-stacked"></i>{localization.localize(`${localizationPath}.tabs.components.label`)}</Tab>
            <Tab><i class="fa-solid fa-scroll"></i>{localization.localize(`${localizationPath}.tabs.recipes.label`)}</Tab>
            <Tab><i class="fa-solid fa-eye-dropper"></i>{localization.localize(`${localizationPath}.tabs.essences.label`)}</Tab>
            <Tab><i class="fa-solid fa-flask-vial"></i>{localization.localize(`${localizationPath}.tabs.alchemy.label`)}</Tab>
        </TabList>

        <TabPanel class="fab-scrollable fab-columns">
            <CraftingSystemDetails />
        </TabPanel>

        <TabPanel class="fab-scrollable fab-columns">
            <ComponentsTab />
        </TabPanel>

        <TabPanel class="fab-scrollable fab-columns">
            <div class="fab-hero-banner">
                <img src="{Properties.ui.banners.recipeEditor}" >
            </div>
        </TabPanel>

        <TabPanel class="fab-scrollable fab-columns">
            <EssenceEditor />
        </TabPanel>

        <TabPanel class="fab-scrollable fab-columns">
            <div class="fab-column">
                <div class="fab-hero-banner fab-row">
                    <img src="{Properties.ui.banners.alchemyEditor}" >
                </div>
                <div style="display: inline-flex; height: 100%; width: 100%; align-items: center; justify-content: center"><i class="fa-solid fa-heart-crack" style="margin-right: 10px;"></i> Not yet implemented</div>
            </div>
        </TabPanel>

    </Tabs>
    <div class="fab-no-systems">

    </div>
{/if}