<script lang="ts">
    import { key } from "../CraftingSystemManagerApp";
    import ComponentsBrowser from "./ComponentsBrowser.svelte";
    import ComponentEditor from "./ComponentEditor.svelte";
    import { getContext } from "svelte";

    const { selectedComponent } = getContext(key);

</script>

{#if !$selectedComponent}
    <ComponentsBrowser />
{:else}
    <ComponentEditor />
{/if}

