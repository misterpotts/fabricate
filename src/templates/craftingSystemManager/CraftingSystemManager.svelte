<!-- CraftingSystemManager.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs.ts';
    import { onDestroy, setContext } from 'svelte';
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";
    import { key } from "./CraftingSystemManagerApp"
    import NavbarState from "./CraftingSystemNavbarState.ts";

    export let systems = [];
    export let systemRegistry = {};

    NavbarState.setSystems(systems);
    setContext(key, {
        navbar: NavbarState
    });

</script>

<CraftingSystemNavbar />

<section class="fab-crafting-system">

    <Tabs>

        <TabList>
            <Tab><i class="fa-solid fa-file-lines"></i> Details</Tab>
            <Tab><i class="fa-solid fa-boxes-stacked"></i> Components</Tab>
            <Tab><i class="fa-solid fa-scroll"></i> Recipes</Tab>
            <Tab><i class="fa-solid fa-eye-dropper"></i> Essences</Tab>
            <Tab><i class="fa-solid fa-flask-vial"></i> Alchemy</Tab>
        </TabList>

        <TabPanel>
            <h2>Details</h2>
        </TabPanel>

        <TabPanel>
            <h2>Components</h2>
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

</section>