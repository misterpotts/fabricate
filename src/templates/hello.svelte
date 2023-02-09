<!-- Hello.svelte -->
<script lang="ts">
    export let name;

    function handleClick() {
        name = "fuck off";
    }
</script>

<div>Hello {name}!</div>

<div>
    <p>Just gonna write stuff and see it appear in foundry</p>
    <button on:click={handleClick}>Click</button>
</div>