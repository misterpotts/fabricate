<!-- CraftingSystemManager.svelte -->
<script lang="ts">
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs.ts';
    import Properties from "../../scripts/Properties";
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";
    import CraftingSystemDetails from "./CraftingSystemDetails.svelte";
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import ComponentsTab from "./ComponentsTab.svelte";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();
</script>

<CraftingSystemNavbar />

<Tabs>

    <TabList>
        <Tab><i class="fa-solid fa-file-lines"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.details.label`)}</Tab>
        <Tab><i class="fa-solid fa-boxes-stacked"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.components.label`)}</Tab>
        <Tab><i class="fa-solid fa-scroll"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.recipes.label`)}</Tab>
        <Tab><i class="fa-solid fa-eye-dropper"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.label`)}</Tab>
        <Tab><i class="fa-solid fa-flask-vial"></i>{craftingSystemManager.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.alchemy.label`)}</Tab>
    </TabList>

    <TabPanel>
        <CraftingSystemDetails />
    </TabPanel>

    <TabPanel>
        <ComponentsTab />
    </TabPanel>

    <TabPanel>
        <h2>Recipes</h2>
    </TabPanel>

    <TabPanel>
        <h2>Essences</h2>
    </TabPanel>

    <TabPanel style="height:100%">
        <div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center"><i class="fa-solid fa-heart-crack" style="margin-right: 10px;"></i> Not yet implemented</div>
    </TabPanel>

</Tabs>