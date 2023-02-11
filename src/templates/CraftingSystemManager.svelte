<!-- CraftingSystemManager.svelte -->
<script lang="ts">
    import { Tabs, TabList, TabPanel, Tab } from './common/tabs.ts';
    import CraftingSystemNavbar from "./CraftingSystemNavbar.svelte";

    let items = [
        {
            hasErrors: true,
            name: "Crafting System 1",
            summary: "Summary details of this crafting system and its themes, component types, etc.",
            locked: false,
            selected: false
        },
        {
            hasErrors: false,
            name: "Crafting System 2",
            summary: "Summary details of this crafting system and its themes, component types, etc.",
            locked: false,
            selected: false
        },
        {
            hasErrors: false,
            name: "Crafting System 3",
            summary: "Summary details of this crafting system and its themes, component types, etc.",
            locked: true,
            selected: true
        }
    ];
</script>

<CraftingSystemNavbar bind:items />

<section class="fab-crafting-system">

    <Tabs>

        <TabList>
            <Tab>Details</Tab>
            <Tab>Components</Tab>
            <Tab>Recipes</Tab>
            <Tab>Essences</Tab>
            <Tab>Alchemy</Tab>
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