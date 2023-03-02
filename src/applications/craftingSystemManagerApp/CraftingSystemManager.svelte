<!-- CraftingSystemManager.svelte -->
<script lang="ts">
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs.ts';
    import Properties from "../../scripts/Properties";
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";
    import CraftingSystemDetails from "./CraftingSystemDetails.svelte";
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import ComponentsTab from "./ComponentsTab.svelte";
    import EssenceEditor from "./EssenceEditor.svelte";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();
    import eventBus from "../componentSalvageApp/EventBus";

    function handleItemDeleted(event) {
        craftingSystemManager.craftingSystemsStore.handleItemDeleted(event.detail.uuid);
    }

</script>

<svelte:window on:itemDeleted={(e) => handleItemDeleted(e)} use:eventBus='{"itemDeleted"}'></svelte:window>

<CraftingSystemNavbar />

<Tabs class="fab-main">

    <TabList class="fab-main-nav">
        <Tab><i class="fa-solid fa-file-lines"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.details.label`)}</Tab>
        <Tab><i class="fa-solid fa-boxes-stacked"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.label`)}</Tab>
        <Tab><i class="fa-solid fa-scroll"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes.label`)}</Tab>
        <Tab><i class="fa-solid fa-eye-dropper"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.label`)}</Tab>
        <Tab><i class="fa-solid fa-flask-vial"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.alchemy.label`)}</Tab>
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