<!-- ActorCraftingApp.svelte -->
<script lang="ts">

import {AppShell} from "@skeletonlabs/skeleton";

</script>

<AppShell slotSidebarLeft="bg-surface-800 w-56 p-4">

<svelte:fragment slot="sidebarLeft">
    <!-- Insert the list: -->
    <nav class="list-nav">
        <ul>
            <li>Home</li>
            <li>About</li>
        </ul>
    </nav>
    <!-- --- -->
</svelte:fragment>

</AppShell>
