<script lang="ts">
    import {CraftingSystemManagerApp} from "./CraftingSystemManagerApp";
    import ComponentsBrowser from "./ComponentsBrowser.svelte";
    import ComponentEditor from "./ComponentEditor.svelte";
    const craftingSystemManager = CraftingSystemManagerApp.getInstance();

    export let selectedComponent;

    craftingSystemManager.selectedComponentStore.selectedComponent.subscribe(component => {
        selectedComponent = component;
    });

</script>

{#if !selectedComponent}
    <ComponentsBrowser />
{:else}
    <ComponentEditor />
{/if}

