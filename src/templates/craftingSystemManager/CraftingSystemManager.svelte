<!-- CraftingSystemManager.svelte -->
<script lang="ts">
    import { Tabs, TabList, TabPanel, Tab } from '../common/FabricateTabs.ts';
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";

    export let systems = [
        {
            id: "1",
            name: "Crafting System 1",
            summary: "Summary details of this crafting system and its themes, component types, etc.",
            hasErrors: true,
            isLocked: false
        },
        {
            id: "2",
            name: "Crafting System 2",
            summary: "Summary details of this crafting system and its themes, component types, etc.",
            hasErrors: false,
            isLocked: false
        },
        {
            id: "3",
            name: "Crafting System 3",
            summary: "Summary details of this crafting system and its themes, component types, etc.",
            hasErrors: false,
            isLocked: true
        }
    ];
</script>

<CraftingSystemNavbar systems="{systems}" />

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

        <TabPanel>
            <h2>Alchemy</h2>
        </TabPanel>

    </Tabs>

</section>