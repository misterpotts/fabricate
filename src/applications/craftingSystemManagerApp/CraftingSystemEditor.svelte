<!-- CraftingSystemEditor.svelte -->
<script lang="ts">
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs';
    import Properties from "../../scripts/Properties";
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";
    import CraftingSystemDetails from "./detailsManager/CraftingSystemDetails.svelte";
    import {key} from "./CraftingSystemManagerApp";
    import ComponentsTab from "./componentManager/ComponentsTab.svelte";
    import {CraftingSystemsStore} from "../stores/CraftingSystemsStore";
    import {SelectedCraftingSystemStore} from "../stores/SelectedCraftingSystemStore";
    import {RecipesStore} from "../stores/RecipesStore";
    import {ComponentsStore} from "../stores/ComponentsStore";
    import {SelectedRecipeStore} from "../stores/SelectedRecipeStore";
    import {SelectedCraftingComponentStore} from "../stores/SelectedCraftingComponentStore";

    import eventBus from "../common/EventBus";
    import {onMount, setContext} from "svelte";
    import RecipesTab from "./recipeManager/RecipesTab.svelte";
    import {CraftingSystemEditor} from "./CraftingSystemEditor";
    import {CraftingComponentEditor} from "./componentManager/CraftingComponentEditor";
    import {RecipeEditor} from "./recipeManager/RecipeEditor";
    import {EssencesStore} from "../stores/EssenceStore";
    import EssenceEditorComponent from "./essenceManager/EssenceEditorComponent.svelte";
    import {EssenceEditor} from "./essenceManager/EssenceEditor";
    import type {LocalizationService} from "../common/LocalizationService";
    import type {FabricateAPI} from "../../scripts/api/FabricateAPI";

    export let localization: LocalizationService;
    export let fabricateAPI: FabricateAPI;

    const localizationPath = `${Properties.module.id}.CraftingSystemManagerApp`

    const craftingSystems = new CraftingSystemsStore({});
    const selectedCraftingSystem = new SelectedCraftingSystemStore({ craftingSystems });

    const essences = new EssencesStore({ selectedCraftingSystem, fabricateAPI });
    const components = new ComponentsStore({ selectedCraftingSystem, fabricateAPI, initialValue: [] });
    const recipes = new RecipesStore({ selectedCraftingSystem, fabricateAPI });

    const essenceEditor = new EssenceEditor({ fabricateAPI, essences, localization, components, recipes });
    const componentEditor = new CraftingComponentEditor({ fabricateAPI, components: components, localization, recipes });
    const recipeEditor = new RecipeEditor({ fabricateAPI, recipes, components, localization });

    const selectedRecipe = new SelectedRecipeStore({recipes: recipes});
    const selectedComponent = new SelectedCraftingComponentStore({craftingComponents: components});

    const craftingSystemEditor = new CraftingSystemEditor({fabricateAPI, craftingSystems, localization, components, recipes });

    setContext(key, {
        craftingSystems,
        selectedCraftingSystem,
        craftingSystemEditor,
        essences,
        essenceEditor,
        recipes,
        selectedRecipe,
        recipeEditor,
        components,
        selectedComponent,
        componentEditor,
        localization
    });

    onMount(async () => {
        const craftingSystemsById = await fabricateAPI.systems.getAll();
        $craftingSystems = Array.from(craftingSystemsById.values());
    });

    async function handleItemDeleted(_event) {

    }

</script>


<svelte:window on:itemDeleted={(e) => handleItemDeleted(e)} use:eventBus='{"itemDeleted"}'></svelte:window>

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
            <RecipesTab />
        </TabPanel>

        <TabPanel class="fab-scrollable fab-columns">
            <EssenceEditorComponent />
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