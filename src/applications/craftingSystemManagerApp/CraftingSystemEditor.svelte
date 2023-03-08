<!-- CraftingSystemEditor.svelte -->
<script>
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs.ts';
    import Properties from "../../scripts/Properties.ts";
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";
    import CraftingSystemDetails from "./detailsManager/CraftingSystemDetails.svelte";
    import {key} from "./CraftingSystemManagerApp.ts";
    import ComponentsTab from "./componentManager/ComponentsTab.svelte";
    import EssenceEditor from "./essenceManager/EssenceEditor.svelte";
    import {CraftingSystemsStore} from "../stores/CraftingSystemsStore.ts";
    import {SelectedCraftingSystemStore} from "../stores/SelectedCraftingSystemStore.ts";
    import {RecipesStore} from "../stores/RecipesStore.ts";
    import {CraftingComponentsStore} from "../stores/CraftingComponentsStore.ts";
    import {SelectedRecipeStore} from "../stores/SelectedRecipeStore.ts";
    import {SelectedCraftingComponentStore} from "../stores/SelectedCraftingComponentStore.ts";
    import {CraftingSystemEditor} from "./CraftingSystemEditor.ts";
    import {LoadingStore} from "../common/LoadingStore.ts";
    import LoadingModal from "../common/LoadingModal.svelte";
    import {CraftingComponentManager} from "./componentManager/CraftingComponentManager.ts";

    import eventBus from "../common/EventBus.ts";
    import {onMount, setContext} from "svelte";

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

    const craftingComponentEditor = new CraftingComponentManager({ craftingSystemEditor, localization });

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

    async function handleItemDeleted(event) {
        if ($selectedCraftingSystem && $selectedCraftingSystem.includesComponentByItemUuid(event.detail.item.uuid)) {
            await selectedCraftingSystem.reload();
        }
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