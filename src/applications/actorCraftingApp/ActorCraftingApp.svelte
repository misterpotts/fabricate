<!-- ActorCraftingApp.svelte -->
<script lang="ts">

    import {AppBar, AppRail, AppRailAnchor, AppRailTile, AppShell} from "@skeletonlabs/skeleton";

    let view: string = "recipes";

</script>

<AppShell>
    <svelte:fragment slot="sidebarLeft">
        <AppRail background="bg-surface-600">
            <AppRailTile bind:group={view} name="recipes" value={"recipes"} title="recipes">
                <svelte:fragment slot="lead"><i class="fa-solid fa-book"></i></svelte:fragment>
                <span>Recipes</span>
            </AppRailTile>
            <AppRailTile bind:group={view} name="components" value={"components"} title="components">
                <svelte:fragment slot="lead"><i class="fa-solid fa-toolbox"></i></svelte:fragment>
                <span>Components</span>
            </AppRailTile>
        </AppRail>
    </svelte:fragment>
    <slot>
        <div class="bg-surface grid-cols-5">
            <div>Hello from the crafting app</div>
        </div>
    </slot>
</AppShell>


